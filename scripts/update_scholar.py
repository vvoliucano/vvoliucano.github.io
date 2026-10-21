"""Fetch public Google Scholar citation statistics; never publish failed fetches."""

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup


def parse_profile(html, author_id):
    soup = BeautifulSoup(html, "html.parser")
    profile = soup.select_one("#gsc_prf_in")
    total = soup.select_one("#gsc_rsb_st .gsc_rsb_std")
    years = soup.select("#gsc_rsb_cit .gsc_g_t")
    counts = soup.select("#gsc_rsb_cit .gsc_g_al")
    if not profile or not total or not years or len(years) != len(counts):
        raise ValueError("Scholar profile unavailable, blocked, or markup changed")

    def number(text):
        value = int(text.replace(",", "").strip())
        if value < 0:
            raise ValueError("Negative citation count")
        return value

    per_year = {}
    for year, count in zip(years, counts):
        label = year.get_text(strip=True)
        if len(label) != 4 or not label.isascii() or not label.isdigit() or label in per_year:
            raise ValueError("Invalid or duplicate citation year")
        per_year[label] = number(count.get_text(strip=True))
    citedby = number(total.get_text(strip=True))
    if sum(per_year.values()) > citedby:
        raise ValueError("Annual citations exceed total citations")
    return {
        "author_id": author_id,
        "name": profile.get_text(strip=True),
        "updated": datetime.now(timezone.utc).isoformat(),
        "citedby": citedby,
        "cites_per_year": per_year,
    }


def main():
    author_id = os.environ.get("GOOGLE_SCHOLAR_ID", "c_qeUtUAAAAJ")
    url = "https://scholar.google.com/citations?" + urlencode({"user": author_id, "hl": "en"})
    for attempt in range(3):
        try:
            request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urlopen(request, timeout=45) as response:
                data = parse_profile(response.read(), author_id)
            break
        except Exception:
            if attempt == 2:
                raise
            time.sleep(5 * (attempt + 1))
    output = Path(os.environ.get("SCHOLAR_OUTPUT", "assets/data/scholar.json"))
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(output)
    print(f"Updated {data['name']}: {data['citedby']} citations; {len(data['cites_per_year'])} years")


if __name__ == "__main__":
    main()
