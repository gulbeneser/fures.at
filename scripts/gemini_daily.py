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

--- Gemini (metin) ---
import google.generativeai as genai
from google.generativeai import types as genai_types

--- Gemini (görsel) ---
try:
from google import genai as google_genai_lib
from google.genai import types as google_genai_types
except Exception:
google_genai_lib = None
google_genai_types = None

=== CONFIG ===
MODEL_TEXT = "gemini-3-pro-preview"
LANGS = {"tr": "Turkish", "en": "English", "de": "German", "ru": "Russian"}
LANG_NAMES = {"tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский"}
INSTAGRAM_CAPTION_LIMIT = 2200

ROOT = Path(file).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
FOTOS_DIR = ROOT / "fotos"
CAMPAIGNS_DIR = ROOT / "kampanyalar"
CAMPAIGN_IMAGE_DIR = FOTOS_DIR / "campaigns"

BLOG_DIR.mkdir(exist_ok=True)
FOTOS_DIR.mkdir(exist_ok=True)
CAMPAIGNS_DIR.mkdir(exist_ok=True)
CAMPAIGN_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

=== ORTAM ===
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

=== YARDIMCI: retry ===
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
if cleaned.startswith(""): parts = cleaned.split("")
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

=== Yardımcı: Instagram caption temizleme ===
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
def clean_tracking_params(url: str) -> str:
parsed = urlparse(url)
if not parsed.query:
return url
query_params = parse_qs(parsed.query, keep_blank_values=True)
filtered_items = []
for key, values in query_params.items():
if key.lower().startswith("utm") or key.lower() in {"oc","ved","usg","clid","ei","sa","source","gws_rd"}:
continue
for v in values:
filtered_items.append((key, v))
if not filtered_items:
return urlunparse(parsed._replace(query="", fragment=""))
clean_query = urlencode(filtered_items)
return urlunparse(parsed._replace(query=clean_query, fragment=""))

def _resolve_final_url(session: requests.Session, link: str) -> str:
parsed = urlparse(link)

code
Code
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
=== 2) RSS'den haber çekme (tam makale URL'leriyle) ===
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

code
Code
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
=== 3) Metin üretimi (Gemini) ===
def generate_single_blog(news_list, lang_code):
language = LANGS[lang_code]
# Model içeriğe odaklansın diye kısa ve net prompt:
summaries = "\n".join([f"- {n['title']}: {n['link']}" for n in news_list])
prompt = f"""
Write a single {language} o random technology blog article (400–600 words) that synthesizes the following AI news items into a coherent narrative.
Start with a title line formatted exactly as '### <title>'.
Write directly to the reader. Heyacan verici olmalı. No meta-commentary about being an AI or receiving instructions.

News:
{summaries}

Finish with one line of 5–7 relevant hashtags in {language}.
"""
model = genai.GenerativeModel(MODEL_TEXT)

code
Code
def _call():
    resp = model.generate_content(prompt)
    return resp.text

return with_retry(_call, tries=2, wait=6, label=f"TXT-{lang_code}")
=== 3.b) Instagram özeti ===
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

Maximum {soft_limit} characters (absolute Instagram limit {INSTAGRAM_CAPTION_LIMIT}).
Do not include URLs, @mentions, or hashtags.
Use 2 short sentences that highlight key takeaways in an informative, inviting tone.
Return only the caption text without additional commentary.
"""
model = genai.GenerativeModel(MODEL_TEXT)
def _call():
resp = model.generate_content(prompt)
return resp.text
raw_caption = with_retry(_call, tries=2, wait=6, label=f"IG-{lang_code}")
if not raw_caption:
return ""
return _clean_instagram_caption(raw_caption, INSTAGRAM_CAPTION_LIMIT)
=== Kampanya üretimi ===
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

def generate_campaign_payload():
model = genai.GenerativeModel(MODEL_TEXT)
prompt = """
You are "Fures Growth Strategist", an expert Turkish marketing AI.
Study today's advertising and AI automation trends in Turkey and the TRNC. Build a single integrated campaign plan for Fures Tech.
Rules:

Respond ONLY in Turkish.
Never mention prices, discounts, or currency.
Showcase why Fures Tech excels at advertising, automation, and AI-driven creativity.
Highlight at least two real advertising or AI agencies from Turkey or the TRNC as market context (not competitors).
Emphasise omnichannel automation, new service bundles, and ROI-focused storytelling.
Output valid minified JSON that matches this schema exactly:
{
"title": string,
"subtitle": string,
"summary": string,
"trendInsights": string[4+],
"agencySpotlights": [{"name": string, "location": string, "focus": string, "insight": string}...],
"campaignConcept": {"name": string, "hook": string, "angles": string[3+], "cta": string},
"creativePlan": {
"instagramCarousel": string[4+],
"linkedinArticle": string[3+],
"automationWorkflow": string[3+]
},
"packages": [{"name": string, "description": string, "deliverables": string[3+], "outcome": string}...],
"automationIdeas": string[3+],
"visualPrompt": string,
"copy": {"instagramCaption": string, "linkedinCopy": string},
"hashtags": string[10+]
}
Do not include markdown or commentary. JSON only.
"""
def _call():
resp = model.generate_content(prompt, generation_config=genai_types.GenerationConfig(temperature=0.55))
return resp.text
raw_text = with_retry(_call, tries=2, wait=8, label="KAMPANYA")
payload = _extract_json_blob(raw_text or "")
if not payload:
raise ValueError("Kampanya çıktısı JSON formatında alınamadı.")
return payload
def build_campaign_markdown(payload: dict) -> tuple[str, str, str, str, str]:
title = payload.get("title") or "Fures Kampanya"
subtitle = payload.get("subtitle") or "Günlük kampanya planı"
summary = payload.get("summary") or "Fures Tech için kapsamlı günlük kampanya özeti."
trend_insights = _ensure_list(payload.get("trendInsights"))
agencies = _ensure_list(payload.get("agencySpotlights"))
concept = payload.get("campaignConcept") or {}
creative = payload.get("creativePlan") or {}
packages = _ensure_list(payload.get("packages"))
automation_ideas = _ensure_list(payload.get("automationIdeas"))
copy_block = payload.get("copy") or {}
hashtags = [tag if tag.startswith("#") else f"#{tag.strip()}" for tag in _ensure_list(payload.get("hashtags"))]

code
Code
lines = []
lines.append(f"### {subtitle}")
lines.append("")
lines.append(f"**Kampanya Özeti:** {summary.strip()}")
lines.append("")

if trend_insights:
    lines.append("## Trendler ve Pazarlama İpuçları")
    for insight in trend_insights:
        lines.append(f"- {insight}")
    lines.append("")

if agencies:
    lines.append("## Türkiye ve KKTC Ajans Ekosistemi")
    for agency in agencies:
        if isinstance(agency, dict):
            name = agency.get("name", "Ajans")
            location = agency.get("location", "Konum")
            focus = agency.get("focus", "Odak")
            insight = agency.get("insight", "Fures için anlamı")
            lines.append(f"- **{name} ({location})** — {focus}. {insight}")
    lines.append("")

if concept:
    lines.append(f"## Kampanya Konsepti · {concept.get('name', 'Fures Çözümü')}")
    hook = concept.get("hook")
    if hook:
        lines.append(f"**Ana Mesaj:** {hook}")
    angles = _ensure_list(concept.get("angles"))
    if angles:
        lines.append("**İletişim Açıları:**")
        for angle in angles:
            lines.append(f"- {angle}")
    cta = concept.get("cta")
    if cta:
        lines.append(f"**CTA:** {cta}")
    lines.append("")

if creative:
    insta = _ensure_list(creative.get("instagramCarousel"))
    linkedin = _ensure_list(creative.get("linkedinArticle"))
    automation = _ensure_list(creative.get("automationWorkflow"))
    if insta or linkedin or automation:
        lines.append("## Kreatif ve Otomasyon Planı")
    if insta:
        lines.append("### Instagram Carousel")
        for slide in insta:
            lines.append(f"- {slide}")
    if linkedin:
        lines.append("")
        lines.append("### LinkedIn Makalesi")
        for block in linkedin:
            lines.append(f"- {block}")
    if automation:
        lines.append("")
        lines.append("### Otomasyon Akışı")
        for step in automation:
            lines.append(f"- {step}")
    lines.append("")

if packages:
    lines.append("## Yeni Servis Paketleri")
    for pkg in packages:
        if isinstance(pkg, dict):
            lines.append(f"### {pkg.get('name', 'Fures Paketi')}")
            desc = pkg.get("description")
            if desc:
                lines.append(desc)
            deliverables = _ensure_list(pkg.get("deliverables"))
            if deliverables:
                lines.append("- **Teslimatlar:**")
                for item in deliverables:
                    lines.append(f"  - {item}")
            outcome = pkg.get("outcome")
            if outcome:
                lines.append(f"- **Beklenen Etki:** {outcome}")
            lines.append("")

if automation_ideas:
    lines.append("## Yapay Zekâ Otomasyon Fikirleri")
    for idea in automation_ideas:
        lines.append(f"- {idea}")
    lines.append("")

ig_caption = (copy_block.get("instagramCaption") or "").strip()
linkedin_copy = (copy_block.get("linkedinCopy") or "").strip()

if ig_caption or linkedin_copy:
    lines.append("## Sosyal Medya Metinleri")
    if ig_caption:
        lines.append("**Instagram:**")
        lines.append(ig_caption)
        lines.append("")
    if linkedin_copy:
        lines.append("**LinkedIn:**")
        lines.append(linkedin_copy)
        lines.append("")

if hashtags:
    lines.append("## Hashtag Havuzu")
    lines.append(" ".join(hashtags))
    lines.append("")

visual_prompt = payload.get("visualPrompt") or (
    "Fures Tech için dörtte beş oranında, neon turuncu ve mor tonlarda, dijital ajans kampanyası görseli."
)
image_alt = concept.get("hook") or summary
description = ig_caption or summary
return title, "\n".join(lines).strip(), image_alt, description, visual_prompt
def save_campaign(slug: str, date_time_iso: str, title: str, markdown: str, image_path_for_front: str, image_alt: str, description: str):
kampanya_dir = CAMPAIGNS_DIR / "tr"
kampanya_dir.mkdir(parents=True, exist_ok=True)

code
Code
front_lines = [
    "---",
    f"title: {json.dumps(title, ensure_ascii=False)}",
    f"date: {date_time_iso}",
    f"image: {image_path_for_front}",
    f"imageAlt: {json.dumps(image_alt or '', ensure_ascii=False)}",
    "lang: tr",
    f"description: {json.dumps(description or '', ensure_ascii=False)}",
    "---",
    "",
]

post_path = kampanya_dir / f"{slug}.md"
with open(post_path, "w", encoding="utf-8") as f:
    f.write("\n".join(front_lines))
    f.write(markdown)
    f.write("\n")
print(f"[KAMPANYA] OK → {post_path}")
return post_path
=== 4) Görsel üretimi (Gemini 2.5 Flash Image) ===
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

code
Code
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
=== 5) Kaydetme ===
def save_blog(blog_content, lang_code, image_path_for_blog: str, image_alt: str, instagram_caption: str, sources):
if not blog_content:
return None
now_utc = datetime.datetime.now(datetime.timezone.utc)
date_time_slug = now_utc.strftime("%Y-%m-%d-%H%M")
date_time_iso = now_utc.replace(microsecond=0).isoformat().replace("+00:00", "Z")
slug = f"{date_time_slug}-{lang_code}-ai-news"
path = BLOG_DIR / lang_code
path.mkdir(exist_ok=True)

code
Code
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
{blog_content.strip()}

{src_title}
{sources_md}
"""
post_path = path / f"{slug}.md"
with open(post_path, "w", encoding="utf-8") as f:
f.write(html)
print(f"[TXT][{lang_code.upper()}] OK → {slug}.md")
return post_path

=== 6) Git ===
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

=== 7) Main ===
def main():
print("===== Daily AI Blog Pipeline =====")
news = fetch_ai_news()
if not news:
print("❌ [RSS] Haber bulunamadı, duruyoruz.")
return

code
Code
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
glowing neural core, cinematic volumetric lighting, high-tech palette some technology, some life, use always random colors .
"""

code
Code
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

# İçerikler (4 dil) + gerçek kaynak linkleri
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

# Kampanya üretimi
campaign_post_path = None
campaign_image_path = None
campaign_image_relative = None
try:
    campaign_payload = generate_campaign_payload()
    (
        campaign_title,
        campaign_markdown,
        campaign_image_alt,
        campaign_description,
        campaign_visual_prompt,
    ) = build_campaign_markdown(campaign_payload)

    now_campaign = datetime.datetime.now(datetime.timezone.utc)
    campaign_slug_base = now_campaign.strftime("%Y-%m-%d-%H%M")
    campaign_slug = f"{campaign_slug_base}-tr-kampanya"
    campaign_image_filename = f"{campaign_slug}.jpg"
    campaign_image_relative = f"/fotos/campaigns/{campaign_image_filename}"
    campaign_image_path = CAMPAIGN_IMAGE_DIR / campaign_image_filename

    campaign_image_created = False
    try:
        generated_campaign_image, campaign_alt_from_model = generate_image_gemini_flash(
            campaign_visual_prompt,
            aspect_ratio="4:5",
        )
    except Exception as exc:
        print(f"⚠️  [KAMPANYA][IMG] Üretim hatası: {exc}")
        generated_campaign_image, campaign_alt_from_model = None, ""

    final_campaign_alt = campaign_image_alt or campaign_alt_from_model

    if generated_campaign_image:
        try:
            campaign_image_path.parent.mkdir(parents=True, exist_ok=True)
            max_w = 1350
            if generated_campaign_image.width > max_w:
                height = int(generated_campaign_image.height * (max_w / generated_campaign_image.width))
                generated_campaign_image = generated_campaign_image.resize((max_w, height), Image.LANCZOS)
            generated_campaign_image.convert("RGB").save(campaign_image_path, format="JPEG", quality=94, optimize=True)
            campaign_image_created = True
            print(f"[KAMPANYA][IMG] Kaydedildi → {campaign_image_path}")
        except Exception as exc:
            print(f"❌ [KAMPANYA][IMG] Kaydedilemedi: {exc}")

    if not campaign_image_path.exists():
        fallback_source = None
        if rotator:
            try:
                fallback_name = rotator.next_for_language("fallback")
                candidate = FOTOS_DIR / fallback_name
                if candidate.exists():
                    fallback_source = candidate
            except Exception as exc:
                print(f"⚠️  [KAMPANYA][IMG] Yedek seçilemedi: {exc}")
        if fallback_source is None:
            default_source = ROOT / "public" / "images" / "fures.png"
            if default_source.exists():
                fallback_source = default_source
        if fallback_source and fallback_source.exists():
            try:
                campaign_image_path.parent.mkdir(parents=True, exist_ok=True)
                with Image.open(fallback_source) as img_fallback:
                    img_fallback.convert("RGB").save(campaign_image_path, format="JPEG", quality=88, optimize=True)
                print(f"ℹ️ [KAMPANYA][IMG] Yedek görsel kullanıldı: {fallback_source}")
            except Exception as exc:
                print(f"❌ [KAMPANYA][IMG] Yedek kopyalanamadı: {exc}")
        else:
            campaign_image_relative = "/images/fures.png"

    campaign_image_relative_for_front = campaign_image_relative or "/images/fures.png"
    iso_timestamp = now_campaign.replace(microsecond=0).isoformat().replace("+00:00", "Z")
    campaign_post_path = save_campaign(
        campaign_slug,
        iso_timestamp,
        campaign_title,
        campaign_markdown,
        campaign_image_relative_for_front,
        final_campaign_alt,
        campaign_description,
    )
    if campaign_post_path and campaign_post_path.exists():
        paths_to_stage.append(str(campaign_post_path.relative_to(ROOT)))
    if campaign_image_path and campaign_image_path.exists():
        paths_to_stage.append(str(campaign_image_path.relative_to(ROOT)))
except Exception as exc:
    print(f"❌ [KAMPANYA] Üretim başarısız: {exc}")

print("[GIT] Commit/push başlıyor...")
commit_and_push(paths_to_stage)
print("✅ Tamam.")
if name == "main":
main()
