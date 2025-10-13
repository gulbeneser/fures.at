
import os
import feedparser
import datetime
import subprocess
from pathlib import Path
import google.generativeai as genai
from google.generativeai import types
import requests

# === CONFIG ===
MODEL_TEXT = "gemini-2.5-flash" 
MODEL_IMAGE = "imagen-3" # En yeni ve stabil model adıyla güncellendi
LANGS = { "tr": "Turkish", "en": "English", "de": "German", "ru": "Russian" }
LANG_NAMES = { "tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский" }
ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
IMAGES_DIR = ROOT / "blog_images"
BLOG_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)

# API anahtarını yapılandır (TEK VE DOĞRU YÖNTEM)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY ortam değişkeni bulunamadı veya boş!")
genai.configure(api_key=GEMINI_API_KEY)

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
            try:
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
            except Exception as e:
                print(f"Uyarı: RSS akışı okunurken bir hata oluştu {feed}: {e}")
    return articles[:limit]

# === 2. Tek Bir Dilde Blog Metni Üret ===
def generate_single_blog(news_list, lang_code):
    language = LANGS[lang_code]
    summaries = "\n".join([f"- Title: {n['title']}\n  Link: {n['link']}" for n in news_list])
    prompt = f"""
    You are a master storyteller and expert AI journalist. Your tone is engaging, insightful, and slightly playful.
    Analyze the following AI news and write a single, compelling blog article (400-600 words) in {language}.
    News sources: {summaries}
    The article MUST include: a title starting with '###', readable formatting with paragraphs, 5-7 relevant hashtags in {language} before the sources, and a "Sources" section (in the correct language) at the end, listing ALL original links.
    Focus on the "Wow" factor and explain WHY this news matters.
    """
    model = genai.GenerativeModel(MODEL_TEXT)
    try:
        resp = model.generate_content(prompt)
        return resp.text
    except Exception as e:
        print(f"❌ {language} dilinde içerik üretilirken hata oluştu: {e}")
        return None

# === 3. Görsel Üret (DÜZELTİLMİŞ FONKSİYON) ===
def generate_image(prompt_text):
    final_prompt = f"Create a futuristic, abstract, and visually stunning illustration representing the concept of '{prompt_text}'. Use a dark theme with vibrant, glowing data lines. Minimalistic and elegant."
    print(f"Görsel prompt'u oluşturuluyor: {final_prompt}")
    try:
        image_model = genai.GenerativeModel(MODEL_IMAGE)
        
        # HATA BURADAYDI: Görsel modelleri için 'generation_config' ile MIME türü belirtilmez.
        # Bu hatalı parametre kaldırıldı. Model adı zaten görsel üreteceğini belirtir.
        response = image_model.generate_content(final_prompt)

        # Yanıtın içeriğini daha güvenli bir şekilde kontrol edelim
        if response.parts and hasattr(response.parts[0], 'inline_data') and response.parts[0].inline_data.data:
            image_bytes = response.parts[0].inline_data.data
            filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            img_path = IMAGES_DIR / filename
            with open(img_path, "wb") as f:
                f.write(image_bytes)
            print(f"✅ Görsel başarıyla kaydedildi: {filename}")
            return filename
        else:
            # API'den gelen yanıtın yapısını loglayarak hata ayıklamayı kolaylaştırabiliriz
            print(f"❌ Görsel üretilemedi, API'den beklenen formatta yanıt gelmedi. Yanıt: {response}")
            return None
    except Exception as e:
        # Hata mesajını daha detaylı loglayalım
        print(f"❌ Görsel üretimi sırasında genel bir hata oluştu: {e}")
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
    # Sadece değişiklik varsa işlem yap
    status_result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    if not status_result.stdout.strip():
        print("ℹ️ Değişiklik bulunmadığı için commit atılmadı.")
        return
        
    print("Değişiklikler commit ediliyor ve push ediliyor...")
    subprocess.run(["git", "config", "user.name", "Fures AI Bot"])
    subprocess.run(["git", "config", "user.email", "bot@fures.at"])
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", "🤖 Daily AI Blog Update [auto]"])
    subprocess.run(["git", "push"])
    print("🚀 Blog başarıyla GitHub'a gönderildi.")

# === MAIN ===
def main():
    print("Fetching latest AI news...")
    news = fetch_ai_news()
    if not news: 
        print("❌ Haberler alınamadı, işlem durduruluyor.")
        return

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
