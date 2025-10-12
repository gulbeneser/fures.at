# scripts/gemini_daily.py

import os
import json
import feedparser
import datetime
import subprocess
from pathlib import Path
import google.generativeai as genai
from google.generativeai import types

# === CONFIG ===
MODEL_TEXT = "gemini-1.5-flash-latest"
LANGS = {
    "tr": "Türkçe",
    "en": "English",
    "de": "Deutsch",
    "ru": "Русский"
}
ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
# IMAGES_DIR = ROOT / "blog_images" # Görsel üretimi devre dışı bırakıldı
BLOG_DIR.mkdir(exist_ok=True)
# IMAGES_DIR.mkdir(exist_ok=True) # Görsel üretimi devre dışı bırakıldı

# API anahtarının varlığını en başta kontrol et
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY ortam değişkeni bulunamadı veya boş!")

genai.configure(api_key=GEMINI_API_KEY)

# === 1. Haberleri Çek ===
def fetch_ai_news(limit=5):
    feeds = [
        "https://news.google.com/rss/search?q=artificial+intelligence&hl=en",
        "https://news.google.com/rss/search?q=ai+tourism&hl=en",
        "https://news.google.com/rss/search?q=artificial+intelligence+technology&hl=en",
    ]
    articles = []
    seen_links = set()
    for feed in feeds:
        parsed = feedparser.parse(feed)
        for entry in parsed.entries:
            if entry.link not in seen_links:
                articles.append({
                    "title": entry.title,
                    "link": entry.link,
                    "summary": entry.summary if "summary" in entry else ""
                })
                seen_links.add(entry.link)
    return articles[:limit]

# === 2. Blog Metni Üret ===
def generate_multilingual_blog(news_list):
    summaries = "\n".join([f"- {n['title']} ({n['link']})" for n in news_list])

    prompt = f"""
    You are an expert AI journalist writing multilingual blog articles.
    Summarize and creatively expand on the following AI news headlines:

    {summaries}

    Create 4 short blog articles (400-600 words each) in Turkish, English, German, and Russian.
    Each blog post must start with its language name in brackets (e.g., [Türkçe], [English], etc.).
    Each blog should have a title starting with '###'.
    Separate each complete blog post (from one language to the next) with the exact separator: [---BLOG-SEPARATOR---]

    Each blog should:
    - Be engaging, educational and a bit playful.
    - Mention real references from the links.
    - End with a reflective or inspiring note.
    """
    
    model = genai.GenerativeModel(MODEL_TEXT)
    resp = model.generate_content(prompt)
    return resp.text

# === 3. Görsel Üret (Şimdilik devre dışı) ===
# def generate_image(prompt_text):
#     # Not: Standart Gemini API'si yerine bu işlem için Vertex AI kullanmak daha stabil sonuçlar verir.
#     # Bu fonksiyonu etkinleştirmeden önce Vertex AI API'lerini araştırmanızı öneririm.
#     print("Görsel üretimi şimdilik atlanıyor.")
#     return None


# === 4. 4 Dilde Dosyaya Yaz ===
def save_blogs(multilingual_text, image_filename="default.png"):
    # Benzersiz ayırıcıya göre böl
    sections = multilingual_text.split("[---BLOG-SEPARATOR---]")
    
    for code, lang in LANGS.items():
        # Her bölümün doğru dilde olup olmadığını kontrol et
        section = next((s for s in sections if f"[{lang}]" in s), None)
        if not section:
            print(f"UYARI: {lang} için bölüm bulunamadı.")
            continue
            
        # Dil etiketini temizle
        section_content = section.replace(f"[{lang}]", "").strip()

        date_str = datetime.datetime.now().strftime("%Y-%m-%d")
        slug = f"{date_str}-{code}-ai-news"
        path = BLOG_DIR / code
        path.mkdir(exist_ok=True)

        html = f"""---
title: "AI Daily — {lang}"
date: {date_str}
image: /blog_images/{image_filename}
lang: {code}
---

{section_content}
"""
        with open(path / f"{slug}.md", "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✅ Blog kaydedildi: {lang} → {slug}.md")

# === 5. GitHub Commit ===
def commit_and_push():
    # Bu komutlar GitHub Actions ortamında zaten yetkilendirilmiş olacaktır.
    subprocess.run(["git", "config", "user.name", "Fures AI Bot"])
    subprocess.run(["git", "config", "user.email", "bot@fures.at"])
    
    # Değişiklik olup olmadığını kontrol et
    status_result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    if not status_result.stdout.strip():
        print("Değişiklik bulunamadı, commit atılmıyor.")
        return

    print("Değişiklikler commit ediliyor ve push ediliyor...")
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", "🤖 Daily AI Blog Update [auto]"])
    subprocess.run(["git", "push"])
    print("🚀 Blog başarıyla GitHub'a gönderildi.")

# === MAIN ===
def main():
    print("Fetching latest AI news...")
    news = fetch_ai_news()
    if not news:
        print("Hiç haber bulunamadı. İşlem durduruluyor.")
        return
        
    print("Generating multilingual content...")
    blog_text = generate_multilingual_blog(news)
    
    # print("Generating image...")
    # image = generate_image(news[0]['title'])
    
    print("Saving blogs...")
    save_blogs(blog_text) # Görsel parametresi şimdilik kaldırıldı
    
    print("Committing to GitHub...")
    commit_and_push()
    
    print("✅ İşlem tamamlandı.")

if __name__ == "__main__":
    main()
