#!/usr/bin/env python3
# pip install -r requirements.txt
import os, sys, json, time, pathlib, datetime
from urllib.parse import urlparse
import feedparser
from dateutil import tz

from google import genai
from google.genai import types

from utils import slugify, strip_html

# ---- Zaman/Dizinler ----
TZ = tz.gettz("Europe/Istanbul")
NOW = datetime.datetime.now(TZ)
TODAY = NOW.date()

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTENT_BASE = ROOT / "content" / "posts"
IMAGES_DIR   = ROOT / "static" / "images" / "ai-daily" / f"{TODAY.year:04d}" / f"{TODAY.month:02d}" / f"{TODAY.isoformat()}-ai-digest"
FEEDS_FILE   = ROOT / "scripts" / "feeds.yml"

PROMPTS = {
    "tr": ROOT / "prompts" / "post_prompt_tr.md",
    "en": ROOT / "prompts" / "post_prompt_en.md",
    "ru": ROOT / "prompts" / "post_prompt_ru.md",
    "de": ROOT / "prompts" / "post_prompt_de.md",
}

LANG_PATH = {
    "tr": "tr",
    "en": "en",
    "ru": "ru",
    "de": "de",
}

MAX_ITEMS = 60
MIN_UNIQUE_SOURCES = 12
IMAGE_COUNT = 3

KEYWORDS = [
    "artificial intelligence","ai","machine learning","deep learning","large language model",
    "llm","multimodal","computer vision","speech","rag","agents","turkey","türkiye","kktc",
    "hospitality","tourism","travel","automation","marketing","search","genomics","robotics"
]

TEXT_MODEL = "gemini-2.5-flash"
IMG_MODEL  = "gemini-2.5-flash-image"

# ---- API KEY ----
def get_api_key():
    return os.environ.get("GEMINI_API_KEY") or os.environ.get("apikey")

def make_client():
    key = get_api_key()
    if not key:
        print("Missing GEMINI_API_KEY/apikey", file=sys.stderr)
        sys.exit(1)
    return genai.Client(api_key=key)

# ---- RSS Toplama ----
def load_feeds():
    if not FEEDS_FILE.exists():
        print("feeds.yml not found", file=sys.stderr)
        return []
    return [ln.strip() for ln in FEEDS_FILE.read_text(encoding="utf-8").splitlines()
            if ln.strip() and not ln.strip().startswith("#")]

def unique(items, key):
    seen=set(); out=[]
    for it in items:
        k=key(it)
        if k in seen: continue
        seen.add(k); out.append(it)
    return out

def is_relevant(title, summary):
    blob = f"{(title or '').lower()} {(summary or '').lower()}"
    return any(k.lower() in blob for k in KEYWORDS)

def collect_entries():
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2)
    entries = []
    for url in load_feeds():
        try:
            d = feedparser.parse(url)
        except Exception:
            continue
        for e in d.entries[:40]:
            link = getattr(e, "link", "")
            title = strip_html(getattr(e, "title", ""))
            summary = strip_html(getattr(e, "summary", ""))
            if not link or not title: continue

            if getattr(e, "published_parsed", None):
                pub = datetime.datetime(*e.published_parsed[:6], tzinfo=datetime.timezone.utc)
            elif getattr(e, "updated_parsed", None):
                pub = datetime.datetime(*e.updated_parsed[:6], tzinfo=datetime.timezone.utc)
            else:
                pub = datetime.datetime.now(datetime.timezone.utc)

            if pub < cutoff: continue
            if not is_relevant(title, summary): continue

            entries.append({
                "title": title,
                "summary": summary,
                "link": link,
                "domain": urlparse(link).netloc,
                "published": pub.isoformat()
            })
    entries = unique(entries, key=lambda x: (x["domain"], x["title"].lower()))
    entries.sort(key=lambda x: x["published"], reverse=True)
    return entries[:MAX_ITEMS]

# ---- LLM Çağrıları ----
def build_user_prompt(entries):
    return f"""
DATE: {TODAY.isoformat()}

TASK:
- Research the following AI items in **English** (validate quickly),
  then write a **localized daily AI brief** per prompt-language.
- Include markdown **links** to original sources.

Sections:
  1) Headlines / Manşetler (3–6)
  2) Turkey/Northern Cyprus Focus (Türkiye/KKTC Odak)
  3) Global Radar (papers/tools/models)
  4) Actionable Tips (business / tourism / developers)
  5) Quick Notes

Also: add 1–2 short examples (code, prompt, or real use).
Tone: playful, educational, accurate.
Output: UTF-8 Markdown with YAML front-matter (as specified in system prompt).

ENTRIES (JSON):
{json.dumps(entries, ensure_ascii=False)}
""".strip()

def llm_markdown_for_lang(client, lang_code, entries):
    system_prompt = PROMPTS[lang_code].read_text(encoding="utf-8")
    contents = [
        types.Content(role="system", parts=[types.Part.from_text(text=system_prompt)]),
        types.Content(role="user",   parts=[types.Part.from_text(text=build_user_prompt(entries))]),
    ]
    cfg = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=-1),
        max_output_tokens=3000,
        temperature=0.5
    )
    out = []
    for ch in client.models.generate_content_stream(model=TEXT_MODEL, contents=contents, config=cfg):
        if getattr(ch, "text", None):
            out.append(ch.text)
    return "".join(out).strip()

# ---- Görsel Üretimi ----
def generate_images(client, topic_slug, count=3):
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    prompts = [
        f"Editorial illustration for a daily AI blog; modern minimal hero; sharp vector; {topic_slug}",
        f"Concept artwork showing Large Language Models in hospitality/tourism workflows; clean cover; {topic_slug}",
        f"AI x Travel in Cyprus; itinerary planning assistants; stylish blog image; {topic_slug}"
    ]
    paths = []
    for i in range(count):
        prompt = prompts[i % len(prompts)]
        resp = client.models.generate_images(model=IMG_MODEL, prompt=prompt)
        if not getattr(resp, "images", None):
            continue
        img = resp.images[0]
        b = img.image
        outp = IMAGES_DIR / f"{i+1:02d}.png"
        outp.write_bytes(b)
        paths.append("/" + str(outp.relative_to(ROOT)).replace(os.sep, "/"))
        time.sleep(1.0)
    return paths

# ---- Yazma/Enjeksiyon ----
def write_markdown(md_text, lang, title_fallback="AI Günlük"):
    import re
    lang_dir = CONTENT_BASE / LANG_PATH[lang] / f"{TODAY.year:04d}" / f"{TODAY.month:02d}"
    lang_dir.mkdir(parents=True, exist_ok=True)

    m = re.search(r"^---\s*(.*?)\s*---", md_text, flags=re.S)
    if m:
        fm = m.group(1)
        t = re.search(r"^title:\s*(.*)$", fm, flags=re.M)
        title = (t.group(1).strip().strip("\"'") if t else title_fallback)
    else:
        title = title_fallback

    slug = slugify(title)
    out_path = lang_dir / f"{TODAY.isoformat()}-{slug}.md"
    out_path.write_text(md_text.strip() + "\n", encoding="utf-8")
    return out_path, slug

def inject_cover_image(md_path, cover_image_rel):
    txt = md_path.read_text(encoding="utf-8")
    if not txt.strip().startswith("---"):
        return
    parts = txt.split("---", 2)
    if len(parts) < 3:
        return
    fm, body = parts[1], parts[2]
    import re
    if "cover_image:" in fm:
        fm = re.sub(r"cover_image:\s*.*", f"cover_image: {cover_image_rel}", fm)
    else:
        fm = fm.strip() + f"\ncover_image: {cover_image_rel}\n"
    md_path.write_text("---\n" + fm + "---" + body, encoding="utf-8")

def append_gallery(md_path, slug, images):
    body = md_path.read_text(encoding="utf-8")
    gallery = "\n\n---\n\n## Görsel Galeri\n" + "\n".join([f"![{slug}]({p})" for p in images])
    md_path.write_text(body.strip() + gallery + "\n", encoding="utf-8")

def main():
    client = make_client()
    entries = collect_entries()
    if len(entries) < MIN_UNIQUE_SOURCES:
        print("Not enough entries; skipping.", file=sys.stderr)
        sys.exit(0)

    # İlk dil (TR) ile slug/görsel konusu
    md_tr = llm_markdown_for_lang(client, "tr", entries)
    tr_path, tr_slug = write_markdown(md_tr, "tr", "AI Günlük")
    images = generate_images(client, tr_slug, IMAGE_COUNT)
    if images:
        inject_cover_image(tr_path, images[0])
        append_gallery(tr_path, tr_slug, images)

    # Diğer diller (EN/RU/DE), aynı kapak/görselleri kullan
    for lang in ["en", "ru", "de"]:
        md = llm_markdown_for_lang(client, lang, entries)
        pth, _ = write_markdown(md, lang, "AI Daily")
        if images:
            inject_cover_image(pth, images[0])
            append_gallery(pth, tr_slug, images)

    print("DONE")

if __name__ == "__main__":
    main()
