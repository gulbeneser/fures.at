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

# --- Harici modüller (Eğer yoksa basit fallback yapıyoruz) ---
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

# Yeni model istemcisi (Görsel ve 3.0 modelleri için genelde bu gereklidir)
try:
    from google import genai as google_genai_lib
    from google.genai import types as google_genai_types
except ImportError:
    google_genai_lib = None
    google_genai_types = None

# ==============================================================================
# ⚙️ KONFIGÜRASYON & MODELLER (GÜNCELLENDİ)
# ==============================================================================

# Ekran görüntüsündeki ID'leri buraya tanımladık
MODEL_TEXT = "gemini-3-pro-preview"          # Metin Analizi ve Blog Yazımı
MODEL_IMAGE = "gemini-3-pro-image-preview"   # "Nano Banana Pro" - Görsel Üretimi

LANGS = {"tr": "Turkish", "en": "English", "de": "German", "ru": "Russian"}
LANG_NAMES = {"tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский"}
INSTAGRAM_CAPTION_LIMIT = 2200

# Klasör Yapısı
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
    raise ValueError("❌ HATA: GEMINI_API_KEY çevre değişkeni bulunamadı!")

genai.configure(api_key=GEMINI_API_KEY)

# Google GenAI Client (Yeni modeller için kritik)
GOOGLE_GENAI_CLIENT = None
if google_genai_lib:
    try:
        GOOGLE_GENAI_CLIENT = google_genai_lib.Client(api_key=GEMINI_API_KEY)
        print(f"✅ [INIT] Gemini 3.0 Client Hazır. (Model: {MODEL_TEXT} & {MODEL_IMAGE})")
    except Exception as e:
        print(f"⚠️ [INIT] Google GenAI Client hatası: {e}")

# ==============================================================================
# 🛠 YARDIMCI FONKSİYONLAR
# ==============================================================================

def with_retry(fn, tries=3, wait=5, label="Islem"):
    """Hata durumunda işlemi tekrar dener."""
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
    """Google News yönlendirmelerini ve tracking parametrelerini temizler."""
    try:
        parsed = urlparse(url)
        # Google News redirect çözücü
        if "news.google.com" in parsed.netloc or "google.com" in parsed.netloc:
             q = parse_qs(parsed.query)
             if "url" in q:
                 return q["url"][0]
        
        # Temizleme
        query_params = parse_qs(parsed.query, keep_blank_values=True)
        filtered = []
        for k, v in query_params.items():
            if not k.startswith("utm_") and k not in ["ref", "source", "oc", "ved", "gws_rd"]:
                for val in v:
                    filtered.append((k, val))
        new_query = urlencode(filtered)
        return urlunparse(parsed._replace(query=new_query))
    except:
        return url

# ==============================================================================
# 1️⃣ GELİŞMİŞ HABER TOPLAMA (Hep Aynı Haber Sorununu Çözer)
# ==============================================================================

def get_todays_topic():
    """Haberlerin hep aynı olmaması için her gün farklı bir 'konsept' seçer."""
    topics = [
        {"name": "General Breakthroughs", "q": "artificial intelligence breakthrough new model"},
        {"name": "Robotics & Physical AI", "q": "humanoid robots boston dynamics figure ai news"},
        {"name": "Medical & Science", "q": "AI in healthcare biology drug discovery"},
        {"name": "Creative AI & Video", "q": "generative video AI sora runwayml midjourney news"},
        {"name": "Enterprise & Business", "q": "AI startup funding adoption enterprise trends"},
        {"name": "AI Hardware & Chips", "q": "nvidia AI chips TPU groq hardware news"},
        {"name": "Coding & Agents", "q": "AI coding agents devin github copilot news"},
    ]
    # Rastgele bir konu seç
    selected = random.choice(topics)
    print(f"🌍 [KONU SEÇİMİ] Bugünün odağı: {selected['name']}")
    return selected['q']

def fetch_fresh_news(limit=6):
    query = get_todays_topic()
    # Son 24-48 saatteki haberleri zorla (when:2d)
    rss_url = f"https://news.google.com/rss/search?q={query.replace(' ', '+')}+when:2d&hl=en-US&gl=US&ceid=US:en"
    
    articles = []
    seen_links = set()
    
    print(f"🔎 [RSS] Haberler taranıyor: {rss_url}")
    with requests.Session() as session:
        try:
            parsed = feedparser.parse(rss_url)
            for entry in parsed.entries:
                link = clean_url(entry.link)
                
                # Link daha önce eklendiyse atla
                if link in seen_links: continue
                
                # Başlık temizliği
                title = entry.title.replace(" - Google News", "").split("|")[0].strip()
                
                articles.append({"title": title, "link": link})
                seen_links.add(link)
                
                if len(articles) >= limit:
                    break
        except Exception as e:
            print(f"⚠️ RSS Hatası: {e}")

    # Eğer spesifik konuda haber çıkmazsa genel haber çek (Fallback)
    if len(articles) < 2:
        print("⚠️ Yeterli haber çıkmadı, genel AI haberlerine bakılıyor...")
        fallback_url = "https://news.google.com/rss/search?q=artificial+intelligence+news+when:1d&hl=en-US&gl=US&ceid=US:en"
        parsed = feedparser.parse(fallback_url)
        for entry in parsed.entries[:limit]:
            articles.append({"title": entry.title, "link": clean_url(entry.link)})

    print(f"✅ {len(articles)} adet haber toplandı.")
    return articles[:limit]

# ==============================================================================
# 2️⃣ GEMINI 3 PRO İLE İÇERİK ÜRETİMİ
# ==============================================================================

def generate_blog_content(news_list, lang_code):
    lang_name = LANGS[lang_code]
    news_text = "\n".join([f"- {n['title']}" for n in news_list])
    
    # Gemini 3 Pro için Prompt
    prompt = f"""
    You are an elite tech journalist. Write a blog post in {lang_name} summarizing today's AI news.
    
    NEWS ITEMS:
    {news_text}
    
    GUIDELINES:
    - Model: Use your superior reasoning (Gemini 3 Pro) to connect these stories into a narrative.
    - Structure: Start with a catchy H1 title, then an engaging intro, then the analysis.
    - Tone: Professional, insightful, yet easy to read.
    - Format: Markdown.
    - Don't just list the news; explain *why* it matters.
    - Length: ~500 words.
    
    Output strictly in {lang_name}.
    """
    
    model = genai.GenerativeModel(MODEL_TEXT)
    
    def _call():
        return model.generate_content(prompt).text

    return with_retry(_call, label=f"Text-{lang_code}")

def generate_instagram_caption(news_list, lang_code):
    lang_name = LANGS[lang_code]
    titles = "\n".join([n['title'] for n in news_list])
    
    prompt = f"""
    Write a short, viral Instagram caption in {lang_name} based on these headlines:
    {titles}
    
    - Use emojis 🤖✨
    - Max 3 lines.
    - No hashtags (I will add them).
    - Engaging tone.
    """
    model = genai.GenerativeModel(MODEL_TEXT)
    resp = with_retry(lambda: model.generate_content(prompt).text, label=f"IG-{lang_code}")
    return resp.strip().replace('"', '') if resp else ""

# ==============================================================================
# 3️⃣ NANO BANANA PRO İLE DİNAMİK GÖRSEL (Hep Aynı Görsel Sorununu Çözer)
# ==============================================================================

def generate_dynamic_image_prompt(news_list):
    """Haberlerin içeriğine göre görsel promptunu Gemini 3 Pro'ya yazdırır."""
    titles = "\n".join([n['title'] for n in news_list])
    
    # Modelden, haberlerin 'ruhuna' uygun bir sanat yönetmeni gibi davranmasını istiyoruz.
    meta_prompt = f"""
    Act as an AI Art Director. Read these news headlines and create a single image generation prompt.
    
    HEADLINES:
    {titles}
    
    INSTRUCTIONS:
    - If news is about robots -> Style: High-tech, metallic, cinematic depth of field.
    - If news is about business -> Style: Minimalist 3D abstract, corporate memphis, clean blue/gold.
    - If news is about medical -> Style: Organic, bright, DNA strands, soft lighting.
    - If news is general -> Style: Cyberpunk-minimal fusion, glowing neural core, volumetric lighting.
    
    OUTPUT:
    Return ONLY the prompt string in English. Be descriptive about lighting, texture, and style.
    Start with: "A high quality 3d render of..." or "A cinematic photo of..."
    """
    
    model = genai.GenerativeModel(MODEL_TEXT)
    try:
        prompt = model.generate_content(meta_prompt).text.strip()
        print(f"🎨 [PROMPT] Gemini 3 Pro görseli tasarladı:\n    '{prompt[:100]}...'")
        return prompt
    except:
        return "A futuristic abstract AI concept art, glowing circuits, neon lights, 8k resolution, cinematic."

def generate_image_banana(prompt):
    """Nano Banana Pro (gemini-3-pro-image-preview) modelini kullanır."""
    if not GOOGLE_GENAI_CLIENT:
        print("⚠️ [IMG] Client yok, görsel atlanıyor.")
        return None, ""

    print(f"🍌 [BANANA PRO] Görsel işleniyor: {MODEL_IMAGE}")
    
    def _api_call():
        if google_genai_types:
            resp = GOOGLE_GENAI_CLIENT.models.generate_content(
                model=MODEL_IMAGE, # Banana Pro ID
                contents=prompt,
                config=google_genai_types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    # Banana Pro genelde 1:1 veya standart oranları destekler
                    image_config=google_genai_types.ImageConfig(aspect_ratio="16:9") 
                )
            )
            return resp
        return None

    response = with_retry(_api_call, tries=2, wait=5, label="Banana-Img")
    
    # Görseli çözümle
    image_bytes = None
    if response and hasattr(response, "candidates"):
        for cand in response.candidates:
            for part in cand.content.parts:
                if part.inline_data:
                    image_bytes = base64.b64decode(part.inline_data.data)
                    break
            if image_bytes: break
            
    if image_bytes:
        return Image.open(BytesIO(image_bytes)), prompt
    else:
        print("❌ [IMG] Banana Pro görsel döndürmedi.")
        return None, ""

# ==============================================================================
# 4️⃣ KAMPANYA SİSTEMİ
# ==============================================================================

def generate_campaign_content():
    """Gemini 3 Pro ile kampanya JSON'u oluştur."""
    prompt = """
    You are a marketing strategist for 'Fures Growth'.
    Create a campaign plan for AI Automation services.
    Output Valid JSON only:
    {
      "title": "Campaign Title (TR)",
      "summary": "Short summary",
      "hashtags": ["tag1", "tag2"],
      "linkedin_post": "Professional text",
      "instagram_post": "Casual text",
      "visual_prompt": "Image description"
    }
    """
    model = genai.GenerativeModel(MODEL_TEXT)
    try:
        txt = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"}).text
        return json.loads(txt)
    except:
        return None

# ==============================================================================
# 🚀 ANA AKIŞ (MAIN)
# ==============================================================================

def main():
    print(f"🚀 Fures AI Pipeline Başlatılıyor...")
    print(f"🧠 Text Model: {MODEL_TEXT}")
    print(f"🍌 Image Model: {MODEL_IMAGE}")
    
    # 1. Haberleri Getir
    news = fetch_fresh_news(limit=5)
    if not news:
        print("❌ Haber yok. Çıkış.")
        return

    # 2. Tarih ve Dosya İsimleri
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    date_iso = now_utc.strftime("%Y-%m-%dT%H:%M:%SZ")
    file_slug = now_utc.strftime("%Y-%m-%d-%H%M")
    
    primary_slug = slugify(news[0]['title'])[:40]
    
    # 3. Görsel Üretimi (Dinamik)
    image_filename = f"{file_slug}-{primary_slug}.jpg"
    image_abs_path = FOTOS_DIR / image_filename
    image_rel_path = f"/fotos/{image_filename}"
    
    # a) Habere özel prompt oluştur
    dynamic_prompt = generate_dynamic_image_prompt(news)
    
    # b) Banana Pro ile üret
    img_obj, img_alt = generate_image_banana(dynamic_prompt)
    
    has_image = False
    if img_obj:
        img_obj = img_obj.convert("RGB")
        # Boyut optimizasyonu
        if img_obj.width > 1600:
            ratio = 1600 / img_obj.width
            img_obj = img_obj.resize((1600, int(img_obj.height * ratio)), Image.LANCZOS)
        
        img_obj.save(image_abs_path, quality=90, optimize=True)
        has_image = True
        print(f"💾 Görsel kaydedildi: {image_rel_path}")
    else:
        # Fallback (Yedek Görsel)
        print("⚠️ Görsel üretilemedi, yedek kullanılıyor.")
        if ImageRotator:
            try:
                rot = ImageRotator()
                backup = rot.next_for_language("fallback")
                shutil.copy(FOTOS_DIR / backup, image_abs_path)
                has_image = True
            except: pass
        if not has_image:
            image_rel_path = "/images/fures.png"

    # 4. Blog Yazılarını Oluştur
    git_files = []
    if has_image and image_abs_path.exists():
        git_files.append(str(image_abs_path.relative_to(ROOT)))

    for lang in LANGS.keys():
        print(f"📝 [{lang.upper()}] Yazılıyor...")
        content = generate_blog_content(news, lang)
        if not content: continue
        
        caption = generate_instagram_caption(news, lang)
        
        # Markdown Temizliği
        content = re.sub(r"^```markdown\s*", "", content)
        content = re.sub(r"^```\s*", "", content)
        content = re.sub(r"```$", "", content)
        
        md_filename = f"{file_slug}-{lang}-ai-news.md"
        md_path = BLOG_DIR / lang / md_filename
        
        frontmatter = f"""---
title: "AI Daily — {LANG_NAMES[lang]}"
date: {date_iso}
image: {image_rel_path}
imageAlt: "{img_alt[:120].replace('"', '')}..."
lang: {lang}
description: "{caption}"
---

{content}

#### Sources
""" + "\n".join([f"- [{n['title']}]({n['link']})" for n in news])
        
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(frontmatter)
        
        git_files.append(str(md_path.relative_to(ROOT)))

    # 5. Kampanya (Banana Pro ile görsel)
    print("📣 Kampanya Hazırlanıyor...")
    camp_data = generate_campaign_content()
    if camp_data:
        c_slug = f"{file_slug}-tr-kampanya.md"
        c_path = CAMPAIGNS_DIR / "tr" / c_slug
        
        # Kampanya görseli üret
        c_prompt = f"Vertical marketing poster. {camp_data.get('visual_prompt', 'tech abstract')}"
        # Dikey görsel için Banana Pro'ya aspect_ratio ayarı gönderilebilir (eğer API destekliyorsa)
        # Şimdilik standart gönderiyoruz.
        c_img_obj, _ = generate_image_banana(c_prompt)
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

### Sosyal Medya Metinleri
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
            subprocess.run(["git", "commit", "-m", f"🤖 Update: {file_slug} (Gemini 3 Pro)"], check=True)
            subprocess.run(["git", "push"], check=True)
            print("✅ Tamamlandı!")
        except Exception as e:
            print(f"❌ Git Hatası: {e}")
    else:
        print("ℹ️ Değişiklik yok.")

if __name__ == "__main__":
    main()
