"""Assign images from `/fotos` to all existing blog posts."""
from __future__ import annotations

import json
import re
from pathlib import Path

from image_rotation import NoImagesAvailableError, get_available_images, STATE_PATH

ROOT_DIR = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT_DIR / "blog"

FRONT_MATTER_PATTERN = re.compile(r"^image:\s*(.*)$", re.IGNORECASE)


def update_image_line(lines: list[str], new_image_path: str) -> list[str]:
    for idx, line in enumerate(lines):
        if FRONT_MATTER_PATTERN.match(line.strip()):
            lines[idx] = f"image: {new_image_path}\n"
            return lines
    raise ValueError("Ön bilgilendirme bloğunda 'image' satırı bulunamadı.")


def process_language(lang_dir: Path, images: list[str]) -> int:
    files = sorted(lang_dir.glob("*.md"))
    for idx, file_path in enumerate(files):
        image_filename = images[idx % len(images)]
        image_url = f"/fotos/{image_filename}"
        content = file_path.read_text(encoding="utf-8").splitlines(keepends=True)
        updated = update_image_line(content, image_url)
        file_path.write_text("".join(updated), encoding="utf-8")
    return len(files)


def main() -> None:
    images = get_available_images()
    if not images:
        raise NoImagesAvailableError("Görsel bulunamadı, işlem durduruldu.")

    language_counts: dict[str, int] = {}
    for lang_dir in sorted(BLOG_DIR.iterdir()):
        if not lang_dir.is_dir():
            continue
        lang_code = lang_dir.name
        count = process_language(lang_dir, images)
        language_counts[lang_code] = count
        print(f"{lang_code}: {count} yazı güncellendi.")

    STATE_PATH.write_text(
        json.dumps(language_counts, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print("Görsel atamaları tamamlandı.")


if __name__ == "__main__":
    main()
