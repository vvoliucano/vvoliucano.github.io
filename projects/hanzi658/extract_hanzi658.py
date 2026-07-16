import csv
import json
import re
import unicodedata
import zipfile
from pathlib import Path

import fitz  # pylint: disable=import-error
from pypinyin import Style, lazy_pinyin  # pylint: disable=import-error
from pykakasi import kakasi  # pylint: disable=import-error


ROOT = Path("/Volumes/Can Disk/writing/vvoliucano.github.io/projects/hanzi658")
PDF_PATH = ROOT / "source.pdf"
CSV_PATH = ROOT / "hanzi658.csv"
JSON_PATH = ROOT / "words.json"
ENGLISH_TRANSLATIONS_PATH = ROOT / "english_translations.json"
UNIHAN_ZIP_PATH = ROOT / "Unihan.zip"
PAGE_RANGE = range(11, 17)
SKIP_LINES = {"No.", "KOR", "CHN", "JPN", "한중일 공통 658 단어 표"}
KOR_PATTERN = re.compile(r"^([\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff々]+)([가-힣]+)$")
KAKASI = kakasi()


def is_hangul(char: str) -> bool:
    code = ord(char)
    return 0xAC00 <= code <= 0xD7A3


def romanize_hangul_syllable(char: str) -> str:
    initial = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"]
    medial = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"]
    final = ["", "k", "k", "ks", "n", "nj", "nh", "t", "l", "lk", "lm", "lb", "ls", "lt", "lp", "lh", "m", "p", "ps", "t", "t", "ng", "t", "t", "k", "t", "p", "h"]
    code = ord(char) - 0xAC00
    lead = code // 588
    vowel = (code % 588) // 28
    tail = code % 28
    return initial[lead] + medial[vowel] + final[tail]


def romanize_hangul(text: str) -> str:
    return " ".join(romanize_hangul_syllable(char) for char in text if is_hangul(char))


def romanize_japanese(text: str) -> str:
    parts = KAKASI.convert(text)
    return " ".join(part["hepburn"].lower() for part in parts if part["hepburn"])


def romanize_chinese_pinyin(text: str) -> str:
    return " ".join(lazy_pinyin(text, style=Style.TONE))


def load_vietnamese_map():
    mapping = {}
    with zipfile.ZipFile(UNIHAN_ZIP_PATH) as archive:
        with archive.open("Unihan_Readings.txt") as file:
            for raw_line in file:
                line = raw_line.decode("utf-8").strip()
                if not line or line.startswith("#"):
                    continue
                parts = line.split("\t")
                if len(parts) != 3:
                    continue
                codepoint, field, value = parts
                if field != "kVietnamese":
                    continue
                char = chr(int(codepoint[2:], 16))
                mapping[char] = value.split()[0]
    return mapping


def romanize_vietnamese(text: str, mapping):
    parts = [mapping[char] for char in text if char in mapping]
    return " ".join(parts)


def ascii_vietnamese(text: str) -> str:
    normalized = unicodedata.normalize("NFD", text)
    stripped = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    return stripped.replace("đ", "d").replace("Đ", "D")


def parse_entry(number: int, kor_raw: str, chinese: str, japanese: str, vietnamese_map):
    match = KOR_PATTERN.match(kor_raw)
    if not match:
        return None

    kor_hanja, hangul = match.groups()
    return {
        "no": number,
        "hanzi": chinese,
        "kor_hanja": kor_hanja,
        "hangul": hangul,
        "romanization": romanize_hangul(hangul),
        "chinese": chinese,
        "chinese_pinyin": romanize_chinese_pinyin(chinese),
        "japanese": japanese,
        "japanese_romanization": romanize_japanese(japanese),
        "vietnamese": romanize_vietnamese(kor_hanja, vietnamese_map),
        "vietnamese_romanization": ascii_vietnamese(romanize_vietnamese(kor_hanja, vietnamese_map)),
    }


def extract_from_pdf():
    pdf = fitz.open(PDF_PATH)
    vietnamese_map = load_vietnamese_map()
    entries = []

    for page_number in PAGE_RANGE:
        page = pdf.load_page(page_number)
        lines = [line.strip() for line in page.get_text("text").splitlines() if line.strip()]
        index = 0

        while index < len(lines):
            current = lines[index]
            if current in SKIP_LINES:
                index += 1
                continue

            number = None
            kor_raw = None
            same_line = re.match(r"^(\d{1,3})\s+(.+)$", current)
            if same_line:
                number = int(same_line.group(1))
                kor_raw = same_line.group(2)
                index += 1
            elif re.fullmatch(r"\d{1,3}", current) and index + 1 < len(lines):
                number = int(current)
                kor_raw = lines[index + 1]
                index += 2
            else:
                index += 1
                continue

            if number is None or not (1 <= number <= 658):
                continue
            if index + 1 >= len(lines):
                break

            chinese = lines[index]
            japanese = lines[index + 1]
            index += 2

            if chinese in SKIP_LINES or japanese in SKIP_LINES:
                continue

            entry = parse_entry(number, kor_raw, chinese, japanese, vietnamese_map)
            if entry:
                entries.append(entry)

    deduped = {entry["no"]: entry for entry in entries}
    words = [deduped[number] for number in sorted(deduped)]
    if len(words) != 658:
        raise RuntimeError(f"Expected 658 entries, got {len(words)}")
    return words


def write_outputs(words):
    with ENGLISH_TRANSLATIONS_PATH.open(encoding="utf-8") as file:
        english_translations = json.load(file)

    for word in words:
        word["english"] = english_translations.get(str(word["no"]), "")

    missing_english = [word["no"] for word in words if not word["english"]]
    if missing_english:
        raise RuntimeError(f"Missing English translations for entries: {missing_english[:10]}")

    fieldnames = [
        "no",
        "hanzi",
        "kor_hanja",
        "hangul",
        "romanization",
        "chinese",
        "chinese_pinyin",
        "english",
        "japanese",
        "japanese_romanization",
        "vietnamese",
        "vietnamese_romanization",
    ]

    with CSV_PATH.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(words)

    with JSON_PATH.open("w", encoding="utf-8") as file:
        json.dump(words, file, ensure_ascii=False, indent=2)


def main():
    words = extract_from_pdf()
    write_outputs(words)
    print(f"Wrote {len(words)} entries to {CSV_PATH}")
    print(f"Wrote {len(words)} entries to {JSON_PATH}")


if __name__ == "__main__":
    main()
