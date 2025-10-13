# scripts/gemini_daily.py -- IMAGEN MODELİ İLE GÖRSEL ÜRETİMİ DÜZELTİLMİŞ NİHAİ VERSİYON

import os
import feedparser
import datetime
import subprocess
from pathlib import Path
import google.generativeai as genai
from google.genai import types # types'ı config için kullanacağız
import requests
import base64 # Görsel verisini işlemek için eklendi

# === CONFIG ===
MODEL_TEXT = "gemini-flash-latest" 
MODEL_IMAGE = "imagen-4.0-generate-001" # DOĞRU GÖRSEL MODELİ
LANGS = { "tr": "Turkish", "en": "English", "de": "German", "ru": "Russian" }
LANG_NAMES = { "tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский" }
ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
IMAGES_DIR = ROOT / "blog_images"
BLOG_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)

# API anahtarını yapılandır
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY ortam değişkeni bulunamadı veya boş!")
client = genai.Client(api_key=GEMINI_API_KEY) # Imagen için Client objesi gerekiyor

# === 1. Haberleri Çek ===
def fetch_ai_news(limit=5):
    feeds = [
        "https://news.google.com/rss/search?q=artificial+intelligence+breakthrough&hl=en-US&gl=US&ceid=US:en",
        "https://news.google.com/rss/search?q=AI+in+tourism+industry&hl=en-US&gl=US&ceid=US:en",
        "https://news.google.com/rss/search?q=generative+ai+startups&hl=en-US&gl=US&ceid=US:en",
    ]
    articles = []
    seen_links = set()
    with requests.Session() as session:
        for feed in feeds:
            parsed = feedparser.parse(feed)
            for entry in parsed.entries:
                google_news_url = entry.link
                if google_news_url in seen_links: continue
                final_url = google_news_url
                try:
                    response = session.head(google_news_url, allow_redirects=True, timeout=5)
                    final_url = response.url
                except requests.RequestException: pass
                articles.append({"title": entry.title, "link": final_url})
                seen_links.add(google_news_url)
    return articles[:limit]

# === 2. Tek Bir Dilde Blog Metni Üret ===
def generate_single_blog(news_list, lang_code):
    language = LANGS[lang_code]
    summaries = "\n".join([f"- Title: {n['title']}\n  Link: {n['link']}" for n in news_list])
    prompt = f"""
    You are a master storyteller and expert AI journalist. Your tone is engaging, insightful, and slightly playful.
    Analyze the following AI news and write a single, compelling blog article (400-600 words) in {language}.
    
    News sources:
    {summaries}

    The article MUST include:
    1. A title starting with '###'.
    2. Readable formatting with clear paragraphs.
    3. A line with 5-7 relevant hashtags in {language} before the sources.
    4. A "Sources" section (in the correct language) at the very end, listing ALL original links.
    
    Focus on the "Wow" factor and explain WHY this news matters.
    """
    model = genai.GenerativeModel(MODEL_TEXT)
    try:
        resp = model.generate_content(prompt)
        return resp.text
    except Exception as e:
        print(f"❌ {language} dilinde içerik üretilirken hata oluştu: {e}")
        return None

# === 3. Görsel Üret (IMAGEN ile DÜZELTİLDİ) ===
def generate_image(prompt_text):
    final_prompt = f"Create a futuristic, abstract, and visually stunning illustration representing the concept of '{prompt_text}'. Use a dark theme with vibrant, glowing data lines. Minimalistic and elegant."
    print(f"Görsel prompt'u oluşturuluyor: {final_prompt}")
    try:
        response = client.models.generate_images(
            model=MODEL_IMAGE,
            prompt=final_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1, # Sadece 1 görsel yeterli
            )
        )
        
        if response.generated_images:
            # Yanıt bir Base64 string'i içerir
            image_base64 = response.generated_images[0].image_b64
            image_bytes = base64.b64decode(image_base64)
            
            filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            img_path = IMAGES_DIR / filename
            with open(img_path, "wb") as f:
                f.write(image_bytes)
            print(f"✅ Görsel başarıyla kaydedildi: {filename}")
            return filename
        else:
            print("❌ Görsel üretilemedi, API'den boş yanıt geldi.")
            return None
    except Exception as e:
        print(f"❌ Görsel üretimi sırasında hata oluştu: {e}")
        return None

# === 4. Blog Dosyasını Kaydet ===
def save_blog(blog_content, lang_code, image_filename="default.png"):
    if not blog_content: return
    date_str = datetime.datetime.now().strftime("%Y-%m-%d")
    slug = f"{date_str}-{lang_code}-ai-news"
    path = BLOG_DIR / lang_code
    path.mkdir(exist_ok=True)
    html = f"""---
title: "AI Daily — {LANG_NAMES[lang_code]}"
date: {date_str}
image: /blog_images/{image_filename if image_filename else 'default.png'}
lang: {lang_code}
---

{blog_content.strip()}
"""
    with open(path / f"{slug}.md", "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ Blog kaydedildi: {LANG_NAMES[lang_code]} → {slug}.md")

# === 5. GitHub Commit ===
def commit_and_push():
    subprocess.run(["git", "config", "user.name", "Fures AI Bot"])
    subprocess.run(["git", "config", "user.email", "bot@fures.at"])
    status_result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    if not status_result.stdout.strip(): return
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", "🤖 Daily AI Blog Update [auto]"])
    subprocess.run(["git", "push"])
    print("🚀 Blog başarıyla GitHub'a gönderildi.")

# === MAIN (Görsel Üretimi Aktif) ===
def main():
    print("Fetching latest AI news...")
    news = fetch_ai_news()
    if not news: return

    print("\nGenerating image...")
    image_prompt = news[0]['title']
    image_filename = generate_image(image_prompt)
    
    for lang_code in LANGS.keys():
        print(f"\n--- {LANG_NAMES[lang_code]} için içerik üretiliyor ---")
        blog_text = generate_single_blog(news, lang_code)
        save_blog(blog_text, lang_code, image_filename)
        
    print("\nCommitting to GitHub...")
    commit_and_push()
    print("\n✅ İşlem tamamlandı.")

if __name__ == "__main__":
    main()
