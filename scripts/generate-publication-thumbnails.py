#!/usr/bin/env python3
"""Create sibling WebP thumbnails without changing the original images.

Requires Pillow. Example:
    python3 scripts/generate-publication-thumbnails.py assets/project/new-paper.png

Publication templates automatically prefer a sibling .webp when it exists.
Existing WebP files are kept unless --force is supplied. GIF animation is retained.
Animated thumbnails are capped at 400px wide. Larger encodings are discarded.
"""

import argparse
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image, ImageOps, ImageSequence


def thumbnail(image, max_width):
    frame = ImageOps.exif_transpose(image).convert("RGBA")
    if frame.width > max_width:
        height = max(1, round(frame.height * max_width / frame.width))
        frame = frame.resize((max_width, height), Image.Resampling.LANCZOS)
    return frame


def generate(source, max_width, quality, force):
    destination = source.with_suffix(".webp")
    if source.suffix.lower() == ".webp" or (destination.exists() and not force):
        print(f"Kept existing WebP: {destination}", flush=True)
        return

    with Image.open(source) as image, TemporaryDirectory(prefix=".thumbnail-", dir=source.parent) as directory:
        temporary = Path(directory) / destination.name
        options = {"format": "WEBP", "quality": quality, "method": 6}
        if getattr(image, "is_animated", False):
            options["method"] = 3
            options["quality"] = min(quality, 76)
            loop = image.info.get("loop", 1)
            frames, durations = [], []
            for frame in ImageSequence.Iterator(image):
                durations.append(frame.info.get("duration", 100))
                frames.append(thumbnail(frame, min(max_width, 400)))
            frames[0].save(
                temporary,
                save_all=True,
                append_images=frames[1:],
                duration=durations,
                loop=loop,
                **options,
            )
        else:
            thumbnail(image, max_width).save(temporary, **options)
        if temporary.stat().st_size >= source.stat().st_size:
            print(f"Kept original; WebP would be larger: {source}", flush=True)
            return
        temporary.replace(destination)

    before, after = source.stat().st_size, destination.stat().st_size
    print(f"{source.name}: {before / 1024:.1f} KB -> {after / 1024:.1f} KB", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("images", nargs="+", type=Path)
    parser.add_argument("--max-width", type=int, default=640)
    parser.add_argument("--quality", type=int, default=84)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    if args.max_width <= 0 or not 0 <= args.quality <= 100:
        parser.error("max-width must be positive and quality must be between 0 and 100")
    for source in args.images:
        generate(source, args.max_width, args.quality, args.force)


if __name__ == "__main__":
    main()
