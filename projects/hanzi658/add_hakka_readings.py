import csv
import json
from pathlib import Path


ROOT = Path("/Volumes/Can Disk/writing/vvoliucano.github.io/projects/hanzi658")
WORDS_JSON_PATH = ROOT / "words.json"
WORDS_CSV_PATH = ROOT / "hanzi658.csv"
HAKKA_SOURCE_PATH = ROOT / "hakka_sixian_source.csv"

READING_FIELD = "PFS"
DISPLAY_FIELD = "音讀（符號）"
TITLE_FIELD = "詞目"
DIALECT_FIELD = "Dialect"
TARGET_DIALECT = "四縣腔"


def load_json(path):
    with path.open(encoding="utf-8") as file:
        return json.load(file)


def save_json(path, value):
    with path.open("w", encoding="utf-8") as file:
        json.dump(value, file, ensure_ascii=False, indent=2)


def load_csv_rows(path):
    with path.open(newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def save_csv_rows(path, fieldnames, rows):
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def normalize_text(value):
    return (value or "").strip().replace(" ", "")


def normalize_reading(value):
    return " ".join((value or "").split())


def build_indexes(rows):
    exact_map = {}
    char_map = {}

    for row in rows:
        if row.get(DIALECT_FIELD) != TARGET_DIALECT:
            continue

        title = normalize_text(row.get(TITLE_FIELD, ""))
        if not title:
            continue

        row = {
            "title": title,
            "display": normalize_reading(row.get(DISPLAY_FIELD, "")),
            "reading": normalize_reading(row.get(READING_FIELD, "")),
        }

        exact_map.setdefault(title, []).append(row)
        if len(title) == 1:
            char_map.setdefault(title, []).append(row)

    return exact_map, char_map


def pick_row(rows):
    if not rows:
        return None

    best = None
    for row in rows:
        if not row["reading"]:
            continue
        if best is None:
            best = row
            continue
        if len(row["reading"]) < len(best["reading"]):
            best = row
    return best or rows[0]


def get_title_candidates(word):
    candidates = []
    for key in ("chinese", "hanzi", "kor_hanja", "japanese"):
        value = normalize_text(word.get(key, ""))
        if value and value not in candidates:
            candidates.append(value)
    return candidates


def match_word(word, exact_map, char_map):
    for candidate in get_title_candidates(word):
        row = pick_row(exact_map.get(candidate, []))
        if row:
            return {
                "hakka_sixian_hanzi": row["title"],
                "hakka_sixian": row["reading"],
                "hakka_sixian_display": row["display"] or row["reading"],
                "hakka_sixian_match_type": "exact",
            }

    composed_title = normalize_text(word.get("kor_hanja") or word.get("japanese") or word.get("hanzi") or word.get("chinese"))
    if composed_title:
        pieces = []
        displays = []
        for char in composed_title:
            row = pick_row(char_map.get(char, []))
            if not row:
                pieces = []
                break
            pieces.append(row["reading"])
            displays.append(row["display"] or row["reading"])

        if pieces:
            return {
                "hakka_sixian_hanzi": composed_title,
                "hakka_sixian": "-".join(pieces),
                "hakka_sixian_display": " ".join(displays),
                "hakka_sixian_match_type": "char_composed",
            }

    return {
        "hakka_sixian_hanzi": normalize_text(word.get("kor_hanja") or word.get("japanese") or word.get("hanzi") or word.get("chinese")),
        "hakka_sixian": "",
        "hakka_sixian_display": "",
        "hakka_sixian_match_type": "missing",
    }


def update_words_json(words, exact_map, char_map):
    stats = {"exact": 0, "char_composed": 0, "missing": 0}

    for word in words:
        matched = match_word(word, exact_map, char_map)
        word.update(matched)
        stats[matched["hakka_sixian_match_type"]] += 1

    return stats


def update_words_csv(rows_by_no, exact_map, char_map):
    stats = {"exact": 0, "char_composed": 0, "missing": 0}

    for row in rows_by_no:
        word = {
            "chinese": row.get("chinese", ""),
            "hanzi": row.get("hanzi", ""),
            "kor_hanja": row.get("kor_hanja", ""),
            "japanese": row.get("japanese", ""),
        }
        matched = match_word(word, exact_map, char_map)
        row.update(matched)
        stats[matched["hakka_sixian_match_type"]] += 1

    return stats


def main():
    hakka_rows = load_csv_rows(HAKKA_SOURCE_PATH)
    exact_map, char_map = build_indexes(hakka_rows)

    words = load_json(WORDS_JSON_PATH)
    json_stats = update_words_json(words, exact_map, char_map)
    save_json(WORDS_JSON_PATH, words)

    csv_rows = load_csv_rows(WORDS_CSV_PATH)
    csv_stats = update_words_csv(csv_rows, exact_map, char_map)
    fieldnames = list(csv_rows[0].keys())
    for extra_field in ("hakka_sixian_hanzi", "hakka_sixian", "hakka_sixian_display", "hakka_sixian_match_type"):
        if extra_field not in fieldnames:
            fieldnames.append(extra_field)
    save_csv_rows(WORDS_CSV_PATH, fieldnames, csv_rows)

    print("JSON stats:", json_stats)
    print("CSV stats:", csv_stats)


if __name__ == "__main__":
    main()
