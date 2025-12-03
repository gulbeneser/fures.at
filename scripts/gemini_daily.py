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

# --- Opsiyonel Modüller ---
try:
    from image_rotation import ImageRotator, NoImagesAvailableError
except ImportError:
    ImageRotator = None
    NoImagesAvailableError = Exception

try:
    from utils import slugify
except ImportError:
    def slugify(text):
        text = text.lower()
        text = re.sub(r'[^a-z0-9]+', '-', text)
        return text.strip('-')

# --- Gemini Kütüphaneleri ---
import google.generativeai as genai
from google.generativeai import types as genai_types

try:
    from google import genai as google_genai_lib
    from google.genai import types as google_genai_types
except ImportError:
    google_genai_lib = None
    google_genai_types = None

# ==============================================================================
# ⚙️ CONFIG (EN STABİL AYARLAR)
# ==============================================================================

# Şu an en kararlı ve hızlı model. Hem metin hem görsel (Imagen) için bunu kullanacağız.
MODEL_NAME = "gemini-3-pro-preview" 

LANGS = {"tr": "Turkish", "en": "English", "de": "German", "ru": "Russian"}
LANG_NAMES = {"tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский"}
INSTAGRAM_CAPTION_LIMIT = 2200

ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
FOTOS_DIR = ROOT / "fotos"
CAMPAIGNS_DIR = ROOT / "kampanyalar"
CAMPAIGN_IMAGE_DIR = FOTOS_DIR / "campaigns"

for d in [BLOG_DIR, FOTOS_DIR, CAMPAIGNS_DIR, CAMPAIGN_IMAGE_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# API KEY
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY yok!")

genai.configure(api_key=GEMINI_API_KEY)
print("✅ [INIT] Gemini (Eski SDK) hazır.")

GOOGLE_GENAI_CLIENT = None
if google_genai_lib:
    try:
        GOOGLE_GENAI_CLIENT = google_genai_lib.Client(api_key=GEMINI_API_KEY)
        print("✅ [INIT] Gemini (Yeni SDK - Görsel için) hazır.")
    except Exception as e:
        print(f"❌ [INIT] Client hatası: {e}")

# ==============================================================================
# 🛠 YARDIMCI FONKSİYONLAR
# ==============================================================================

def with_retry(fn, tries=3, wait=5, label="Islem"):
    for i in range(tries):
        try:
            return fn()
        except Exception as e:
            if i == tries - 1:
                print(f"❌ [{label}] Tükendi: {e}")
                return None # Hata fırlatma, None dön (Akış bozulmasın)
            print(f"⚠️  [{label}] Hata: {e} -> {wait}sn bekleniyor...")
            time.sleep(wait)

def _clean_instagram_caption(text: str, limit: int = INSTAGRAM_CAPTION_LIMIT) -> str:
    text = text or ""
    text = re.sub(r"https?://\S+", "", text, flags=re.IGNORECASE)
    return text.strip()[:limit]

def clean_url(url: str) -> str:
    try:
        parsed = urlparse(url)
        if "news.google.com" in parsed.netloc or "google.com" in parsed.netloc:
             q = parse_qs(parsed.query)
             if "url" in q: return q["url"][0]
        
        query_params = parse_qs(parsed.query, keep_blank_values=True)
        filtered = []
        for k, v in query_params.items():
            if not k.startswith("utm_") and k not in ["ref", "source", "oc", "ved"]:
                for val in v: filtered.append((k, val))
        new_query = urlencode(filtered)
        return urlunparse(parsed._replace(query=new_query))
    except: return url

def _extract_json_blob(text: str):
    if not text: return None
    try:
        cleaned = text.strip()
        if "```json" in cleaned:
            cleaned = cleaned.split("```json")[1].split("```")[0]
        elif "```" in cleaned:
            cleaned = cleaned.split("```")[1]
        return json.loads(cleaned)
    except: return None

# ==============================================================================
# 1️⃣ DİNAMİK HABER ÇEKME (YENİLİK BURADA)
# ==============================================================================

def fetch_ai_news(limit=5):
    """
    Eski statik liste yerine, her gün farklı bir konu seçen dinamik yapı.
    """
    topics = [
        {"name": "General AI", "q": "artificial intelligence breakthrough"},
        {"name": "Robotics", "q": "humanoid robots boston dynamics figure ai"},
        {"name": "Medical AI", "q": "AI in healthcare biology drug discovery"},
        {"name": "Creative AI", "q": "generative video AI sora runwayml midjourney"},
        {"name": "AI Business", "q": "AI startup funding enterprise trends"},
        {"name": "AI Hardware", "q": "nvidia AI chips TPU groq"},
        {"name": "Coding Agents", "q": "AI coding agents devin github copilot"},
    ]
    
    # Konuyu seç
    topic = random.choice(topics)
    print(f"🌍 [KONU] Bugünün Odağı: {topic['name']}")
    
    # 24-48 saatlik filtre ekle (when:2d)
    rss_url = f"https://news.google.com/rss/search?q={topic['q'].replace(' ', '+')}+when:2d&hl=en-US&gl=US&ceid=US:en"
    
    print(f"🔎 [RSS] Okunuyor: {rss_url}")
    articles, seen = [], set()
    
    with requests.Session() as session:
        try:
            parsed = feedparser.parse(rss_url)
            for entry in parsed.entries:
                link = clean_url(entry.link)
                if link in seen: continue
                
                title = entry.title.replace(" - Google News", "").split("|")[0].strip()
                articles.append({"title": title, "link": link})
                seen.add(link)
                if len(articles) >= limit: break
        except Exception as e:
            print(f"⚠️ RSS Hatası: {e}")
            
    # Eğer özel konuda haber yoksa, genele dön
    if len(articles) < 2:
        print("⚠️ Özel konuda haber az, genele geçiliyor...")
        default_feed = "https://news.google.com/rss/search?q=artificial+intelligence+news+when:1d&hl=en-US&gl=US&ceid=US:en"
        try:
            parsed = feedparser.parse(default_feed)
            for entry in parsed.entries[:limit]:
                link = clean_url(entry.link)
                if link not in seen:
                    articles.append({"title": entry.title, "link": link})
        except: pass

    # Log
    for i, a in enumerate(articles[:limit], 1):
        print(f"   • {a['title']}")
        
    return articles[:limit]

# ==============================================================================
# 2️⃣ METİN VE DİNAMİK PROMPT
# ==============================================================================

def generate_dynamic_prompt(news_list):
    """Haberlere bakıp, eski 'Cyberpunk' promptu yerine akıllı prompt yazar."""
    titles = "\n".join([n['title'] for n in news_list])
    prompt = f"""
    Based on these AI news headlines:
    {titles}
    
    Write a single English image generation prompt description (max 40 words).
    - If news is robotics -> describe a high-tech robot.
    - If news is business -> describe abstract 3d shapes, clean, blue/gold.
    - If news is medical -> describe organic, DNA, bright.
    - Else -> describe a futuristic digital random art concept.
    
    Output ONLY the prompt.
    """
    model = genai.GenerativeModel(MODEL_NAME)
    try:
        return model.generate_content(prompt).text.strip()
    except:
        return "Futuristic artificial intelligence concept art, glowing nodes, cinematic lighting."

def generate_single_blog(news_list, lang_code):
    language = LANGS[lang_code]
    summaries = "\n".join([f"- {n['title']}" for n in news_list])
    prompt = f"""
    Write a {language} blog post (400-600 words) summarizing these AI news.
    Start with '### <Title>'. Use Markdown. Be engaging.
    News: {summaries}
    Finish with 5 hashtags.
    """
    model = genai.GenerativeModel(MODEL_NAME)
    return with_retry(lambda: model.generate_content(prompt).text, label=f"TXT-{lang_code}")

def generate_instagram_caption(news_list, lang_code):
    language = LANGS[lang_code]
    prompt = f"Write a short Instagram caption in {language} for these AI news. Max 2 sentences. No hashtags."
    model = genai.GenerativeModel(MODEL_NAME)
    res = with_retry(lambda: model.generate_content(prompt).text, label=f"IG-{lang_code}")
    return _clean_instagram_caption(res) if res else ""

# ==============================================================================
# 3️⃣ GÖRSEL ÜRETİMİ (GÜVENLİ VE STABİL)
# ==============================================================================

def generate_image_safe(prompt):
    """
    Gemini 2.0 Flash kullanarak görsel üretir.
    Hata verirse (INVALID_ARGUMENT, vs.) betiği çökertmez, None döner.
    """
    if not GOOGLE_GENAI_CLIENT:
        print("⚠️ Görsel client yok.")
        return None, ""
        
    print(f"🎨 [IMG] İstenen: {prompt[:50]}...")
    
    def _call():
        if google_genai_types:
            # Standart 16:9 config
            return GOOGLE_GENAI_CLIENT.models.generate_content(
                model=MODEL_NAME, # Gemini 2.0 Flash
                contents=prompt,
                config=google_genai_types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=google_genai_types.ImageConfig(aspect_ratio="16:9")
                )
            )
        return None

    try:
        response = with_retry(_call, tries=2, wait=5, label="IMG-Gen")
        
        # Yanıtı çözümle
        if response and hasattr(response, "candidates"):
            for cand in response.candidates:
                if cand.content and cand.content.parts:
                    for part in cand.content.parts:
                        if part.inline_data and part.inline_data.data:
                            # Veri geldi, şimdi resmi açmayı dene
                            img_data = base64.b64decode(part.inline_data.data)
                            img = Image.open(BytesIO(img_data))
                            img.verify() # Bozuk mu kontrol et
                            
                            # Sağlamsa tekrar aç ve dön
                            img = Image.open(BytesIO(img_data))
                            return img, prompt
    except Exception as e:
        print(f"❌ [IMG] Üretim hatası: {e}")
        # Hata olsa bile None dönüyoruz, script devam edecek
    
    return None, ""

# ==============================================================================
# 4️⃣ KAMPANYA VE DİĞERLERİ
# ==============================================================================

def generate_campaign_payload():
    model = genai.GenerativeModel(MODEL_NAME)
    prompt = """
    Create a marketing campaign for 'Fures Growth' (AI Automation).
    Output strictly VALID JSON:
    {"title": "TR Baslik", "summary": "Ozet", "hashtags": [], "linkedin_post": "", "instagram_post": "", "visual_prompt": ""}
    """
    res = with_retry(lambda: model.generate_content(prompt, generation_config={"response_mime_type": "application/json"}).text, label="KAMPANYA")
    return _extract_json_blob(res)

def save_campaign_simple(slug, date_iso, payload, img_path):
    path = CAMPAIGNS_DIR / "tr" / f"{slug}.md"
    md = f"""---
title: "{payload.get('title')}"
date: {date_iso}
image: {img_path}
lang: tr
description: "{payload.get('summary')}"
---
# {payload.get('title')}

{payload.get('summary')}

### Sosyal Medya
**LinkedIn:** {payload.get('linkedin_post')}
**Instagram:** {payload.get('instagram_post')}

**Etiketler:** {' '.join(payload.get('hashtags', []))}
"""
    with open(path, "w", encoding="utf-8") as f: f.write(md)
    return path

# ==============================================================================
# 🚀 MAIN (ESKİ SAĞLAM YAPI)
# ==============================================================================

def main():
    print("===== Fures AI Pipeline (Stabil Sürüm) =====")
    
    # 1. Haberler
    news = fetch_ai_news()
    if not news:
        print("❌ Haber bulunamadı.")
        return

    # 2. Hazırlık
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    date_slug = now_utc.strftime("%Y-%m-%d-%H%M")
    date_iso = now_utc.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    primary_slug = slugify(news[0]['title'])[:50]
    
    img_filename = f"{date_slug}-{primary_slug}.jpg"
    img_path_abs = FOTOS_DIR / img_filename
    img_path_rel = f"/fotos/{img_filename}"
    
    # 3. Görsel (Önce AI dene, olmazsa Rotator)
    dynamic_prompt = generate_dynamic_prompt(news)
    
    # Hata korumalı çağrı
    generated_img, _ = generate_image_safe(dynamic_prompt)
    
    has_image = False
    
    if generated_img:
        try:
            generated_img = generated_img.convert("RGB")
            if generated_img.width > 1600:
                ratio = 1600 / generated_img.width
                generated_img = generated_img.resize((1600, int(generated_img.height * ratio)), Image.LANCZOS)
            generated_img.save(img_path_abs, format="JPEG", quality=90)
            has_image = True
            print(f"✅ [IMG] AI Görseli kaydedildi: {img_path_rel}")
        except Exception as e:
            print(f"❌ [IMG] Kaydetme hatası: {e}")
            
    # AI başarısızsa veya hata verdiyse -> YEDEK SİSTEM
    if not has_image:
        print("⚠️ AI görseli yok, yerel yedeklere geçiliyor...")
        if ImageRotator:
            try:
                rot = ImageRotator()
                backup = rot.next_for_language("fallback")
                shutil.copy(FOTOS_DIR / backup, img_path_abs)
                has_image = True
                print("✅ [IMG] Yedek görsel kullanıldı.")
            except: pass
        
        if not has_image:
            img_path_rel = "/images/fures.png"
            print("⚠️ Hiçbir görsel yok, logo kullanılıyor.")

    # 4. Blog Yazıları
    git_paths = []
    if has_image and img_path_abs.exists():
        git_paths.append(str(img_path_abs.relative_to(ROOT)))

    for lang in LANGS.keys():
        print(f"--- [{lang.upper()}] ---")
        content = generate_single_blog(news, lang)
        if not content: continue
        
        caption = generate_instagram_caption(news, lang)
        content = re.sub(r"^```markdown", "", content).replace("```", "")
        
        md_file = BLOG_DIR / lang / f"{date_slug}-{lang}-ai-news.md"
        
        front = f"""---
title: "AI Daily — {LANG_NAMES[lang]}"
date: {date_iso}
image: {img_path_rel}
lang: {lang}
description: "{caption}"
---
{content}

#### Sources
""" + "\n".join([f"- {n['link']}" for n in news])
        
        with open(md_file, "w", encoding="utf-8") as f: f.write(front)
        git_paths.append(str(md_file.relative_to(ROOT)))

    # 5. Kampanya
    print("📣 Kampanya...")
    try:
        camp_data = generate_campaign_payload()
        if camp_data:
            c_slug = f"{date_slug}-tr-kampanya"
            
            # Kampanya Görseli (Basitçe yukarıdakini veya yeni bir tane)
            c_prompt = camp_data.get("visual_prompt", "Business abstract")
            c_img, _ = generate_image_safe(c_prompt)
            c_img_rel = "/images/fures.png"
            
            if c_img:
                c_img_name = f"{c_slug}.jpg"
                c_img_path = CAMPAIGN_IMAGE_DIR / c_img_name
                c_img.save(c_img_path, quality=90)
                c_img_rel = f"/fotos/campaigns/{c_img_name}"
                git_paths.append(str(c_img_path.relative_to(ROOT)))
            elif has_image and img_path_abs.exists():
                # Kampanya görseli üretemezsek blog görselini kopyalayalım
                 c_img_name = f"{c_slug}-backup.jpg"
                 c_img_path = CAMPAIGN_IMAGE_DIR / c_img_name
                 shutil.copy(img_path_abs, c_img_path)
                 c_img_rel = f"/fotos/campaigns/{c_img_name}"
                 git_paths.append(str(c_img_path.relative_to(ROOT)))

            c_path = save_campaign_simple(c_slug, date_iso, camp_data, c_img_rel)
            git_paths.append(str(c_path.relative_to(ROOT)))
    except Exception as e:
        print(f"❌ Kampanya hatası: {e}")

    # 6. Git Push
    if git_paths:
        print(f"📦 Git'e gönderiliyor ({len(git_paths)} dosya)...")
        try:
            subprocess.run(["git", "config", "user.name", "Fures Bot"], check=False)
            subprocess.run(["git", "config", "user.email", "bot@fures.at"], check=False)
            subprocess.run(["git", "add"] + git_paths, check=True)
            subprocess.run(["git", "commit", "-m", f"🤖 Auto Update {date_slug}"], check=True)
            subprocess.run(["git", "push"], check=True)
            print("✅ Bitti.")
        except Exception as e:
            print(f"❌ Git hatası: {e}")

if __name__ == "__main__":
    main()
