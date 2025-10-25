import os, base64, datetime, subprocess, shutil, time, re
from pathlib import Path
from io import BytesIO
from urllib.parse import urlparse, parse_qs, urlunparse, urlencode

import feedparser
import requests
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

# ================== CONFIG ==================
MODEL_TEXT = "gemini-2.5-pro"
LANGS = {"tr": "Turkish", "en": "English", "de": "German", "ru": "Russian"}
LANG_NAMES = {"tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский"}

ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
FOTOS_DIR = ROOT / "fotos"
BLOG_DIR.mkdir(exist_ok=True)
FOTOS_DIR.mkdir(exist_ok=True)

# ================== INIT ==================
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY yok!")
genai.configure(api_key=GEMINI_API_KEY)
print("✅ [INIT] Gemini (metin) hazır.")

GOOGLE_GENAI_CLIENT = None
if google_genai_lib is None:
    print("ℹ️ [INIT] google.genai yok; görsel üretimi atlanır.")
else:
    try:
        GOOGLE_GENAI_CLIENT = google_genai_lib.Client(api_key=GEMINI_API_KEY)
        print("✅ [INIT] Gemini (görsel) hazır.")
    except Exception as e:
        print(f"❌ [INIT] google.genai istemcisi açılamadı: {e}")

# ================== UTIL ==================
def with_retry(fn, tries=2, wait=6, label=""):
    for i in range(tries):
        try:
            return fn()
        except Exception as e:
            if i == tries - 1:
                print(f"❌ [{label}] Denemeler bitti: {e}")
                raise
            print(f"⚠️  [{label}] {e} → {i+1}. deneme başarısız, {wait}s bekleniyor...")
            time.sleep(wait)

def _clean_tracking_params(url: str) -> str:
    p = urlparse(url)
    if not p.query:
        return url
    q = parse_qs(p.query, keep_blank_values=True)
    filtered = []
    for k, vals in q.items():
        if k.lower().startswith("utm_") or k.lower() in {"oc","ved","usg","clid","ei","sa","source","gws_rd","hl","gl","ceid"}:
            continue
        for v in vals:
            filtered.append((k, v))
    new_q = urlencode(filtered)
    return urlunparse(p._replace(query=new_q, fragment=""))

# ---- Google News sayfasından orijinal linki çıkar ----
_ORIGINAL_LINK_RE = re.compile(
    r'href="(https?://(?!news\.google\.com)(?!www\.google\.com)[^"]+)"'
)

def _extract_external_from_google_article(article_url: str, session: requests.Session) -> str | None:
    """
    news.google.com/articles/... sayfasını indirip google alan adı dışındaki ilk mutlak URL'yi döndürür.
    """
    try:
        resp = session.get(article_url, timeout=12)
        resp.raise_for_status()
        html = resp.text
        # 1) Açık <a href="https://publisher..."> yakala
        m = _ORIGINAL_LINK_RE.search(html)
        if m:
            return _clean_tracking_params(m.group(1))
        # 2) Bazı varyantlarda JSON içinde çıplak URL olur
        m2 = re.search(r'"(https?://(?!news\.google\.com)(?!www\.google\.com)[^"]+)"', html)
        if m2:
            return _clean_tracking_params(m2.group(1))
    except Exception:
        pass
    return None

def _resolve_final_url(session: requests.Session, link: str) -> str:
    """
    RSS linkini gerçek yayıncı linkine çevir.
    - https://news.google.com/rss/articles/... → önce /articles/... sayfasına, oradan yayıncı URL’sine
    - https://www.google.com/url?url=<gerçek> → url paramından çek
    """
    parsed = urlparse(link)

    # google.com/url?url=...
    if parsed.netloc.endswith("google.com") and parsed.path == "/url":
        target = parse_qs(parsed.query).get("url", [None])[0]
        if target:
            return _clean_tracking_params(target)

    # news.google.com/rss/articles/... → önce /articles/...’a yönlen
    if parsed.netloc.endswith("news.google.com") and "/rss/articles/" in parsed.path:
        try:
            # İlk istek: rss/articles → çoğu zaman /articles/...’a 302 verir
            r1 = session.get(link, allow_redirects=True, timeout=10)
            r1.raise_for_status()
            page_url = r1.url
            # /articles/... sayfasından yayıncı linkini kazı
            external = _extract_external_from_google_article(page_url, session)
            if external:
                return external
            # dış link bulunamazsa en azından sayfa_url (Google makale sayfası) döner
            return _clean_tracking_params(page_url)
        except Exception:
            return _clean_tracking_params(link)

    # news.google.com/articles/... → doğrudan sayfayı kazı
    if parsed.netloc.endswith("news.google.com") and "/articles/" in parsed.path:
        external = _extract_external_from_google_article(link, session)
        if external:
            return external
        return _clean_tracking_params(link)

    return _clean_tracking_params(link)

# ================== RSS ==================
def fetch_ai_news(limit=5):
    feeds = [
        "https://news.google.com/rss/search?q=artificial+intelligence+breakthrough&hl=en-US&gl=US&ceid=US:en",
        "https://news.google.com/rss/search?q=AI+in+tourism+industry&hl=en-US&gl=US&ceid=US:en",
        "https://news.google.com/rss/search?q=generative+ai+startups&hl=en-US&gl=US&ceid=US:en",
    ]
    print("🔎 [RSS] Akışlar okunuyor...")
    arts, seen = [], set()
    with requests.Session() as session:
        for feed in feeds:
            try:
                parsed = feedparser.parse(feed)
                for entry in parsed.entries:
                    g_url = entry.link
                    if g_url in seen:
                        continue
                    final_url = _resolve_final_url(session, g_url)
                    arts.append({"title": entry.title, "link": final_url})
                    seen.add(g_url)
            except Exception as e:
                print(f"⚠️  [RSS] Hata ({feed}): {e}")
    for i, a in enumerate(arts[:limit], 1):
        print(f"   • [{i}] {a['title']} → {a['link']}")
    return arts[:limit]

# ================== TEXT (Gemini) ==================
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

# ================== IMAGE (Gemini) ==================
def _extract_inline_image_from_gemini(response):
    if response is None:
        return None, []
    alt_texts, image_bytes = [], None
    for cand in getattr(response, "candidates", []) or []:
        content = getattr(cand, "content", None)
        parts = getattr(content, "parts", None)
        if not parts:
            continue
        for part in parts:
            if getattr(part, "text", None):
                t = part.text.strip()
                if t: alt_texts.append(t)
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
        print("ℹ️ [IMG] Gemini Flash yok; görsel atlandı.")
        return None, ""
    print("[IMG][Gemini] Üretim başlıyor...")
    def _call():
        kwargs = dict(model="gemini-2.5-flash-image", contents=[final_prompt])
        if google_genai_types is not None:
            kwargs["config"] = google_genai_types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=google_genai_types.ImageConfig(aspect_ratio="16:9"),
            )
        resp = GOOGLE_GENAI_CLIENT.models.generate_content(**kwargs)
        b, alts = _extract_inline_image_from_gemini(resp)
        if not b:
            raise RuntimeError("Gemini Flash: görsel verisi yok.")
        return _load_image(b), (alts[0] if alts else "")
    image, alt = with_retry(_call, tries=2, wait=6, label="IMG-Gemini")
    print("[IMG][Gemini] OK")
    return image, alt

# ================== SAVE ==================
def save_blog(blog_content, lang_code, image_path_for_blog: str, image_alt: str, sources):
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

    html = f"""---
title: "AI Daily — {LANG_NAMES[lang_code]}"
date: {date_time_iso}
image: {image_path_for_blog}
imageAlt: {image_alt!r}
lang: {lang_code}
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

# ================== GIT ==================
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

# ================== MAIN ==================
def main():
    print("===== Daily AI Blog Pipeline =====")
    news = fetch_ai_news()
    if not news:
        print("❌ [RSS] Haber bulunamadı, duruyoruz.")
        return

    try:
        rotator = ImageRotator()
        print("✅ [IMG] /fotos yedek hazır (rotator).")
    except NoImagesAvailableError as exc:
        print(f"⚠️  [IMG] {exc} — varsayılan kapak kullanılabilir.")
        rotator = None

    primary_title = next((it.get("title") for it in news if it.get("title")), None)
    timestamp_part = datetime.datetime.utcnow().strftime("%Y%m%d%H%M")
    slug_source = (slugify(primary_title) if primary_title else "ai-news") or "ai-news"
    slug_source = slug_source[:60].rstrip("-") or "ai-news"
    image_slug = f"{timestamp_part}-{slug_source}"
    image_filename = f"{image_slug}.jpg"
    image_relative_path = f"/fotos/{image_filename}"
    image_path = FOTOS_DIR / image_filename
    image_created = False
    image_alt = ""

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
            max_w = 1600
            if generated_image.width > max_w:
                h = int(generated_image.height * (max_w / generated_image.width))
                generated_image = generated_image.resize((max_w, h), Image.LANCZOS)
            generated_image.convert("RGB").save(image_path, format="JPEG", quality=92, optimize=True)
            image_created = True
            print(f"[IMG] Kaydedildi → {image_path}")
        except Exception as e:
            print(f"❌ [IMG] Kaydetme hatası: {e}")

    if not image_path.exists():
        fallback_source = None
        if rotator:
            try:
                name = rotator.next_for_language("fallback")
                cand = FOTOS_DIR / name
                if cand.exists():
                    fallback_source = cand
                    print(f"ℹ️ [IMG] Yedek: {cand}")
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
            print("⚠️  [IMG] Görsel yok → front-matter '/images/fures.png'")
            image_relative_path = "/images/fures.png"

    created_posts: list[Path] = []
    for lang_code in LANGS.keys():
        print(f"--- [{LANG_NAMES[lang_code]}] üretim ---")
        try:
            blog_text = generate_single_blog(news, lang_code)
        except Exception:
            blog_text = None
        if blog_text:
            post_path = save_blog(blog_text, lang_code, image_relative_path, image_alt, news)
            if post_path:
                created_posts.append(post_path)
        else:
            print(f"❌ [TXT][{lang_code.upper()}] içerik oluşturulamadı.")

    paths = [str(p.relative_to(ROOT)) for p in created_posts if p.exists()]
    if image_created and image_relative_path.startswith("/fotos/") and image_path.exists():
        paths.append(str(image_path.relative_to(ROOT)))

    print("[GIT] Commit/push başlıyor...")
    commit_and_push(paths)
    print("✅ Tamam.")

if __name__ == "__main__":
    main()
