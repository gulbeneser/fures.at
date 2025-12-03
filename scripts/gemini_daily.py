import os
import base64
import feedparser
import datetime
import subprocess
import shutil
import json
import re
import random
import time
from pathlib import Path
import requests
from urllib.parse import urlparse, parse_qs, urlunparse, urlencode
from io import BytesIO
from PIL import Image

# --- Harici modüller ---
try:
    from utils import slugify
except ImportError:
    def slugify(text):
        text = text.lower()
        text = re.sub(r'[^a-z0-9]+', '-', text)
        return text.strip('-')

try:
    from image_rotation import ImageRotator
except ImportError:
    ImageRotator = None

# --- Gemini SDK ---
import google.generativeai as genai
from google.generativeai import types as genai_types

try:
    from google import genai as google_genai_lib
    from google.genai import types as google_genai_types
except ImportError:
    google_genai_lib = None
    google_genai_types = None

# ==============================================================================
# ⚙️ KONFIGÜRASYON & MODELLER
# ==============================================================================

# 1. Metin ve Akıl Modeli (En Zekisi)
MODEL_TEXT = "gemini-3-pro-preview"

# 2. Birincil Görsel Modeli (Deneysel/Yeni - Banana Pro)
MODEL_IMAGE_PRIMARY = "gemini-3-pro-image-preview"

# 3. İkincil Görsel Modeli (Yedek/Kararlı - Flash)
# Banana hata verirse bu devreye girecek (Eski kodunuzdaki sistem)
MODEL_IMAGE_SECONDARY = "gemini-2.0-flash-exp"

LANGS = {"tr": "Turkish", "en": "English", "de": "German", "ru": "Russian"}
LANG_NAMES = {"tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский"}

# Dizinler
ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
FOTOS_DIR = ROOT / "fotos"
CAMPAIGNS_DIR = ROOT / "kampanyalar"
CAMPAIGN_IMAGE_DIR = FOTOS_DIR / "campaigns"

for d in [BLOG_DIR, FOTOS_DIR, CAMPAIGNS_DIR, CAMPAIGN_IMAGE_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# API Key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("❌ HATA: GEMINI_API_KEY yok!")

genai.configure(api_key=GEMINI_API_KEY)

# Google GenAI Client
GOOGLE_GENAI_CLIENT = None
if google_genai_lib:
    try:
        GOOGLE_GENAI_CLIENT = google_genai_lib.Client(api_key=GEMINI_API_KEY)
        print(f"✅ [INIT] Gemini Client Hazır.")
    except Exception as e:
        print(f"⚠️ [INIT] Client hatası: {e}")

# ==============================================================================
# 🛠 YARDIMCI FONKSİYONLAR
# ==============================================================================

def with_retry(fn, tries=3, wait=5, label="Islem"):
    for i in range(tries):
        try:
            return fn()
        except Exception as e:
            if i == tries - 1:
                print(f"❌ [{label}] Başarısız: {e}")
                return None
            print(f"⚠️  [{label}] Hata: {e}. {wait}sn bekleniyor...")
            time.sleep(wait)

def clean_url(url: str) -> str:
    try:
        parsed = urlparse(url)
        if "news.google.com" in parsed.netloc or "google.com" in parsed.netloc:
             q = parse_qs(parsed.query)
             if "url" in q:
                 return q["url"][0]
        query_params = parse_qs(parsed.query, keep_blank_values=True)
        filtered = []
        for k, v in query_params.items():
            if not k.startswith("utm_") and k not in ["ref", "source", "oc", "ved"]:
                for val in v:
                    filtered.append((k, val))
        new_query = urlencode(filtered)
        return urlunparse(parsed._replace(query=new_query))
    except:
        return url

# ==============================================================================
# 1️⃣ HABER TOPLAMA (Dinamik Konu)
# ==============================================================================

def get_todays_topic():
    """Her gün farklı bir konsept seçer."""
    topics = [
        {"name": "General Breakthroughs", "q": "artificial intelligence breakthrough new model"},
        {"name": "Robotics", "q": "humanoid robots boston dynamics figure ai news"},
        {"name": "Medical AI", "q": "AI in healthcare biology drug discovery"},
        {"name": "Generative Video", "q": "generative video AI sora runwayml midjourney news"},
        {"name": "AI Business", "q": "AI startup funding adoption enterprise trends"},
        {"name": "AI Hardware", "q": "nvidia AI chips TPU groq hardware news"},
        {"name": "Coding Agents", "q": "AI coding agents devin github copilot news"},
    ]
    selected = random.choice(topics)
    print(f"🌍 [KONU] Bugünün odağı: {selected['name']}")
    return selected['q']

def fetch_fresh_news(limit=6):
    query = get_todays_topic()
    rss_url = f"https://news.google.com/rss/search?q={query.replace(' ', '+')}+when:2d&hl=en-US&gl=US&ceid=US:en"
    
    articles = []
    seen_links = set()
    print(f"🔎 [RSS] Taranıyor: {rss_url}")
    
    with requests.Session() as session:
        try:
            parsed = feedparser.parse(rss_url)
            for entry in parsed.entries:
                link = clean_url(entry.link)
                if link in seen_links: continue
                title = entry.title.replace(" - Google News", "").split("|")[0].strip()
                articles.append({"title": title, "link": link})
                seen_links.add(link)
                if len(articles) >= limit: break
        except Exception as e:
            print(f"⚠️ RSS Hatası: {e}")

    if len(articles) < 2:
        print("⚠️ Yeterli haber yok, genel havuza geçiliyor...")
        fallback_url = "https://news.google.com/rss/search?q=artificial+intelligence+news+when:1d&hl=en-US&gl=US&ceid=US:en"
        parsed = feedparser.parse(fallback_url)
        for entry in parsed.entries[:limit]:
            articles.append({"title": entry.title, "link": clean_url(entry.link)})

    print(f"✅ {len(articles)} haber toplandı.")
    return articles[:limit]

# ==============================================================================
# 2️⃣ METİN ÜRETİMİ (Gemini 3 Pro)
# ==============================================================================

def generate_blog_content(news_list, lang_code):
    lang_name = LANGS[lang_code]
    news_text = "\n".join([f"- {n['title']}" for n in news_list])
    prompt = f"""
    You are an elite tech journalist. Write a blog post in {lang_name} summarizing today's AI news.
    NEWS: {news_text}
    Create a catchy Title (H1), an Intro, Analysis, and Conclusion. Use Markdown.
    Focus on WHY this matters. ~500 words.
    Output strictly in {lang_name}.
    """
    model = genai.GenerativeModel(MODEL_TEXT)
    return with_retry(lambda: model.generate_content(prompt).text, label=f"Text-{lang_code}")

def generate_instagram_caption(news_list, lang_code):
    lang_name = LANGS[lang_code]
    titles = "\n".join([n['title'] for n in news_list])
    prompt = f"Write a short, viral Instagram caption (max 3 lines) in {lang_name} about these AI news: {titles}. No hashtags."
    model = genai.GenerativeModel(MODEL_TEXT)
    resp = with_retry(lambda: model.generate_content(prompt).text, label=f"IG-{lang_code}")
    return resp.strip().replace('"', '') if resp else ""

# ==============================================================================
# 3️⃣ GÖRSEL SİSTEMİ (ÇİFT MOTORLU: BANANA -> FLASH)
# ==============================================================================

def generate_dynamic_image_prompt(news_list):
    """Haberlere göre özel prompt oluşturur."""
    titles = "\n".join([n['title'] for n in news_list])
    meta_prompt = f"""
    Act as an AI Art Director. Create a single image generation prompt based on these headlines:
    {titles}
    - Robots -> High-tech, metallic, cinematic.
    - Business -> Abstract 3D, corporate memphis, clean.
    - Medical -> Organic, bright, DNA strands.
    - General -> Cyberpunk-minimal fusion, glowing neural core.
    Output ONLY the English prompt string.
    """
    model = genai.GenerativeModel(MODEL_TEXT)
    try:
        return model.generate_content(meta_prompt).text.strip()
    except:
        return "High quality 3d render of artificial intelligence concept, glowing nodes, cinematic lighting."

def _process_gemini_image_response(response):
    """Gemini API yanıtından görseli güvenli bir şekilde çıkarır."""
    if not response or not hasattr(response, "candidates"):
        return None
    
    image_bytes = None
    for cand in response.candidates:
        if hasattr(cand, "content") and cand.content.parts:
            for part in cand.content.parts:
                if part.inline_data and part.inline_data.data:
                    try:
                        image_bytes = base64.b64decode(part.inline_data.data)
                    except: pass
                    break
        if image_bytes: break
    
    if image_bytes:
        try:
            img = Image.open(BytesIO(image_bytes))
            img.verify() # Bozuk veri kontrolü
            img = Image.open(BytesIO(image_bytes)) # Tekrar yükle
            return img
        except Exception as e:
            print(f"❌ [IMG-DECODE] Bozuk veri: {e}")
            return None
    return None

def generate_image_primary(prompt):
    """1. DENEME: Nano Banana Pro"""
    if not GOOGLE_GENAI_CLIENT: return None
    print(f"🍌 [PRIMARY] Banana Pro deneniyor ({MODEL_IMAGE_PRIMARY})...")
    
    def _call():
        return GOOGLE_GENAI_CLIENT.models.generate_content(
            model=MODEL_IMAGE_PRIMARY,
            contents=prompt,
            config=google_genai_types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=google_genai_types.ImageConfig(aspect_ratio="16:9"),
                safety_settings=[google_genai_types.SafetySetting(
                    category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_ONLY_HIGH")]
            )
        )
    
    try:
        resp = with_retry(_call, tries=1, wait=2, label="Banana-Try")
        img = _process_gemini_image_response(resp)
        if img: return img
    except Exception as e:
        print(f"⚠️ [PRIMARY] Banana Pro başarısız: {e}")
    
    return None

def generate_image_secondary(prompt):
    """2. DENEME: Flash/Exp (Eski Güvenilir Sistem)"""
    if not GOOGLE_GENAI_CLIENT: return None
    print(f"⚡ [SECONDARY] Flash/Exp yedeği deneniyor ({MODEL_IMAGE_SECONDARY})...")
    
    def _call():
        # Bu model bazen farklı parametre isteyebilir, standart gönderiyoruz
        return GOOGLE_GENAI_CLIENT.models.generate_content(
            model=MODEL_IMAGE_SECONDARY,
            contents=prompt,
            config=google_genai_types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=google_genai_types.ImageConfig(aspect_ratio="16:9")
            )
        )
    
    try:
        resp = with_retry(_call, tries=2, wait=4, label="Flash-Try")
        img = _process_gemini_image_response(resp)
        if img: return img
    except Exception as e:
        print(f"❌ [SECONDARY] Flash da başarısız: {e}")
    
    return None

def generate_image_with_fallback(prompt):
    """Önce Banana'yı dene, olmazsa Flash'ı dene."""
    # 1. Banana
    img = generate_image_primary(prompt)
    if img: return img, "primary"
    
    print("⚠️ Birincil model başarısız oldu, yedeğe geçiliyor...")
    
    # 2. Flash
    img = generate_image_secondary(prompt)
    if img: return img, "secondary"
    
    return None, "failed"

# ==============================================================================
# 4️⃣ KAMPANYA
# ==============================================================================

def generate_campaign_content():
    prompt = """
    Create a marketing campaign for 'Fures Growth' (AI Automation).
    Output JSON: {"title": "TR Title", "summary": "...", "hashtags": [], "linkedin_post": "...", "instagram_post": "...", "visual_prompt": "..."}
    """
    model = genai.GenerativeModel(MODEL_TEXT)
    try:
        txt = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"}).text
        return json.loads(txt)
    except: return None

# ==============================================================================
# 🚀 MAIN
# ==============================================================================

def main():
    print("🚀 Fures AI Pipeline Başlatılıyor...")
    
    # 1. Haber
    news = fetch_fresh_news(limit=5)
    if not news: return

    # 2. Setup
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    date_iso = now_utc.strftime("%Y-%m-%dT%H:%M:%SZ")
    file_slug = now_utc.strftime("%Y-%m-%d-%H%M")
    primary_slug = slugify(news[0]['title'])[:40]
    
    # 3. Görsel Üretimi
    image_filename = f"{file_slug}-{primary_slug}.jpg"
    image_abs_path = FOTOS_DIR / image_filename
    image_rel_path = f"/fotos/{image_filename}"
    
    dynamic_prompt = generate_dynamic_image_prompt(news)
    print(f"🎨 Prompt: {dynamic_prompt[:60]}...")
    
    # Çift Motorlu Üretim (Banana -> Flash -> Yok)
    img_obj, source_model = generate_image_with_fallback(dynamic_prompt)
    
    has_image = False
    if img_obj:
        img_obj = img_obj.convert("RGB")
        if img_obj.width > 1600:
            ratio = 1600 / img_obj.width
            img_obj = img_obj.resize((1600, int(img_obj.height * ratio)), Image.LANCZOS)
        img_obj.save(image_abs_path, quality=90, optimize=True)
        has_image = True
        print(f"💾 Görsel kaydedildi ({source_model}): {image_rel_path}")
    else:
        print("❌ İki model de başarısız. Klasör yedeğine geçiliyor.")
        if ImageRotator:
            try:
                rot = ImageRotator()
                backup = rot.next_for_language("fallback")
                shutil.copy(FOTOS_DIR / backup, image_abs_path)
                has_image = True
                print("💾 Yerel yedek kullanıldı.")
            except: pass
        if not has_image:
            image_rel_path = "/images/fures.png"

    # 4. Blog Yazma
    git_files = []
    if has_image and image_abs_path.exists():
        git_files.append(str(image_abs_path.relative_to(ROOT)))

    for lang in LANGS.keys():
        print(f"📝 [{lang.upper()}] Yazılıyor...")
        content = generate_blog_content(news, lang)
        if not content: continue
        
        caption = generate_instagram_caption(news, lang)
        content = re.sub(r"^```markdown\s*", "", content).replace("```", "")
        
        md_path = BLOG_DIR / lang / f"{file_slug}-{lang}-ai-news.md"
        
        frontmatter = f"""---
title: "AI Daily — {LANG_NAMES[lang]}"
date: {date_iso}
image: {image_rel_path}
imageAlt: "AI News Cover"
lang: {lang}
description: "{caption}"
---

{content}

#### Sources
""" + "\n".join([f"- [{n['title']}]({n['link']})" for n in news])
        
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(frontmatter)
        git_files.append(str(md_path.relative_to(ROOT)))

    # 5. Kampanya
    print("📣 Kampanya Hazırlanıyor...")
    camp_data = generate_campaign_content()
    if camp_data:
        c_slug = f"{file_slug}-tr-kampanya.md"
        c_path = CAMPAIGNS_DIR / "tr" / c_slug
        
        c_prompt = f"Vertical marketing poster. {camp_data.get('visual_prompt', 'tech abstract')}"
        c_img_obj, _ = generate_image_with_fallback(c_prompt)
        c_img_rel = "/images/fures.png"
        
        if c_img_obj:
            c_img_name = f"{file_slug}-campaign.jpg"
            c_img_path = CAMPAIGN_IMAGE_DIR / c_img_name
            c_img_obj.save(c_img_path, quality=90)
            c_img_rel = f"/fotos/campaigns/{c_img_name}"
            git_files.append(str(c_img_path.relative_to(ROOT)))
            
        c_md = f"""---
title: "{camp_data.get('title')}"
date: {date_iso}
image: {c_img_rel}
lang: tr
description: "{camp_data.get('summary')}"
---
# {camp_data.get('title')}

{camp_data.get('summary')}

### Sosyal Medya
**LinkedIn:** {camp_data.get('linkedin_post')}
**Instagram:** {camp_data.get('instagram_post')}

**Etiketler:** {' '.join(camp_data.get('hashtags', []))}
"""
        with open(c_path, "w", encoding="utf-8") as f:
            f.write(c_md)
        git_files.append(str(c_path.relative_to(ROOT)))

    # 6. Git Push
    if git_files:
        print(f"📦 Git'e gönderiliyor ({len(git_files)} dosya)...")
        try:
            subprocess.run(["git", "config", "user.name", "Fures Bot"], check=False)
            subprocess.run(["git", "config", "user.email", "bot@fures.at"], check=False)
            subprocess.run(["git", "add"] + git_files, check=True)
            subprocess.run(["git", "commit", "-m", f"🤖 Update: {file_slug}"], check=True)
            subprocess.run(["git", "push"], check=True)
            print("✅ Tamamlandı!")
        except Exception as e:
            print(f"❌ Git Hatası: {e}")
    else:
        print("ℹ️ Değişiklik yok.")

if __name__ == "__main__":
    main()
