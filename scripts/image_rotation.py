"""Utilities for assigning blog images from the `/fotos` directory.

This module centralises the logic that selects images for blog posts so the
same behaviour can be reused by both content generation scripts and one-off

maintenance utilities. Image selection happens in a language-specific,
randomised round that keeps cycling through the available assets without
repeating the most recently used file.
,
"""
from __future__ import annotations

import json

import random
from pathlib import Path
from typing import Any, Dict, List


ROOT_DIR = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT_DIR / "fotos"
STATE_PATH = Path(__file__).resolve().parent / "image_rotation_state.json"

STATE_VERSION = 1

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



def _empty_state() -> Dict[str, Any]:
    return {"version": STATE_VERSION, "languages": {}}


def _normalise_state(raw_state: object) -> Dict[str, Any]:
    if not isinstance(raw_state, dict):
        return _empty_state()

    # Already in the current format.
    if "languages" in raw_state and isinstance(raw_state["languages"], dict):
        languages: Dict[str, Any] = {}
        for lang_code, payload in raw_state["languages"].items():
            if not isinstance(lang_code, str):
                continue
            info = payload if isinstance(payload, dict) else {}
            last_value = info.get("last") if isinstance(info.get("last"), str) else None
            remaining_value = info.get("remaining") if isinstance(info.get("remaining"), list) else []
            remaining_filtered = [item for item in remaining_value if isinstance(item, str)]
            languages[lang_code] = {"last": last_value, "remaining": remaining_filtered}
        return {"version": STATE_VERSION, "languages": languages}

    # Legacy format: {"tr": 12, "en": 8, ...}
    if all(isinstance(value, int) for value in raw_state.values()):
        languages = {
            lang_code: {"last": None, "remaining": []}
            for lang_code in raw_state.keys()
            if isinstance(lang_code, str)
        }
        return {"version": STATE_VERSION, "languages": languages}

    return _empty_state()


def _load_state(path: Path) -> Dict[str, Any]:

    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        # Corrupted files shouldn't crash the workflow; start fresh instead.
        return {}



def _save_state(path: Path, state: Dict[str, Any]) -> None:


class ImageRotator:

    """Random-but-fair image selector with per-language cycles."""


    def __init__(self, state_path: Path | None = None):
        self.state_path = state_path or STATE_PATH
        self.images = get_available_images()
        if not self.images:
            raise NoImagesAvailableError(
                "`/fotos` klasöründe kullanılabilir görsel bulunamadı."
            )


        raw_state = _load_state(self.state_path)
        self.state = _normalise_state(raw_state)
        if self.state != raw_state:
            _save_state(self.state_path, self.state)

        if self._sync_with_available_images():
            _save_state(self.state_path, self.state)

    def _sync_with_available_images(self) -> bool:
        """Ensure the persisted state only references existing image files."""

        changed = False
        valid = set(self.images)
        languages = self.state.get("languages", {})

        for lang_code, info in languages.items():
            last_value = info.get("last") if isinstance(info.get("last"), str) else None
            if last_value not in valid:
                info["last"] = None
                last_value = None
                changed = True

            remaining_list = info.get("remaining") if isinstance(info.get("remaining"), list) else []
            filtered_remaining = [item for item in remaining_list if item in valid]
            if len(filtered_remaining) != len(remaining_list):
                info["remaining"] = filtered_remaining
                changed = True
            else:
                info["remaining"] = list(filtered_remaining)

            info.setdefault("last", last_value)
            info.setdefault("remaining", filtered_remaining)

        return changed

    def _build_new_pool(self, last_value: str | None) -> List[str]:
        pool = list(self.images)
        random.shuffle(pool)

        if last_value and len(pool) > 1 and pool[-1] == last_value:
            pool.insert(0, pool.pop())

        return pool

    def next_for_language(self, lang_code: str) -> str:
        """Return a randomised image filename for the given language."""

        languages = self.state.setdefault("languages", {})
        lang_state = languages.setdefault(lang_code, {"last": None, "remaining": []})

        remaining = lang_state.get("remaining") if isinstance(lang_state.get("remaining"), list) else []
        remaining_filtered = [item for item in remaining if item in self.images]
        if not remaining_filtered:
            remaining_filtered = self._build_new_pool(lang_state.get("last") if isinstance(lang_state.get("last"), str) else None)

        filename = remaining_filtered.pop()
        lang_state["last"] = filename
        lang_state["remaining"] = remaining_filtered

        _save_state(self.state_path, self.state)
        return filename

    def reset(self) -> None:
        """Reset all rotation counters and histories."""

        self.state = _empty_state()
=======
        _save_state(self.state_path, self.state)
