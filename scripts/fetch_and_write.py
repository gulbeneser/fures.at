#!/usr/bin/env python3
"""Daily AI news fetcher and Markdown writer.

This script collects RSS entries, filters them for AI-related news, sends a
summary prompt to Gemini, and writes the resulting Markdown post into the
Hugo-compatible ``content/posts/YYYY/MM`` directory.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import pathlib
import re
import sys
import calendar
from collections import OrderedDict
from textwrap import dedent
from typing import Iterable, List, Mapping, MutableMapping, Sequence
from urllib.parse import urlparse

import feedparser
import requests
import yaml
from zoneinfo import ZoneInfo

# Configuration -----------------------------------------------------------------
ROOT = pathlib.Path(__file__).resolve().parents[1]
FEEDS_FILE = ROOT / "scripts" / "feeds.yml"
PROMPT_FILE = ROOT / "prompts" / "post_system_prompt.md"
CONTENT_ROOT = ROOT / "content" / "posts"
TIMEZONE = ZoneInfo("Europe/Istanbul")
TODAY = dt.datetime.now(TIMEZONE).date()
OUT_DIR = CONTENT_ROOT / f"{TODAY.year}" / f"{TODAY.month:02d}"
TIME_WINDOW_HOURS = 36
MAX_ITEMS = 60
MIN_UNIQUE_SOURCES = 4
AI_KEYWORDS = {
    "ai",
    "artificial intelligence",
    "yapay",
    "zeka",
    "llm",
    "machine learning",
    "generative",
    "gpt",
    "model",
    "robot",
}
LOCAL_DOMAINS = {
    "trthaber.com",
    "aa.com.tr",
    "webrazzi.com",
    "shiftdelete.net",
    "btchaber.com",
    "tubitak.gov.tr",
    "kktc.com.tr",
}
USER_PROMPT_TEMPLATE = dedent(
    """
    Günün haber girdileri aşağıda listelenmiştir. Her öğe için başlık, kaynak URL,
    yayınlanma zamanı ve varsa kısa özet bulunur. Lütfen sistem talimatına uygun
    tek bir günlük brifing hazırla.

    {items}
    """
).strip()


# Utilities ---------------------------------------------------------------------
def load_feeds() -> List[str]:
    if not FEEDS_FILE.exists():
        raise FileNotFoundError(f"Feeds file not found: {FEEDS_FILE}")
    data = yaml.safe_load(FEEDS_FILE.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("feeds.yml must be a list of feed URLs")
    return [str(item).strip() for item in data if str(item).strip()]


def _parse_datetime(entry: MutableMapping[str, object]) -> dt.datetime | None:
    time_struct = entry.get("published_parsed") or entry.get("updated_parsed")
    if not time_struct:
        return None
    timestamp = calendar.timegm(time_struct)
    dt_obj = dt.datetime.fromtimestamp(timestamp, tz=ZoneInfo("UTC"))
    return dt_obj.astimezone(TIMEZONE)


def _clean_html(text: str | None) -> str:
    if not text:
        return ""
    cleaned = re.sub(r"<[^>]+>", " ", text)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def _is_ai_related(entry: Mapping[str, object]) -> bool:
    haystack_parts: List[str] = []
    for key in ("title", "summary", "description", "tags"):
        value = entry.get(key)
        if isinstance(value, str):
            haystack_parts.append(value.lower())
        elif isinstance(value, Sequence):
            haystack_parts.extend([str(item).lower() for item in value])
    haystack = " ".join(haystack_parts)
    return any(keyword in haystack for keyword in AI_KEYWORDS)


def _classify_region(url: str) -> str:
    domain = urlparse(url).netloc.lower()
    domain = domain[4:] if domain.startswith("www.") else domain
    return "Türkiye/KKTC" if domain in LOCAL_DOMAINS else "Global"


def collect_news() -> List[Mapping[str, str]]:
    feeds = load_feeds()
    cutoff = dt.datetime.now(TIMEZONE) - dt.timedelta(hours=TIME_WINDOW_HOURS)
    items: "OrderedDict[str, Mapping[str, str]]" = OrderedDict()

    for feed_url in feeds:
        parsed = feedparser.parse(feed_url)
        for entry in parsed.entries[:MAX_ITEMS]:
            link = getattr(entry, "link", None)
            title = getattr(entry, "title", None)
            if not link or not title:
                continue
            if link in items:
                continue

            published = _parse_datetime(entry)
            if published and published < cutoff:
                continue

            if not _is_ai_related(entry):
                continue

            summary = _clean_html(getattr(entry, "summary", None) or getattr(entry, "description", None))
            items[link] = {
                "title": title.strip(),
                "link": link,
                "summary": summary,
                "published": published.isoformat() if published else "",
                "region": _classify_region(link),
                "source": urlparse(link).netloc,
            }

    return list(items.values())


def build_user_prompt(entries: Iterable[Mapping[str, str]]) -> str:
    lines: List[str] = []
    for idx, entry in enumerate(entries, start=1):
        summary = entry.get("summary", "")
        published = entry.get("published", "")
        lines.append(
            dedent(
                f"""
                {idx}. Başlık: {entry.get('title')}
                   Kaynak: {entry.get('link')}
                   Yayın: {published}
                   Bölge: {entry.get('region')}
                   Kaynak Sitesi: {entry.get('source')}
                   Özet: {summary}
                """
            ).strip()
        )
    items_block = "\n\n".join(lines)
    return USER_PROMPT_TEMPLATE.format(items=items_block)


def llm_summarize_markdown(entries: List[Mapping[str, str]], system_prompt: str) -> str:
    if not entries:
        raise ValueError("No entries to summarize")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set")

    user_prompt = build_user_prompt(entries)
    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "responseMimeType": "text/markdown",
        },
    }

    resp = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-1.5-flash-latest:generateContent",
        params={"key": api_key},
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload),
        timeout=120,
    )
    resp.raise_for_status()
    result = resp.json()
    try:
        parts = result["candidates"][0]["content"]["parts"]
        text = "\n".join(part.get("text", "") for part in parts).strip()
        if not text:
            raise KeyError("empty response")
        return text
    except (KeyError, IndexError) as exc:  # pragma: no cover - defensive
        raise RuntimeError(f"Unexpected Gemini response: {result}") from exc


def write_post(md_text: str) -> str:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    m = re.search(r"^---\n(.*?)\n---", md_text, flags=re.S)
    if m:
        fm = m.group(1)
        t = re.search(r"^title:\s*(.*)$", fm, flags=re.M)
        title = t.group(1).strip().strip('\"\'') if t else f"AI Günlük {TODAY.isoformat()}"
    else:
        title = f"AI Günlük {TODAY.isoformat()}"

    slug = re.sub(r"[^a-z0-9-]+", "-", title.lower())
    slug = re.sub(r"-+", "-", slug).strip('-')
    if not slug:
        slug = "ai-digest"

    out_path = OUT_DIR / f"{TODAY.isoformat()}-{slug}.md"
    out_path.write_text(md_text.strip() + "\n", encoding="utf-8")
    return str(out_path)


def main() -> None:
    feeds = load_feeds()
    if not feeds:
        print("No feeds defined.")
        sys.exit(1)

    entries = collect_news()
    unique_sources = {entry["source"] for entry in entries}
    if len(unique_sources) < MIN_UNIQUE_SOURCES:
        print("Not enough entries today; skipping post.")
        sys.exit(0)

    system_prompt = PROMPT_FILE.read_text(encoding="utf-8")
    markdown = llm_summarize_markdown(entries, system_prompt)
    path = write_post(markdown)
    print("WROTE:", path)


if __name__ == "__main__":
    main()
