import csv
import json
import time
from pathlib import Path

from deep_translator import GoogleTranslator


ROOT = Path(__file__).resolve().parent
JSON_PATH = ROOT / "words.json"
CSV_PATH = ROOT / "hanzi658.csv"
TRANSLATIONS_PATH = ROOT / "english_translations.json"
BATCH_SIZE = 35


def normalize_english(value):
    """Keep dictionary-style English glosses compact and consistently lowercase."""
    return " ".join((value or "").strip().split()).lower()


def load_json(path, default):
    if not path.exists():
        return default
    with path.open(encoding="utf-8") as file:
        return json.load(file)


def save_json(path, value):
    with path.open("w", encoding="utf-8") as file:
        json.dump(value, file, ensure_ascii=False, indent=2)
        file.write("\n")


def translate_missing(words, translations):
    translator = GoogleTranslator(source="zh-CN", target="en")
    missing = [word for word in words if not translations.get(str(word["no"]))]

    for start in range(0, len(missing), BATCH_SIZE):
        batch = missing[start:start + BATCH_SIZE]
        results = translator.translate_batch([word["chinese"] for word in batch])
        for word, result in zip(batch, results):
            translations[str(word["no"])] = normalize_english(result)
        save_json(TRANSLATIONS_PATH, translations)
        print(f"Translated {min(start + len(batch), len(missing))}/{len(missing)} missing entries")
        time.sleep(0.35)

    return translations


def write_outputs(words, translations):
    for word in words:
        word["english"] = translations[str(word["no"])]

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

    save_json(JSON_PATH, words)
    with CSV_PATH.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(words)


def main():
    words = load_json(JSON_PATH, [])
    translations = load_json(TRANSLATIONS_PATH, {})
    translations = {key: normalize_english(value) for key, value in translations.items()}
    translations = translate_missing(words, translations)

    missing = [word["no"] for word in words if not translations.get(str(word["no"]))]
    if missing:
        raise RuntimeError(f"Missing English translations for entries: {missing[:10]}")

    save_json(TRANSLATIONS_PATH, translations)
    write_outputs(words, translations)
    print(f"Added English translations to {len(words)} entries")


if __name__ == "__main__":
    main()
