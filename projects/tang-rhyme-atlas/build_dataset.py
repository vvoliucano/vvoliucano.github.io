"""Build the browser-ready 240-character comparison set from checked-in sources."""
import csv
import json
import re
import unicodedata
import zipfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / "hanzi658"
UNIHAN_FIELDS = {"kTang", "kMandarin", "kCantonese", "kKorean", "kVietnamese"}
HAKKA_INITIALS = sorted(
    {"chh", "tsh", "ph", "th", "kh", "zh", "ch", "sh", "ng", "b", "p", "m", "f", "v", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "z", "c", "s", "r", "y", "w"},
    key=len,
    reverse=True,
)


def first_reading(value):
    return re.split(r"[ ,]", value.strip())[0].lstrip("*")


def normalized_rime(value):
    value = unicodedata.normalize("NFD", first_reading(value).lower())
    value = "".join(c for c in value if unicodedata.category(c) != "Mn")
    value = re.sub(r"[¹²³⁴⁵⁶⁷⁸⁹\d˥˦˧˨˩ˊˋˇ'.-]", "", value)
    if value in {"m", "n", "ng"}:
        return f"成音节{value}"
    return re.sub(r"^(tsh|tsr|shr|dzh|ch|sh|zh|ng|ny|th|ph|kh|kw|gw|tr|ts|dz|bh|[bpmfdtnlgkhjqxrzcswy])", "", value) or value


def hakka_rime(value):
    """Extract the PFS final using the MOE Hakka onset inventory."""
    value = unicodedata.normalize("NFD", first_reading(value).lower())
    value = "".join(c for c in value if unicodedata.category(c) != "Mn")
    value = re.sub(r"[¹²³⁴⁵⁶⁷⁸⁹\d˥˦˧˨˩ˊˋˇ'.-]", "", value)
    if value in {"m", "n", "ng"}:
        return f"成音节{value}"
    for initial in HAKKA_INITIALS:
        if value.startswith(initial):
            return value[len(initial):] or "成音节声母"
    return value


def normalize_hakka_coda(value):
    return re.sub(r"b$", "p", re.sub(r"d$", "t", re.sub(r"g$", "k", value)))


readings = defaultdict(dict)
with zipfile.ZipFile(SOURCE / "Unihan.zip") as archive:
    for line in archive.read("Unihan_Readings.txt").decode().splitlines():
        if not line or line.startswith("#"):
            continue
        codepoint, field, value = line.split("\t", 2)
        if field in UNIHAN_FIELDS:
            readings[chr(int(codepoint[2:], 16))][field] = value

hakka = {}
with (SOURCE / "hakka_sixian_source.csv").open(encoding="utf-8") as source:
    for row in csv.DictReader(source):
        char = (row.get("詞目") or "").strip()
        pfs = (row.get("PFS") or "").strip()
        display = (row.get("音讀（符號）") or "").strip()
        if row.get("Dialect") == "四縣腔" and len(char) == 1 and pfs and display:
            hakka.setdefault(char, {"pfs": pfs, "display": display})

frequency_order = []
with (SOURCE / "hanzi658.csv").open(encoding="utf-8-sig") as source:
    for row in csv.DictReader(source):
        for char in row["hanzi"]:
            if "\u4e00" <= char <= "\u9fff" and char not in frequency_order:
                frequency_order.append(char)

records = []
for char in frequency_order:
    item = readings[char]
    if not UNIHAN_FIELDS.issubset(item) or char not in hakka:
        continue
    records.append({
        "char": char,
        "mc": first_reading(item["kTang"]),
        "mc_rime": normalized_rime(item["kTang"]),
        "mandarin": first_reading(item["kMandarin"]),
        "cantonese": first_reading(item["kCantonese"]),
        "hakka": first_reading(hakka[char]["display"]),
        "hakka_pfs": first_reading(hakka[char]["pfs"]),
        "hakka_rime": hakka_rime(hakka[char]["pfs"]),
        "korean": first_reading(item["kKorean"]),
        "vietnamese": first_reading(item["kVietnamese"]),
        "source": "Unicode Unihan 17.0 + 客語辭典四縣腔",
    })
    if len(records) == 240:
        break

output = "window.TANG_RHYME_DATA = " + json.dumps(records, ensure_ascii=False, separators=(",", ":")) + ";\n"
(ROOT / "data-240.js").write_text(output, encoding="utf-8")
print(f"Wrote {len(records)} records to {ROOT / 'data-240.js'}")
