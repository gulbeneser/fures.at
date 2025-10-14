"""Assign images from `/fotos` to all existing blog posts."""
from __future__ import annotations


import re
from pathlib import Path

from image_rotation import ImageRotator, NoImagesAvailableError


ROOT_DIR = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT_DIR / "blog"

FRONT_MATTER_PATTERN = re.compile(r"^image:\s*(.*)$", re.IGNORECASE)


def update_image_line(lines: list[str], new_image_path: str) -> list[str]:
    for idx, line in enumerate(lines):
        if FRONT_MATTER_PATTERN.match(line.strip()):
            lines[idx] = f"image: {new_image_path}\n"
            return lines
    raise ValueError("Ön bilgilendirme bloğunda 'image' satırı bulunamadı.")



def process_language(lang_dir: Path, rotator: ImageRotator) -> int:
    files = sorted(lang_dir.glob("*.md"))
    for file_path in files:
        image_filename = rotator.next_for_language(lang_dir.name)

        image_url = f"/fotos/{image_filename}"
        content = file_path.read_text(encoding="utf-8").splitlines(keepends=True)
        updated = update_image_line(content, image_url)
        file_path.write_text("".join(updated), encoding="utf-8")
    return len(files)


def main() -> None:

    try:
        rotator = ImageRotator()
    except NoImagesAvailableError as exc:
        raise SystemExit(str(exc)) from exc

    for lang_dir in sorted(BLOG_DIR.iterdir()):
        if not lang_dir.is_dir():
            continue
        count = process_language(lang_dir, rotator)
        print(f"{lang_dir.name}: {count} yazı güncellendi.")


    print("Görsel atamaları tamamlandı.")


if __name__ == "__main__":
    main()
