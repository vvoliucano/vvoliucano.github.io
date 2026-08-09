#!/usr/bin/env python3
"""Download public NParks PCN route layers from ArcGIS as GeoJSON files."""

import json
import re
import ssl
import sys
import urllib.parse
import urllib.request
from pathlib import Path


WEBMAP_ITEM_ID = "0150084d86e14a409dee11f341fa799e"
PORTAL_BASE = "https://nparks.maps.arcgis.com"
OUTPUT_DIR = Path(__file__).resolve().parent / "pcn"


def fetch_json(url: str):
    """Fetch a JSON resource over HTTPS."""
    context = ssl.create_default_context()
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json,text/plain,*/*",
        },
    )
    with urllib.request.urlopen(request, context=context) as response:
        return json.load(response)


def slugify(text: str) -> str:
    """Convert a title to a filesystem-friendly slug."""
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def color_to_hex(color):
    """Convert ArcGIS RGBA color array to hex string."""
    if not isinstance(color, list) or len(color) < 3:
        return None
    return "#{:02x}{:02x}{:02x}".format(color[0], color[1], color[2])


def query_geojson(layer_url: str):
    """Query one ArcGIS feature layer and return GeoJSON."""
    params = urllib.parse.urlencode({
        "where": "1=1",
        "outFields": "*",
        "returnGeometry": "true",
        "f": "geojson",
    })
    return fetch_json(f"{layer_url}/query?{params}")


def main():
    """Download all visible PCN route layers referenced by the public web map."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    webmap_data_url = f"{PORTAL_BASE}/sharing/rest/content/items/{WEBMAP_ITEM_ID}/data?f=json"
    webmap = fetch_json(webmap_data_url)

    route_layers = []
    for operational_layer in webmap.get("operationalLayers", []):
        for layer in operational_layer.get("layers", []):
            if layer.get("layerType") != "ArcGISFeatureLayer":
                continue

            color = (
                layer.get("layerDefinition", {})
                .get("drawingInfo", {})
                .get("renderer", {})
                .get("symbol", {})
                .get("symbol", {})
                .get("symbolLayers", [{}])[0]
                .get("color")
            )

            route_layers.append({
                "title": layer.get("title"),
                "url": layer.get("url"),
                "itemId": layer.get("itemId"),
                "color": color_to_hex(color),
            })

    manifest = []
    for route in route_layers:
        geojson = query_geojson(route["url"])
        filename = f"{slugify(route['title'])}.geojson"
        output_path = OUTPUT_DIR / filename
        output_path.write_text(json.dumps(geojson, ensure_ascii=False, indent=2), encoding="utf-8")

        manifest.append({
            "title": route["title"],
            "color": route["color"],
            "service_url": route["url"],
            "geojson_file": filename,
            "feature_count": len(geojson.get("features", [])),
        })
        print(f"saved {route['title']} -> {output_path.name}")

    manifest_path = OUTPUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"saved manifest -> {manifest_path.name}")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # noqa: BLE001
        print(f"failed: {error}", file=sys.stderr)
        sys.exit(1)
