"""Utilities for assigning blog images from the `/fotos` directory.

This module centralises the logic that selects images for blog posts so the
same behaviour can be reused by both content generation scripts and one-off
maintenance utilities.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List

ROOT_DIR = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT_DIR / "fotos"
STATE_PATH = Path(__file__).resolve().parent / "image_rotation_state.json"
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


class NoImagesAvailableError(RuntimeError):
    """Raised when no usable images are found in the `/fotos` directory."""


def get_available_images() -> List[str]:
    """Return a sorted list of available image filenames.

    Only files with whitelisted extensions are returned.
    """

    if not IMAGES_DIR.exists():
        return []

    return sorted(
        file.name
        for file in IMAGES_DIR.iterdir()
        if file.is_file() and file.suffix.lower() in ALLOWED_EXTENSIONS
    )


def _load_state(path: Path) -> Dict[str, int]:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        # Corrupted files shouldn't crash the workflow; start fresh instead.
        return {}


def _save_state(path: Path, state: Dict[str, int]) -> None:
    path.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


class ImageRotator:
    """Round-robin image selector with per-language cursors."""

    def __init__(self, state_path: Path | None = None):
        self.state_path = state_path or STATE_PATH
        self.images = get_available_images()
        if not self.images:
            raise NoImagesAvailableError(
                "`/fotos` klasöründe kullanılabilir görsel bulunamadı."
            )
        self.state = _load_state(self.state_path)

    def next_for_language(self, lang_code: str) -> str:
        """Return the next image filename for the given language."""

        count = int(self.state.get(lang_code, 0))
        filename = self.images[count % len(self.images)]
        self.state[lang_code] = count + 1
        _save_state(self.state_path, self.state)
        return filename

    def set_count(self, lang_code: str, count: int) -> None:
        """Set the rotation counter for a language and persist it."""

        self.state[lang_code] = int(count)
        _save_state(self.state_path, self.state)

    def reset(self) -> None:
        """Reset all rotation counters."""

        self.state = {}
        _save_state(self.state_path, self.state)
