import os
import base64
import feedparser
import datetime
import subprocess
import shutil
import json
import re
from pathlib import Path
import requests
from urllib.parse import urlparse, parse_qs, urlunparse, urlencode
from io import BytesIO
from PIL import Image  # Pillow gerekli!

from image_rotation import ImageRotator, NoImagesAvailableError
from utils import slugify

# --- Gemini (metin) ---
import google.generativeai as genai

# --- Gemini (görsel) ---
try:
    from google import genai as google_genai_lib
    from google.genai import types as google_genai_types
except Exception:
    google_genai_lib = None
    google_genai_types = None

# === CONFIG ===
MODEL_TEXT = "gemini-2.5-pro"
LANGS = {"tr": "Turkish", "en": "English", "de": "German", "ru": "Russian"}
LANG_NAMES = {"tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский"}
INSTAGRAM_CAPTION_LIMIT = 2200

ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
FOTOS_DIR = ROOT / "fotos"
BLOG_DIR.mkdir(exist_ok=True)
FOTOS_DIR.mkdir(exist_ok=True)

# === ORTAM ===
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY yok!")
genai.configure(api_key=GEMINI_API_KEY)
print("✅ [INIT] Gemini (metin) hazır.")

GOOGLE_GENAI_CLIENT = None
if google_genai_lib is None:
    print("ℹ️ [INIT] google.genai paketi yok; görsel üretimi yapılamaz.")
else:
    try:
        GOOGLE_GENAI_CLIENT = google_genai_lib.Client(api_key=GEMINI_API_KEY)
        print("✅ [INIT] Gemini (görsel) hazır.")
    except Exception as e:
        print(f"❌ [INIT] google.genai istemcisi açılamadı: {e}")

# === YARDIMCI: retry ===
import time
def with_retry(fn, tries=2, wait=6, label=""):
    for i in range(tries):
        try:
            return fn()
        except Exception as e:
            if i == tries - 1:
                print(f"❌ [{label}] Denemeler tükendi: {e}")
                raise
            print(f"⚠️  [{label}] Hata: {e} → {i+1}. deneme başarısız, {wait}s bekleniyor...")
            time.sleep(wait)

# === Yardımcı: Instagram caption temizleme ===
def _clean_instagram_caption(text: str, limit: int = INSTAGRAM_CAPTION_LIMIT) -> str:
    text = text or ""
    text = re.sub(r"https?://\S+", "", text, flags=re.IGNORECASE)
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines()]
    cleaned = "\n".join(line for line in lines if line)
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned).strip()
    if len(cleaned) <= limit:
        return cleaned
    truncated = cleaned[:limit]
    last_break = max(truncated.rfind("\n"), truncated.rfind(" "))
    if last_break > 0:
        truncated = truncated[:last_break]
    truncated = truncated.rstrip(" ,.;:-")
    return (truncated or cleaned[:limit]).rstrip(" ,.;:-") + "…"

# === 1) URL temizleme/çözme ===

# — Google/CDN/görsel linkleri elemeye yarayan sabitler —
_IMG_EXT = (".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg")
_GOOGLEISH = {
    "news.google.com", "www.google.com", "google.com",
    "gstatic.com", "www.gstatic.com",
    "googleusercontent.com", "lh3.googleusercontent.com", "lh4.googleusercontent.com"
}
_CANON_RE = re.compile(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\'](https?://[^"\']+)["\']', re.I)
_OGURL_RE = re.compile(r'<meta[^>]+property=["\']og:url["\'][^>]+content=["\'](https?://[^"\']+)["\']', re.I)
_HREF_RE  = re.compile(r'<a[^>]+href=["\'](https?://[^"\']+)["\']', re.I)

def _clean_tracking_params(url: str) -> str:
    parsed = urlparse(url)
    if not parsed.query:
        return url
    query_params = parse_qs(parsed.query, keep_blank_values=True)
    filtered_items = []
    for key, values in query_params.items():
        if key.lower().startswith("utm_") or key.lower() in {
            "oc", "ved", "usg", "clid", "ei", "sa", "source", "gws_rd", "hl", "gl", "ceid"
        }:
            continue
        for v in values:
            filtered_items.append((key, v))
    if not filtered_items:
        return urlunparse(parsed._replace(query="", fragment=""))
    clean_query = urlencode(filtered_items)
    return urlunparse(parsed._replace(query=clean_query, fragment=""))

def _is_good_publisher_url(u: str) -> bool:
    try:
        p = urlparse(u)
        host = (p.hostname or "").lower()
        if any(host.endswith(bad) for bad in _GOOGLEISH):
            return False
        if (p.path or "").lower().endswith(_IMG_EXT):
            return False
        # makale gibi dursun: alan adından sonra en az bir segment
        return p.scheme in {"http", "https"} and len((p.path or "/").strip("/").split("/")) >= 1
    except Exception:
        return False

def _extract_external_from_google_article(article_url: str, session: requests.Session) -> str | None:
    """
    Öncelik sırası:
      1) <link rel="canonical" href="...">
      2) <meta property="og:url" content="...">
      3) <a href="..."> içinde Google/CDN olmayan ilk makale linki
    """
    try:
        resp = session.get(article_url, timeout=12)
        resp.raise_for_status()
        html = resp.text

        m = _CANON_RE.search(html)
        if m and _is_good_publisher_url(m.group(1)):
            return _clean_tracking_params(m.group(1))

        m = _OGURL_RE.search(html)
        if m and _is_good_publisher_url(m.group(1)):
            return _clean_tracking_params(m.group(1))

        for u in _HREF_RE.findall(html) or []:
            if _is_good_publisher_url(u):
                return _clean_tracking_params(u)
    except Exception:
        pass
    return None

def _resolve_final_url(session: requests.Session, link: str) -> str:
    parsed = urlparse(link)

    # Google yönlendirmesi: gerçek link genelde "url" paramında
    if parsed.netloc.endswith("google.com") and parsed.path == "/url":
        target = parse_qs(parsed.query).get("url", [None])[0]
        if target:
            return _clean_tracking_params(target)

    # news.google.com/rss/articles/... → /articles/...’a yönlen; oradan yayıncı linkini çıkar
    if parsed.netloc.endswith("news.google.com") and "/rss/articles/" in parsed.path:
        try:
            r1 = session.get(link, allow_redirects=True, timeout=10)
            r1.raise_for_status()
            page_url = r1.url  # genellikle /articles/...
            ext = _extract_external_from_google_article(page_url, session)
            return _clean_tracking_params(ext or page_url)
        except Exception:
            return _clean_tracking_params(link)

    # doğrudan /articles/...
    if parsed.netloc.endswith("news.google.com") and "/articles/" in parsed.path:
        ext = _extract_external_from_google_article(link, session)
        return _clean_tracking_params(ext or link)

    # zaten dış kaynak
    return _clean_tracking_params(link)

# === 2) RSS'den haber çekme (tam makale URL'leriyle) ===
def fetch_ai_news(limit=5):
    feeds = [
        "https://news.google.com/rss/search?q=artificial+intelligence+breakthrough&hl=en-US&gl=US&ceid=US:en",
        "https://news.google.com/rss/search?q=AI+in+tourism+industry&hl=en-US&gl=US&ceid=US:en",
        "https://news.google.com/rss/search?q=generative+ai+startups&hl=en-US&gl=US&ceid=US:en",
    ]
    print("🔎 [RSS] Akışlar okunuyor...")
    articles, seen = [], set()
    with requests.Session() as session:
        for feed in feeds:
            try:
                parsed = feedparser.parse(feed)
                for entry in parsed.entries:
                    g_url = entry.link
                    if g_url in seen:
                        continue
                    final_url = _resolve_final_url(session, g_url)
                    title = entry.title
                    articles.append({"title": title, "link": final_url})
                    seen.add(g_url)
            except Exception as e:
                print(f"⚠️  [RSS] Hata ({feed}): {e}")
    # log
    for i, a in enumerate(articles[:limit], 1):
        host = urlparse(a['link']).hostname or "?"
        print(f"   • [{i}] {a['title']} → {host}")
    return articles[:limit]

# === 3) Metin üretimi (Gemini) ===
def generate_single_blog(news_list, lang_code):
    language = LANGS[lang_code]
    summaries = "\n".join([f"- {n['title']}: {n['link']}" for n in news_list])
    prompt = f"""
Write a single {language} technology blog article (400–600 words) that synthesizes the following AI news items into a coherent narrative.
Start with a title line formatted exactly as '### <title>'.
Write directly to the reader. No meta-commentary about being an AI or receiving instructions.

News:
{summaries}

Finish with one line of 5–7 relevant hashtags in {language}.
"""
    model = genai.GenerativeModel(MODEL_TEXT)

    def _call():
        resp = model.generate_content(prompt)
        return resp.text

    return with_retry(_call, tries=2, wait=6, label=f"TXT-{lang_code}")

# === 3.b) Instagram özeti ===
def generate_instagram_caption(news_list, lang_code):
    language = LANGS[lang_code]
    headlines = "\n".join([f"- {n['title']}" for n in news_list if n.get("title")])
    if not headlines:
        headlines = "- Günün öne çıkan yapay zekâ gelişmeleri"
    soft_limit = INSTAGRAM_CAPTION_LIMIT - 160
    prompt = f"""
Create a concise Instagram caption in {language} that teases today's AI blog post based on these headlines:
{headlines}

Requirements:
- Maximum {soft_limit} characters (absolute Instagram limit {INSTAGRAM_CAPTION_LIMIT}).
- Do not include URLs, @mentions, or hashtags.
- Use 2 short sentences that highlight key takeaways in an informative, inviting tone.
- Return only the caption text without additional commentary.
"""
    model = genai.GenerativeModel(MODEL_TEXT)

    def _call():
        resp = model.generate_content(prompt)
        return resp.text

    raw_caption = with_retry(_call, tries=2, wait=6, label=f"IG-{lang_code}")
    if not raw_caption:
        return ""
    return _clean_instagram_caption(raw_caption, INSTAGRAM_CAPTION_LIMIT)

# === 4) Görsel üretimi (Gemini 2.5 Flash Image) ===
def _extract_inline_image_from_gemini(response):
    if response is None:
        return None, []
    alt_texts = []
    image_bytes = None
    for cand in getattr(response, "candidates", []) or []:
        content = getattr(cand, "content", None)
        parts = getattr(content, "parts", None)
        if not parts:
            continue
        for part in parts:
            if getattr(part, "text", None):
                t = part.text.strip()
                if t:
                    alt_texts.append(t)
            inline_data = getattr(part, "inline_data", None)
            data = getattr(inline_data, "data", None) if inline_data else None
            if data:
                image_bytes = base64.b64decode(data) if isinstance(data, str) else data
                break
        if image_bytes:
            break
    return image_bytes, alt_texts

def _load_image(content: bytes) -> Image.Image:
    img = Image.open(BytesIO(content))
    img.load()
    return img

def generate_image_gemini_flash(final_prompt):
    if GOOGLE_GENAI_CLIENT is None:
        print("ℹ️ [IMG] Gemini Flash istemcisi yok; görsel atlandı.")
        return None, ""

    print("[IMG][Gemini] Üretim başlıyor...")
    def _call():
        request_kwargs = dict(
            model="gemini-2.5-flash-image",
            contents=[final_prompt],
        )
        if google_genai_types is not None:
            request_kwargs["config"] = google_genai_types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=google_genai_types.ImageConfig(aspect_ratio="16:9"),
            )
        resp = GOOGLE_GENAI_CLIENT.models.generate_content(**request_kwargs)
        image_bytes, alt_texts = _extract_inline_image_from_gemini(resp)
        if not image_bytes:
            raise RuntimeError("Gemini Flash yanıtında görsel verisi yok.")
        return _load_image(image_bytes), (alt_texts[0] if alt_texts else "")

    image, alt = with_retry(_call, tries=2, wait=6, label="IMG-Gemini")
    print("[IMG][Gemini] OK")
    return image, alt

# === 5) Kaydetme ===
def save_blog(blog_content, lang_code, image_path_for_blog: str, image_alt: str, instagram_caption: str, sources):
    if not blog_content:
        return None
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    date_time_slug = now_utc.strftime("%Y-%m-%d-%H%M")
    date_time_iso = now_utc.replace(microsecond=0).isoformat().replace("+00:00", "Z")
    slug = f"{date_time_slug}-{lang_code}-ai-news"
    path = BLOG_DIR / lang_code
    path.mkdir(exist_ok=True)

    src_title = {"tr": "Kaynaklar", "en": "Sources", "de": "Quellen", "ru": "Источники"}[lang_code]
    sources_md = "\n".join([f"- {item['link']}" for item in sources])

    image_alt_json = json.dumps(image_alt or "", ensure_ascii=False)
    caption_json = json.dumps(instagram_caption or "", ensure_ascii=False)
    html = f"""---
title: "AI Daily — {LANG_NAMES[lang_code]}"
date: {date_time_iso}
image: {image_path_for_blog}
imageAlt: {image_alt_json}
lang: {lang_code}
description: {caption_json}
---
{blog_content.strip()}

#### {src_title}
{sources_md}
"""
    post_path = path / f"{slug}.md"
    with open(post_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"[TXT][{lang_code.upper()}] OK → {slug}.md")
    return post_path

# === 6) Git ===
def commit_and_push(paths_to_stage: list[str]):
    try:
        if not paths_to_stage:
            print("ℹ️ [GIT] Commit edilecek dosya yok.")
            return
        current_time_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        subprocess.run(["git", "config", "user.name", "Fures AI Bot"], check=True)
        subprocess.run(["git", "config", "user.email", "bot@fures.at"], check=True)
        subprocess.run(["git", "add", *paths_to_stage], check=True)
        diff = subprocess.run(["git", "diff", "--cached", "--name-only"], capture_output=True, text=True, check=True)
        if not diff.stdout.strip():
            print("ℹ️ [GIT] Değişiklik yok.")
            return
        subprocess.run(["git", "commit", "-m", f"🤖 Daily AI Blog Update [auto] ({current_time_str} UTC)"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("🚀 [GIT] Gönderildi.")
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"❌ [GIT] Hata: {e}")

# === 7) Main ===
def main():
    print("===== Daily AI Blog Pipeline =====")
    news = fetch_ai_news()
    if not news:
        print("❌ [RSS] Haber bulunamadı, duruyoruz.")
        return

    # Fallback görsel rotasyonu (yerel yedekler)
    try:
        rotator = ImageRotator()
        print("✅ [IMG] /fotos yedek hazır (rotator).")
    except NoImagesAvailableError as exc:
        print(f"⚠️  [IMG] {exc} — varsayılan kapak kullanılabilir.")
        rotator = None

    primary_title = next((item.get("title") for item in news if item.get("title")), None)
    timestamp_part = datetime.datetime.utcnow().strftime("%Y%m%d%H%M")
    slug_source = slugify(primary_title) if primary_title else "ai-news"
    slug_source = (slug_source or "ai-news")[:60].rstrip("-") or "ai-news"
    image_slug = f"{timestamp_part}-{slug_source}"
    image_filename = f"{image_slug}.jpg"
    image_relative_path = f"/fotos/{image_filename}"
    image_path = FOTOS_DIR / image_filename
    image_created = False
    image_alt = ""

    # Görsel promptu
    prompt_seed = primary_title or "Artificial intelligence daily news"
    final_prompt = f"""
A visually striking 16:9 digital illustration about: "{prompt_seed}".
Cyberpunk-minimal fusion, geometric patterns, glowing neural core, cinematic volumetric lighting, high-tech palette.
"""

    try:
        generated_image, image_alt = generate_image_gemini_flash(final_prompt)
    except Exception:
        generated_image, image_alt = None, ""

    if generated_image:
        try:
            image_path.parent.mkdir(parents=True, exist_ok=True)
            # Hafif sıkıştırma (çok büyük gelir ise)
            max_w = 1600
            if generated_image.width > max_w:
                h = int(generated_image.height * (max_w / generated_image.width))
                generated_image = generated_image.resize((max_w, h), Image.LANCZOS)
            generated_image.convert("RGB").save(image_path, format="JPEG", quality=92, optimize=True)
            image_created = True
            print(f"[IMG] Kaydedildi → {image_path}")
        except Exception as e:
            print(f"❌ [IMG] Kaydetme hatası: {e}")

    # Görsel yoksa fallback
    if not image_path.exists():
        fallback_source = None
        if rotator:
            try:
                fallback_name = rotator.next_for_language("fallback")
                cand = FOTOS_DIR / fallback_name
                if cand.exists():
                    fallback_source = cand
                    print(f"ℹ️ [IMG] Yedek seçildi: {cand}")
            except Exception as e:
                print(f"⚠️  [IMG] Yedek seçilemedi: {e}")
        if fallback_source is None:
            default_source = ROOT / "public" / "images" / "fures.png"
            if default_source.exists():
                fallback_source = default_source
                print(f"ℹ️ [IMG] Varsayılan: {default_source}")
        if fallback_source and fallback_source.exists():
            try:
                image_path.parent.mkdir(parents=True, exist_ok=True)
                if fallback_source.suffix.lower() != ".jpg":
                    with Image.open(fallback_source) as im:
                        im.convert("RGB").save(image_path, format="JPEG", quality=88, optimize=True)
                else:
                    shutil.copy(fallback_source, image_path)
                image_created = True
                print(f"[IMG] Yedek kopyalandı → {image_path}")
            except Exception as e:
                print(f"❌ [IMG] Yedek kopyalanamadı: {e}")
        else:
            print("⚠️  [IMG] Hiçbir görsel yok → front-matter '/images/fures.png'")
            image_relative_path = "/images/fures.png"

    # İçerikler (4 dil) + Instagram description + gerçek kaynak linkleri
    created_posts: list[Path] = []
    for lang_code in LANGS.keys():
        print(f"--- [{LANG_NAMES[lang_code]}] üretim ---")
        try:
            blog_text = generate_single_blog(news, lang_code)
        except Exception:
            blog_text = None
        if blog_text:
            try:
                instagram_caption = generate_instagram_caption(news, lang_code)
            except Exception:
                instagram_caption = ""
            post_path = save_blog(
                blog_text,
                lang_code,
                image_relative_path,
                image_alt,
                instagram_caption,
                news,
            )
            if post_path:
                created_posts.append(post_path)
        else:
            print(f"❌ [TXT][{lang_code.upper()}] içerik oluşturulamadı.")

    paths_to_stage = [str(p.relative_to(ROOT)) for p in created_posts if p.exists()]
    if image_created and image_relative_path.startswith("/fotos/") and image_path.exists():
        paths_to_stage.append(str(image_path.relative_to(ROOT)))

    print("[GIT] Commit/push başlıyor...")
    commit_and_push(paths_to_stage)
    print("✅ Tamam.")

if __name__ == "__main__":
    main()
