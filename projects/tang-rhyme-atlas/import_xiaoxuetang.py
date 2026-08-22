"""Import representative-point finals from Xiaoxuetang public query forms."""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / ".cache" / "xiaoxuetang"
POINTS = {
    "jin": ("Jinyu", "太原"), "wu": ("Wuyu", "蘇州"),
    "hui": ("Huiyu", "績溪"), "gan": ("Ganyu", "南昌"),
    "xiang": ("Xiangyu", "長沙"), "min": ("Minyu", "廈門"),
}
CACHE_ONLY = "--cache-only" in sys.argv

def values(fragment, class_name="YinValueB"):
    cells = re.findall(r'<td class="%s">(.*?)</td>' % class_name, fragment, re.S)
    return [html.unescape(re.sub(r"<.*?>", "", cell)).strip() for cell in cells]

def parse_page(page, point):
    middle = re.search(r">中古音</p>(.*?)>國語</p>", page, re.S)
    dialect = re.search(r'id="DialectTable">(.*?)</table>', page, re.S)
    guangyun = values(middle.group(1)) if middle else []
    reading = None
    for row in re.findall(r"<tr>(.*?)</tr>", dialect.group(1), re.S) if dialect else []:
        cells = values(row)
        if point in cells and len(cells) >= 8:
            reading = dict(zip(("division", "subdivision", "point", "initial", "final",
                                "tone_value", "tone_class", "note"), cells[:8]))
            break
    return {"guangyun_she": guangyun[0] if len(guangyun) > 0 else "",
            "guangyun_tone": guangyun[1] if len(guangyun) > 1 else "",
            "guangyun_rhyme": guangyun[2] if len(guangyun) > 2 else "",
            "reading": reading}

def fetch(system, route, point, char):
    path = CACHE / system / (format(ord(char), "x") + ".html")
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        page = path.read_text(encoding="utf-8")
    else:
        if CACHE_ONLY:
            return system, char, None
        body = urllib.parse.urlencode({"EudcFontChar": char, "DialectList": point}).encode()
        url = "https://xiaoxue.iis.sinica.edu.tw/%s/PageResult/PageResult" % route
        for attempt in range(3):
            try:
                request = urllib.request.Request(
                    url, data=body,
                    headers={"User-Agent": "TangRhymeAtlas/1.0 academic verification"})
                with urllib.request.urlopen(request, timeout=45) as response:
                    page = response.read().decode("utf-8")
                break
            except Exception:
                if attempt == 2:
                    return system, char, None
                time.sleep(2 ** attempt)
        path.write_text(page, encoding="utf-8")
        time.sleep(0.2)
    return system, char, parse_page(page, point)

def main():
    text = (ROOT / "data-1000.js").read_text(encoding="utf-8")
    source = json.loads(text[text.index("["):text.rindex("]") + 1])
    output = {system: {} for system in POINTS}
    with ThreadPoolExecutor(max_workers=6) as executor:
        jobs = [executor.submit(fetch, system, route, point, row["char"])
                for system, (route, point) in POINTS.items() for row in source]
        for index, job in enumerate(as_completed(jobs), 1):
            system, char, value = job.result()
            if value is not None:
                output[system][char] = value
            if index % 100 == 0: print(index, "/", len(jobs))
    result = {"points": POINTS, "records": output}
    (ROOT / "xiaoxuetang-1000.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "xiaoxuetang-1000.js").write_text(
        "window.XIAOXUETANG_DATA = " + json.dumps(result, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")
    for system in POINTS:
        print(system, sum(bool(row["reading"]) for row in output[system].values()))

if __name__ == "__main__":
    main()
