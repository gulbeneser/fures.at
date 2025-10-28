import os
import base64
import feedparser
import datetime
import subprocess
import shutil
import json
import re
import argparse
import textwrap
from pathlib import Path
from zoneinfo import ZoneInfo
from typing import Any, Dict, List, Optional, Tuple
from xml.etree import ElementTree as ET
import requests
from urllib.parse import urlparse, parse_qs, urlunparse, urlencode
from io import BytesIO
from PIL import Image, ImageOps  # Pillow gerekli!

from image_rotation import ImageRotator, NoImagesAvailableError
from utils import slugify

# --- Gemini (metin) ---
import google.generativeai as genai
from google.generativeai import types as genai_types

# --- Gemini (görsel) ---
try:
    from google import genai as google_genai_lib
    from google.genai import types as google_genai_types
except Exception:
    google_genai_lib = None
    google_genai_types = None

# --- OpenAI (opsiyonel) ---
try:
    from openai import OpenAI  # type: ignore
except Exception:
    OpenAI = None

# === CONFIG ===
MODEL_TEXT = "gemini-2.5-pro"
LANGS = {"tr": "Turkish", "en": "English", "de": "German", "ru": "Russian"}
LANG_NAMES = {"tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский"}
INSTAGRAM_CAPTION_LIMIT = 2200
SITE_BASE_URL = os.environ.get("SITE_BASE_URL", "https://fures.at").rstrip("/") or "https://fures.at"
ISTANBUL_TZ = ZoneInfo("Europe/Istanbul")

CAMPAIGN_TOPIC_FEEDS = [
    "https://news.google.com/rss/search?q=Türkiye%20reklam%20ajansı&hl=tr&gl=TR&ceid=TR:tr",
    "https://news.google.com/rss/search?q=KKTC%20dijital%20ajans&hl=tr&gl=TR&ceid=TR:tr",
    "https://news.google.com/rss/search?q=Türkiye%20yapay%20zeka%20otomasyon&hl=tr&gl=TR&ceid=TR:tr",
    "https://news.google.com/rss/search?q=Türkiye%20e-ticaret%20trendleri&hl=tr&gl=TR&ceid=TR:tr",
    "https://news.google.com/rss/search?q=Türkiye%20otel%20turizm%20teknoloji&hl=tr&gl=TR&ceid=TR:tr",
    "https://trends.google.com/trends/trendingsearches/daily/rss?geo=TR",
]

CAMPAIGN_KEYWORDS = [
    "ai",
    "yapay zek",
    "otomasyon",
    "dijital",
    "marketing",
    "reklam",
    "kampanya",
    "e-ticaret",
    "otel",
    "turizm",
    "sağlık",
    "kob",
]

CAMPAIGN_SERVICE_KEYWORDS = [
    "crm",
    "otomasyon",
    "içerik",
    "lead",
    "performans",
    "analitik",
    "reels",
    "linkedin",
    "instagram",
    "whatsapp",
]

CAMPAIGN_FORBIDDEN_PATTERNS = [
    re.compile(r"\b(?:fiyat|indirim|ücret|tl|₺|dolar|euro|%\s*\d{1,3}|\d{1,3}\s*%)\b", re.IGNORECASE),
    re.compile(r"\b\d+\s*(?:tl|₺|usd|eur)\b", re.IGNORECASE),
]

ENGLISH_STOPWORDS = {
    "the",
    "and",
    "to",
    "of",
    "for",
    "with",
    "in",
    "on",
    "your",
    "you",
    "from",
    "by",
    "a",
    "an",
    "is",
    "are",
    "be",
    "this",
    "that",
    "at",
    "as",
}

INSTAGRAM_TEXT_LIMIT = 1900
LINKEDIN_TEXT_LIMIT = 900
INSTAGRAM_EMOJI_LIMIT = 4
LINKEDIN_EMOJI_LIMIT = 2
INSTAGRAM_HASHTAG_MIN = 12
INSTAGRAM_HASHTAG_MAX = 18
LINKEDIN_HASHTAG_MIN = 8
LINKEDIN_HASHTAG_MAX = 14
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
XHTML_NS = "http://www.w3.org/1999/xhtml"

ET.register_namespace("", SITEMAP_NS)
ET.register_namespace("xhtml", XHTML_NS)

ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
FOTOS_DIR = ROOT / "fotos"
CAMPAIGNS_DIR = ROOT / "kampanyalar"
PUBLIC_DIR = ROOT / "public"
CAMPAIGN_IMAGE_BASE_DIR = PUBLIC_DIR / "campaigns"

BLOG_DIR.mkdir(exist_ok=True)
FOTOS_DIR.mkdir(exist_ok=True)
CAMPAIGNS_DIR.mkdir(exist_ok=True)
CAMPAIGN_IMAGE_BASE_DIR.mkdir(parents=True, exist_ok=True)

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

OPENAI_CLIENT = None
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if OpenAI is None:
    if OPENAI_API_KEY:
        print("ℹ️ [INIT] openai paketi bulunamadı; OpenAI görsel yedeği pasif.")
else:
    if OPENAI_API_KEY:
        try:
            OPENAI_CLIENT = OpenAI(api_key=OPENAI_API_KEY)
            print("✅ [INIT] OpenAI (görsel) hazır.")
        except Exception as exc:
            print(f"⚠️  [INIT] OpenAI istemcisi açılamadı: {exc}")
    else:
        print("ℹ️ [INIT] OPENAI_API_KEY tanımlı değil; OpenAI görsel yedeği pasif.")

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


def _extract_json_blob(text: str):
    if not text:
        return None
    cleaned = text.strip()
    if cleaned.startswith("```"):
        parts = cleaned.split("```")
        if len(parts) >= 2:
            cleaned = parts[1]
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    candidate = cleaned[start : end + 1]
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        try:
            return json.loads(candidate.replace("\u2019", "'").replace("\u2018", "'"))
        except json.JSONDecodeError as exc:
            print(f"❌ [JSON] Ayrıştırılamadı: {exc}")
            return None

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
def _clean_tracking_params(url: str) -> str:
    parsed = urlparse(url)
    if not parsed.query:
        return url
    query_params = parse_qs(parsed.query, keep_blank_values=True)
    filtered_items = []
    for key, values in query_params.items():
        if key.lower().startswith("utm_") or key.lower() in {"oc","ved","usg","clid","ei","sa","source","gws_rd"}:
            continue
        for v in values:
            filtered_items.append((key, v))
    if not filtered_items:
        return urlunparse(parsed._replace(query="", fragment=""))
    clean_query = urlencode(filtered_items)
    return urlunparse(parsed._replace(query=clean_query, fragment=""))

def _resolve_final_url(session: requests.Session, link: str) -> str:
    parsed = urlparse(link)

    # Google yönlendirmesi: gerçek link genelde "url" paramında
    if parsed.netloc.endswith("google.com") and parsed.path == "/url":
        target = parse_qs(parsed.query).get("url", [None])[0]
        if target:
            return _clean_tracking_params(target)

    # news.google.com → gerçek siteye takip et
    if parsed.netloc.endswith("news.google.com"):
        try:
            resp = session.get(link, allow_redirects=True, timeout=10, stream=True)
            resp.raise_for_status()
            final_url = resp.url
            resp.close()
            if final_url:
                return _clean_tracking_params(final_url)
        except requests.RequestException:
            pass

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

                    # Bazı girdilerde "source" alanı var; ama biz her zaman tam makale URL'sini istiyoruz
                    # final_url zaten Google yönlendirmesinden arındırıldı.
                    title = entry.title
                    articles.append({"title": title, "link": final_url})
                    seen.add(g_url)
            except Exception as e:
                print(f"⚠️  [RSS] Hata ({feed}): {e}")
    # log
    for i, a in enumerate(articles[:limit], 1):
        print(f"   • [{i}] {a['title']} → {a['link']}")
    return articles[:limit]

# === 3) Metin üretimi (Gemini) ===
def generate_single_blog(news_list, lang_code):
    language = LANGS[lang_code]
    # Model içeriğe odaklansın diye kısa ve net prompt:
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


# === Kampanya üretimi ===
def _ensure_list(value, min_items=0):
    if isinstance(value, list):
        return value
    if value is None:
        return []
    if isinstance(value, str):
        items = [item.strip() for item in re.split(r"[\n;]+", value) if item.strip()]
        if items:
            return items
    return [] if min_items == 0 else [value]


EMOJI_REGEX = re.compile(r"[\U0001F300-\U0001FAFF\U00002600-\U000026FF\U00002700-\U000027BF\U0001F1E6-\U0001F1FF]")


def _clean_text(value: Optional[str]) -> str:
    if not isinstance(value, str):
        return ""
    return value.strip()


def _count_emojis(text: str) -> int:
    if not text:
        return 0
    return len(EMOJI_REGEX.findall(text))


def _paragraph_count(text: str) -> int:
    if not text:
        return 0
    parts = [part.strip() for part in re.split(r"\n\s*\n", text.strip()) if part.strip()]
    return len(parts)


def _english_ratio(*texts: str) -> float:
    content = " ".join(text for text in texts if isinstance(text, str))
    if not content:
        return 0.0
    words = re.findall(r"[A-Za-zÇĞİÖŞÜçğıöşü]+", content)
    if not words:
        return 0.0
    english_hits = 0
    for word in words:
        lw = word.lower()
        if lw in ENGLISH_STOPWORDS or any(ch in lw for ch in ("w", "q", "x")):
            english_hits += 1
    return english_hits / max(len(words), 1)


def _has_forbidden_terms(text: str) -> bool:
    for pattern in CAMPAIGN_FORBIDDEN_PATTERNS:
        if pattern.search(text):
            return True
    return False


def _normalise_hashtags(raw_list: Any) -> List[str]:
    if isinstance(raw_list, list):
        tags = []
        for item in raw_list:
            if not isinstance(item, str):
                continue
            cleaned = item.strip()
            if not cleaned:
                continue
            if not cleaned.startswith("#"):
                cleaned = f"#{cleaned}".replace("##", "#")
            tags.append(cleaned)
        return tags
    if isinstance(raw_list, str):
        candidates = [part.strip() for part in re.split(r"[,\s]+", raw_list) if part.strip()]
        return [tag if tag.startswith("#") else f"#{tag}" for tag in candidates]
    return []


def _slugify_campaign(value: str) -> str:
    base = slugify(value) if value else "kampanya"
    base = base.strip("-")
    return base or "kampanya"


def _ensure_slug(slug_candidate: Optional[str], title: str) -> str:
    candidate = _clean_text(slug_candidate)
    if candidate and re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", candidate):
        return candidate
    return _slugify_campaign(title)


def _yaml_block(key: str, value: str) -> List[str]:
    lines = [f"{key}: |"]
    cleaned = (value or "").replace("\r\n", "\n").strip("\n")
    if not cleaned:
        lines.append("  ")
        return lines
    for line in cleaned.split("\n"):
        lines.append(f"  {line}")
    return lines


def _yaml_string_list(key: str, items: List[str]) -> List[str]:
    if not items:
        return [f"{key}: []"]
    lines = [f"{key}:"]
    for item in items:
        lines.append(f"  - {json.dumps(item, ensure_ascii=False)}")
    return lines


def _yaml_package_list(key: str, items: List[Dict[str, Any]]) -> List[str]:
    if not items:
        return [f"{key}: []"]
    lines = [f"{key}:"]
    for item in items:
        lines.append("  -")
        for sub_key in ("name", "desc", "cta"):
            if sub_key in item:
                lines.append(f"      {sub_key}: {json.dumps(item[sub_key], ensure_ascii=False)}")
    return lines


def _parse_published(entry) -> Optional[datetime.datetime]:
    for attr in ("published_parsed", "updated_parsed"):
        value = getattr(entry, attr, None)
        if value:
            try:
                return datetime.datetime(*value[:6], tzinfo=datetime.timezone.utc)
            except Exception:
                continue
    date_value = getattr(entry, "published", None) or getattr(entry, "updated", None)
    if date_value:
        try:
            parsed = datetime.datetime.fromisoformat(date_value)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=datetime.timezone.utc)
            return parsed.astimezone(datetime.timezone.utc)
        except Exception:
            pass
    return None


def _score_topic_entry(title: str, summary: str, published: Optional[datetime.datetime]) -> float:
    text = f"{title} {summary}".lower()
    now = datetime.datetime.now(datetime.timezone.utc)
    recency_score = 0.0
    if published:
        delta_hours = (now - published).total_seconds() / 3600
        if delta_hours <= 0:
            recency_score = 1.0
        elif delta_hours <= 48:
            recency_score = max(0.0, 1.0 - (delta_hours / 48.0))
    keyword_hits = sum(0.25 for kw in CAMPAIGN_KEYWORDS if kw in text)
    service_hits = sum(0.2 for kw in CAMPAIGN_SERVICE_KEYWORDS if kw in text)
    geo_boost = 0.4 if any(key in text for key in ("türkiye", "kktc", "kıbrıs", "istanbul", "ankara", "izmir")) else 0.0
    return recency_score * 3.0 + keyword_hits + service_hits + geo_boost


def collect_campaign_topics(limit: int = 24) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []
    seen_links: set[str] = set()
    for feed_url in CAMPAIGN_TOPIC_FEEDS:
        try:
            parsed = feedparser.parse(feed_url)
        except Exception as exc:
            print(f"⚠️  [KAMPANYA][RSS] {feed_url} okunamadı: {exc}")
            continue
        for entry in getattr(parsed, "entries", [])[:limit]:
            link = getattr(entry, "link", None)
            title = _clean_text(getattr(entry, "title", ""))
            summary = _clean_text(getattr(entry, "summary", ""))
            if not link or not title:
                continue
            if link in seen_links:
                continue
            seen_links.add(link)
            published = _parse_published(entry)
            score = _score_topic_entry(title, summary, published)
            if score <= 0:
                continue
            results.append(
                {
                    "title": title,
                    "summary": summary,
                    "link": link,
                    "published": published,
                    "score": score,
                    "source": urlparse(link).netloc,
                }
            )
    results.sort(key=lambda item: item.get("score", 0), reverse=True)
    return results[:limit]


def build_topic_context(topics: List[Dict[str, Any]]) -> Tuple[Dict[str, Any], str]:
    if not topics:
        raise ValueError("Trend listesi boş.")
    primary = topics[0]
    lines = []
    for topic in topics[:6]:
        published = topic.get("published")
        published_str = ""
        if published:
            published_str = published.astimezone(ISTANBUL_TZ).strftime("%d %B %Y %H:%M")
        summary = topic.get("summary") or ""
        lines.append(
            f"- Başlık: {topic['title']} (Kaynak: {topic['source']}, Yayın: {published_str or 'bilinmiyor'})\n  Özet: {summary}"
        )
    context = "\n".join(lines)
    return primary, context


def request_campaign_payload(
    topic: Dict[str, Any],
    topic_context: str,
    attempt: int = 1,
    previous_errors: Optional[str] = None,
) -> Dict[str, Any]:
    model = genai.GenerativeModel(MODEL_TEXT)
    today = datetime.datetime.now(ISTANBUL_TZ)
    system_rules = textwrap.dedent(
        f"""
Sadece JSON üret. Şema: KAMPANYA_POSTU_V2.

Bağlam:
- Hedef kitle: Türkiye & KKTC’deki KOBİ’ler, oteller, eczaneler, ajans hizmetine ihtiyaç duyan işletmeler.
- Amaç: Fiyat vermeden, sonuç odaklı kampanya postu. Kısa, net, CTA içerir.
- Dil: %100 Türkçe. Emoji sınırı: IG=4, LinkedIn=2. Hashtag sayısı: IG 12–18, LN 8–14.
- Görsel: 1080×1350, 4:5. Tipografi ve renk önerisini prompt içinde belirt.
- Yasak: Makale/kılavuz tarzı uzun anlatım, teknik ders, fiyat/indirim çağrısı.

Girdi:
- Günün trend başlığı: {topic.get('title')}
- Kaynak bağlantısı: {topic.get('link')}
- Kaynak özeti: {topic.get('summary')}
- Trend notları:
{topic_context}
- Fures Tech hizmetleri: Yapay zekâ destekli pazarlama, otomasyon, içerik, CRM entegrasyonu.
- Bugünün tarihi: {today.strftime('%Y-%m-%d %H:%M')} (Europe/Istanbul)
"""
    ).strip()

    if previous_errors:
        system_rules += "\n- Önceki deneme hatası: " + previous_errors

    prompt = system_rules + "\n\nÇıktı:\n- Mutlaka KAMPANYA_POSTU_V2 şemasına %100 uyan tek JSON.\n- Alan dışı hiçbir şey yazma."

    def _call():
        response = model.generate_content(
            prompt,
            generation_config=genai_types.GenerationConfig(
                temperature=0.35,
                top_p=0.85,
                response_mime_type="application/json",
            ),
        )
        if hasattr(response, "text") and response.text:
            return response.text
        # Yeni SDK yanıtı content.parts şeklinde olabilir
        try:
            return response.candidates[0].content.parts[0].text
        except Exception:
            return ""

    raw = with_retry(_call, tries=3, wait=10, label=f"KAMPANYA-{attempt}")
    payload = _extract_json_blob(raw or "")
    if not payload:
        raise ValueError("Kampanya çıktısı JSON formatında alınamadı.")
    if not isinstance(payload, dict):
        raise ValueError("Kampanya çıktısı sözlük formatında olmalı.")
    return payload


def validate_campaign_payload(payload: Dict[str, Any], topic: Dict[str, Any]) -> Dict[str, Any]:
    errors: List[str] = []

    title = _clean_text(payload.get("title"))
    summary = _clean_text(payload.get("summary"))
    date_value = _clean_text(payload.get("date"))
    time_value = _clean_text(payload.get("time"))
    visual = payload.get("visual") or {}
    instagram = payload.get("instagram") or {}
    linkedin = payload.get("linkedin") or {}
    packages_raw = payload.get("packages") or []
    utm_value = _clean_text(payload.get("utm"))

    if not title or len(title.split()) < 3:
        errors.append("title alanı eksik veya çok kısa.")

    if not summary or len(summary) > 200:
        errors.append("summary alanı boş olamaz ve 200 karakteri aşmamalı.")

    if not date_value:
        errors.append("date alanı zorunludur.")
    if not time_value:
        errors.append("time alanı zorunludur.")

    try:
        date_obj = datetime.datetime.strptime(date_value, "%Y-%m-%d").date()
    except ValueError:
        errors.append("date alanı YYYY-MM-DD formatında olmalı.")
        date_obj = None

    try:
        time_obj = datetime.datetime.strptime(time_value, "%H:%M").time()
    except ValueError:
        errors.append("time alanı HH:MM formatında olmalı.")
        time_obj = None

    slug_value = _ensure_slug(payload.get("slug"), title or topic.get("title", ""))
    if len(slug_value) > 60:
        errors.append("slug çok uzun (maks 60 karakter).")

    visual_prompt = _clean_text(visual.get("prompt"))
    visual_alt = _clean_text(visual.get("alt"))
    if not visual_prompt:
        errors.append("visual.prompt boş.")
    else:
        prompt_lower = visual_prompt.lower()
        if not any(token in prompt_lower for token in ("1080", "1350", "4:5", "4×5", "4 x 5")):
            errors.append("visual.prompt 1080x1350 veya 4:5 bilgisini içermeli.")
    if not visual_alt:
        visual_alt = title

    insta_caption = _clean_text(instagram.get("caption"))
    if not insta_caption:
        errors.append("instagram.caption boş.")
    elif len(insta_caption) > INSTAGRAM_TEXT_LIMIT:
        errors.append("instagram.caption 1900 karakter sınırını aşıyor.")
    if _count_emojis(insta_caption) > INSTAGRAM_EMOJI_LIMIT:
        errors.append("instagram.caption emoji sınırını aşıyor.")
    if _paragraph_count(insta_caption) > 3:
        errors.append("instagram.caption üç paragraftan fazla olamaz.")

    insta_tags = _normalise_hashtags(instagram.get("hashtags"))
    # remove duplicates preserving order
    seen = set()
    dedup_tags = []
    for tag in insta_tags:
        if tag not in seen:
            dedup_tags.append(tag)
            seen.add(tag)
    insta_tags = dedup_tags
    if not (INSTAGRAM_HASHTAG_MIN <= len(insta_tags) <= INSTAGRAM_HASHTAG_MAX):
        errors.append("instagram.hashtags 12-18 arasında olmalı.")

    linkedin_post = _clean_text(linkedin.get("post"))
    if not linkedin_post:
        errors.append("linkedin.post boş.")
    elif len(linkedin_post) > LINKEDIN_TEXT_LIMIT:
        errors.append("linkedin.post 900 karakter sınırını aşıyor.")
    if _count_emojis(linkedin_post) > LINKEDIN_EMOJI_LIMIT:
        errors.append("linkedin.post emoji sınırını aşıyor.")
    if _paragraph_count(linkedin_post) > 3:
        errors.append("linkedin.post üç paragraftan fazla olamaz.")

    linkedin_tags = _normalise_hashtags(linkedin.get("hashtags"))
    seen_ln = set()
    dedup_ln = []
    for tag in linkedin_tags:
        if tag not in seen_ln:
            dedup_ln.append(tag)
            seen_ln.add(tag)
    linkedin_tags = dedup_ln
    if not (LINKEDIN_HASHTAG_MIN <= len(linkedin_tags) <= LINKEDIN_HASHTAG_MAX):
        errors.append("linkedin.hashtags 8-14 arasında olmalı.")

    if not isinstance(packages_raw, list) or not packages_raw:
        errors.append("packages en az bir öğe içermeli.")
    packages_clean: List[Dict[str, Any]] = []
    if isinstance(packages_raw, list):
        for pkg in packages_raw:
            if not isinstance(pkg, dict):
                continue
            name = _clean_text(pkg.get("name"))
            desc = _clean_text(pkg.get("desc")) or _clean_text(pkg.get("description"))
            cta = _clean_text(pkg.get("cta"))
            if not name or not desc:
                continue
            if not cta:
                cta = f"/kampanyalar/{slug_value}"
            if cta != f"/kampanyalar/{slug_value}":
                errors.append("packages.cta değeri /kampanyalar/{slug} olmalı.")
            packages_clean.append({"name": name, "desc": desc, "cta": cta})
    if not packages_clean:
        errors.append("packages doğru biçimde sağlanmadı.")

    if utm_value != "utm_source=instagram&utm_medium=social&utm_campaign=daily_kit":
        errors.append("utm değeri beklenen parametrelerle eşleşmiyor.")

    combined_text = " ".join(
        [title, summary, insta_caption, linkedin_post]
        + insta_tags
        + linkedin_tags
        + [pkg["name"] + " " + pkg["desc"] for pkg in packages_clean]
    )
    if _has_forbidden_terms(combined_text):
        errors.append("Fiyat/indirim içeren terimler tespit edildi.")

    if _english_ratio(combined_text) > 0.1:
        errors.append("İçerikte İngilizce oranı %10'dan fazla.")

    if errors:
        raise ValueError("; ".join(errors))

    if date_obj and time_obj:
        local_dt = datetime.datetime.combine(date_obj, time_obj, tzinfo=ISTANBUL_TZ)
    else:
        local_dt = datetime.datetime.now(ISTANBUL_TZ)

    file_slug = local_dt.strftime("%Y-%m-%d-%H%M") + "-tr-kampanya"
    rel_dir = f"{local_dt.year:04d}/{local_dt.month:02d}/{local_dt.day:02d}"
    og_image = f"/campaigns/{rel_dir}/{slug_value}.jpg"
    image_path = CAMPAIGN_IMAGE_BASE_DIR / rel_dir / f"{slug_value}.jpg"

    return {
        "title": title,
        "summary": summary,
        "description": summary,
        "slug": slug_value,
        "file_name": file_slug,
        "iso_datetime": local_dt.isoformat(),
        "visual_prompt": visual_prompt,
        "visual_alt": visual_alt or title,
        "instagram_caption": insta_caption,
        "instagram_hashtags": insta_tags,
        "linkedin_post": linkedin_post,
        "linkedin_hashtags": linkedin_tags,
        "packages": packages_clean,
        "utm": utm_value,
        "og_image": og_image,
        "timestamp": local_dt,
        "image_path": image_path,
    }


def build_campaign_markdown(data: Dict[str, Any]) -> List[str]:
    lines = ["---"]
    lines.append(f"title: {json.dumps(data['title'], ensure_ascii=False)}")
    lines.append(f"date: {data['iso_datetime']}")
    lines.append(f"slug: {data['slug']}")
    lines.append(f"summary: {json.dumps(data['summary'], ensure_ascii=False)}")
    lines.append(f"description: {json.dumps(data['description'], ensure_ascii=False)}")
    lines.append(f"ogImage: {data['og_image']}")
    lines.append(f"imageAlt: {json.dumps(data['visual_alt'], ensure_ascii=False)}")
    lines.append("lang: tr")
    lines.extend(_yaml_block("instagramCaption", data["instagram_caption"]))
    lines.extend(_yaml_string_list("instagramHashtags", data["instagram_hashtags"]))
    lines.extend(_yaml_block("linkedinPost", data["linkedin_post"]))
    lines.extend(_yaml_string_list("linkedinHashtags", data["linkedin_hashtags"]))
    lines.extend(_yaml_package_list("packages", data["packages"]))
    lines.append(f"utm: {json.dumps(data['utm'], ensure_ascii=False)}")
    lines.append("---")
    lines.append("**CTA:** Strateji seansı → /iletisim")
    lines.append("")
    return lines


def save_campaign_post(data: Dict[str, Any]) -> Path:
    kampanya_dir = CAMPAIGNS_DIR / "tr"
    kampanya_dir.mkdir(parents=True, exist_ok=True)
    lines = build_campaign_markdown(data)
    post_path = kampanya_dir / f"{data['file_name']}.md"
    with open(post_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"[KAMPANYA] OK → {post_path}")
    return post_path


def update_sitemap_with_campaign(slug: str, timestamp: datetime.datetime) -> Optional[Path]:
    sitemap_path = PUBLIC_DIR / "sitemap.xml"
    if not sitemap_path.exists():
        print("ℹ️ [SITEMAP] sitemap.xml bulunamadı, atlanıyor.")
        return None

    try:
        tree = ET.parse(sitemap_path)
    except ET.ParseError as exc:
        print(f"⚠️  [SITEMAP] sitemap.xml parse edilemedi: {exc}")
        return None

    root = tree.getroot()

    def _find_url(target: str):
        for url in root.findall(f"{{{SITEMAP_NS}}}url"):
            loc_elem = url.find(f"{{{SITEMAP_NS}}}loc")
            if loc_elem is not None and loc_elem.text == target:
                return url
        return None

    lastmod_value = timestamp.strftime("%Y-%m-%d")
    base_url = f"{SITE_BASE_URL}/kampanyalar"
    base_entry = _find_url(base_url)
    if base_entry is None:
        base_entry = ET.SubElement(root, f"{{{SITEMAP_NS}}}url")
        ET.SubElement(base_entry, f"{{{SITEMAP_NS}}}loc").text = base_url
    lastmod_elem = base_entry.find(f"{{{SITEMAP_NS}}}lastmod")
    if lastmod_elem is None:
        lastmod_elem = ET.SubElement(base_entry, f"{{{SITEMAP_NS}}}lastmod")
    lastmod_elem.text = lastmod_value
    changefreq = base_entry.find(f"{{{SITEMAP_NS}}}changefreq")
    if changefreq is None:
        changefreq = ET.SubElement(base_entry, f"{{{SITEMAP_NS}}}changefreq")
    changefreq.text = "daily"
    priority = base_entry.find(f"{{{SITEMAP_NS}}}priority")
    if priority is None:
        priority = ET.SubElement(base_entry, f"{{{SITEMAP_NS}}}priority")
    priority.text = "0.85"

    detail_url = f"{base_url}/{slug}"
    detail_entry = _find_url(detail_url)
    if detail_entry is None:
        detail_entry = ET.SubElement(root, f"{{{SITEMAP_NS}}}url")
        ET.SubElement(detail_entry, f"{{{SITEMAP_NS}}}loc").text = detail_url
        ET.SubElement(detail_entry, f"{{{SITEMAP_NS}}}changefreq").text = "daily"
        ET.SubElement(detail_entry, f"{{{SITEMAP_NS}}}priority").text = "0.75"
        for hreflang in ("tr-CY", "x-default"):
            ET.SubElement(
                detail_entry,
                f"{{{XHTML_NS}}}link",
                {
                    "rel": "alternate",
                    "hreflang": hreflang,
                    "href": detail_url,
                },
            )
    detail_lastmod = detail_entry.find(f"{{{SITEMAP_NS}}}lastmod")
    if detail_lastmod is None:
        detail_lastmod = ET.SubElement(detail_entry, f"{{{SITEMAP_NS}}}lastmod")
    detail_lastmod.text = lastmod_value

    try:
        ET.indent(tree, space="  ")
    except AttributeError:
        pass
    tree.write(sitemap_path, encoding="utf-8", xml_declaration=True)
    print(f"✅ [SITEMAP] Güncellendi → {sitemap_path}")
    return sitemap_path

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
            # metin parçalarını ALT metin havuzuna atalım
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

def generate_image_gemini_flash(final_prompt: str, aspect_ratio: str = "16:9"):
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
                image_config=google_genai_types.ImageConfig(aspect_ratio=aspect_ratio),
            )
        resp = GOOGLE_GENAI_CLIENT.models.generate_content(**request_kwargs)
        image_bytes, alt_texts = _extract_inline_image_from_gemini(resp)
        if not image_bytes:
            raise RuntimeError("Gemini Flash yanıtında görsel verisi yok.")
        return _load_image(image_bytes), (alt_texts[0] if alt_texts else "")

    image, alt = with_retry(_call, tries=2, wait=6, label="IMG-Gemini")
    print("[IMG][Gemini] OK")
    return image, alt


def _fit_campaign_dimensions(image: Image.Image) -> Image.Image:
    target_size = (1080, 1350)
    if image.size == target_size:
        return image
    try:
        return ImageOps.fit(image, target_size, method=Image.LANCZOS)
    except Exception:
        return image.resize(target_size, Image.LANCZOS)


def generate_image_openai(prompt: str) -> Optional[Image.Image]:
    if OPENAI_CLIENT is None:
        return None
    try:
        response = OPENAI_CLIENT.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1080x1350",
        )
        data = response.data[0].b64_json
        content = base64.b64decode(data)
        image = _load_image(content)
        return image
    except Exception as exc:
        print(f"⚠️  [IMG][OpenAI] Hata: {exc}")
        return None


def save_campaign_image(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    prepared = _fit_campaign_dimensions(image.convert("RGB"))
    prepared.save(path, format="JPEG", quality=88, optimize=True)

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

    # Dil bazlı "Kaynaklar" başlığı
    src_title = {"tr": "Kaynaklar", "en": "Sources", "de": "Quellen", "ru": "Источники"}[lang_code]
    # Tam URL’leri kesinlikle yaz
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
def commit_and_push(paths_to_stage: List[str], message: str, publish: bool):
    try:
        if not paths_to_stage:
            print("ℹ️ [GIT] Commit edilecek dosya yok.")
            return
        if not publish:
            print("ℹ️ [GIT] --publish kullanılmadı; değişiklikler commit edilmedi.")
            return
        current_time_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        subprocess.run(["git", "config", "user.name", "Fures AI Bot"], check=True)
        subprocess.run(["git", "config", "user.email", "bot@fures.at"], check=True)
        subprocess.run(["git", "add", *paths_to_stage], check=True)
        diff = subprocess.run(["git", "diff", "--cached", "--name-only"], capture_output=True, text=True, check=True)
        if not diff.stdout.strip():
            print("ℹ️ [GIT] Değişiklik yok.")
            return
        commit_message = message or "🤖 Automated Content Update"
        commit_message = f"{commit_message} ({current_time_str} UTC)"
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
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

def run_ai_news_pipeline() -> List[str]:
    print("===== Daily AI Blog Pipeline =====")
    news = fetch_ai_news()
    if not news:
        print("❌ [RSS] Haber bulunamadı, duruyoruz.")
        return []

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

    prompt_seed = primary_title or "Artificial intelligence daily news"
    final_prompt = f"""\
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

    created_posts: List[Path] = []
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

    return paths_to_stage


def run_campaign_pipeline(lang: str = "tr") -> List[str]:
    lang = (lang or "tr").lower()
    if lang != "tr":
        print("⚠️  [KAMPANYA] Yalnızca Türkçe destekleniyor, 'tr' kullanılacak.")
        lang = "tr"

    print("===== Günlük Kampanya Otomasyonu =====")
    topics = collect_campaign_topics()
    if not topics:
        print("❌ [KAMPANYA][RSS] Trend kaynağı bulunamadı.")
        return []

    primary, topic_context = build_topic_context(topics)

    payload: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    for attempt in range(1, 4):
        try:
            raw_payload = request_campaign_payload(primary, topic_context, attempt, error_message)
            payload = validate_campaign_payload(raw_payload, primary)
            break
        except Exception as exc:
            error_message = str(exc)
            print(f"⚠️  [KAMPANYA] Deneme {attempt} başarısız: {error_message}")

    if payload is None:
        print("❌ [KAMPANYA] Geçerli kampanya JSON'u üretilemedi.")
        return []

    alt_override = payload.get("visual_alt") or payload.get("title")
    image_obj: Optional[Image.Image] = None
    image_alt_from_model = ""
    try:
        image_obj, image_alt_from_model = generate_image_gemini_flash(payload["visual_prompt"], aspect_ratio="4:5")
    except Exception as exc:
        print(f"⚠️  [KAMPANYA][IMG] Gemini hatası: {exc}")

    if image_obj is None:
        openai_image = generate_image_openai(payload["visual_prompt"])
        if openai_image is not None:
            image_obj = openai_image
            print("✅ [KAMPANYA][IMG] OpenAI görseli kullanıldı.")

    if image_alt_from_model:
        alt_override = image_alt_from_model

    if image_obj is not None:
        try:
            save_campaign_image(image_obj, payload["image_path"])
            print(f"[KAMPANYA][IMG] Kaydedildi → {payload['image_path']}")
        except Exception as exc:
            print(f"❌ [KAMPANYA][IMG] Kaydedilemedi: {exc}")

    if not payload["image_path"].exists():
        fallback_source: Optional[Path] = None
        try:
            rotator = ImageRotator()
            fallback_name = rotator.next_for_language("fallback")
            candidate = FOTOS_DIR / fallback_name
            if candidate.exists():
                fallback_source = candidate
        except Exception:
            fallback_source = None
        if fallback_source is None:
            default_source = ROOT / "public" / "images" / "fures.png"
            if default_source.exists():
                fallback_source = default_source
        if fallback_source and fallback_source.exists():
            try:
                with Image.open(fallback_source) as fallback_img:
                    save_campaign_image(fallback_img, payload["image_path"])
                print(f"ℹ️ [KAMPANYA][IMG] Yedek görsel kullanıldı: {fallback_source}")
            except Exception as exc:
                print(f"❌ [KAMPANYA][IMG] Yedek kopyalanamadı: {exc}")
        if not payload["image_path"].exists():
            placeholder = Image.new("RGB", (1080, 1350), (12, 12, 12))
            save_campaign_image(placeholder, payload["image_path"])
            print("ℹ️ [KAMPANYA][IMG] Boş yer tutucu oluşturuldu.")

    payload["visual_alt"] = alt_override or payload.get("visual_alt") or payload.get("title")

    post_path = save_campaign_post(payload)
    sitemap_path = update_sitemap_with_campaign(payload["slug"], payload["timestamp"])

    staged_paths = [str(post_path.relative_to(ROOT))]
    if payload["image_path"].exists():
        staged_paths.append(str(payload["image_path"].relative_to(ROOT)))
    if sitemap_path and sitemap_path.exists():
        staged_paths.append(str(sitemap_path.relative_to(ROOT)))

    return staged_paths


def main():
    parser = argparse.ArgumentParser(description="Fures AI günlük içerik otomasyonu")
    parser.add_argument("--mode", choices=["news", "campaigns", "both"], default="both")
    parser.add_argument("--lang", default="tr", help="Kampanya dili (yalnızca tr desteklenir)")
    parser.add_argument("--publish", action="store_true", help="Değişiklikleri commit/push et")
    args = parser.parse_args()

    staged: List[str] = []
    if args.mode in {"news", "both"}:
        staged.extend(run_ai_news_pipeline())
    if args.mode in {"campaigns", "both"}:
        staged.extend(run_campaign_pipeline(args.lang))

    # Tekrarlayan yolları temizle
    seen_paths = []
    for path in staged:
        if path not in seen_paths:
            seen_paths.append(path)

    if args.mode == "campaigns":
        commit_label = "🤖 Daily Campaign Update [auto]"
    elif args.mode == "news":
        commit_label = "🤖 Daily AI Blog Update [auto]"
    else:
        commit_label = "🤖 Daily AI Content Update [auto]"

    commit_and_push(seen_paths, commit_label, args.publish)
    if not args.publish:
        print("ℹ️ [GIT] Değişiklikler çalışma dizininde bırakıldı.")


if __name__ == "__main__":
    main()
