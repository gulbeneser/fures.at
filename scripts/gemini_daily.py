# scripts/gemini_daily.py -- HASHTAG VE FORMATLAMA İSTEKLERİNİ İÇEREN NİHAİ VERSİYON

import os
import json
import feedparser
import datetime
import subprocess
from pathlib import Path
import google.generativeai as genai
from google.generativeai import types
import requests # Link temizleme için

# === CONFIG ===
MODEL_TEXT = "gemini-2.5-flash-preview-09-2025" 
LANGS = {
    "tr": "Türkçe",
    "en": "English",
    "de": "Deutsch",
    "ru": "Русский"
}
ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
BLOG_DIR.mkdir(exist_ok=True)

# API anahtarının varlığını en başta kontrol et
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY ortam değişkeni bulunamadı veya boş!")

genai.configure(api_key=GEMINI_API_KEY)

# === 1. Haberleri Çek (Link Temizleme Özellikli) ===
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
            print(f"Haber kaynağı işleniyor: {feed}")
            parsed = feedparser.parse(feed)
            for entry in parsed.entries:
                google_news_url = entry.link
                if google_news_url in seen_links:
                    continue
                
                final_url = google_news_url
                try:
                    response = session.head(google_news_url, allow_redirects=True, timeout=5)
                    final_url = response.url
                    print(f"  -> Link temizlendi: {final_url}")
                except requests.RequestException as e:
                    print(f"  -> UYARI: Link çözümlenemedi: {google_news_url}. Hata: {e}")
                    final_url = google_news_url
                
                articles.append({
                    "title": entry.title,
                    "link": final_url,
                    "summary": entry.summary if "summary" in entry else ""
                })
                seen_links.add(google_news_url)
    return articles[:limit]

# === 2. Blog Metni Üret (Hashtag ve Formatlama Özellikli) ===
def generate_multilingual_blog(news_list):
    summaries = "\n".join([f"- Başlık: {n['title']}\n  Link: {n['link']}" for n in news_list])

    # YENİ VE NİHAİ PROMPT
    prompt = f"""
    You are a master storyteller and an expert AI journalist for a creative agency. Your tone is engaging, insightful, and slightly playful. Avoid dry, robotic language.
    
    Your task is to analyze the following AI news headlines and their clean links, identify the most significant developments, and weave them into compelling narratives.

    News sources:
    {summaries}

    Create 4 blog articles (400-600 words each) in Turkish, English, German, and Russian.
    Each blog post must start with its language name in brackets (e.g., [Türkçe]).
    Each blog should have a title starting with '###'.
    Separate each complete blog post with the exact separator: [---BLOG-SEPARATOR---]

    CRITICAL INSTRUCTIONS FOR STYLE, FORMATTING, AND CONTENT:
    1.  **Readable Formatting:** Ensure the text is highly readable by using clear paragraphs with proper spacing (blank lines between paragraphs). This is crucial for social media sharing.
    2.  **Captivating Storytelling:** Don't just list facts. Start with a hook that grabs the reader's attention. Explain WHY this news matters to businesses, creatives, or everyday people.
    3.  **Focus on "Wow" Factor:** Prioritize news that is genuinely surprising or has huge future implications. If there is news about AI in tourism, feature it prominently.
    4.  **Hashtag Generation:** At the end of EACH blog post, just before the "Sources" section, include a single line with 5-7 relevant hashtags in the language of the article (e.g., #YapayZeka #Teknoloji for Turkish).
    5.  **Sources Section:** At the very end of EACH blog post, you MUST include a "Kaynaklar" (in Turkish), "Sources" (in English), "Quellen" (in German), and "Источники" (in Russian) section, listing ALL original article links.
    """
    
    model = genai.GenerativeModel(MODEL_TEXT)
    generation_config = genai.types.GenerationConfig(temperature=0.75)
    resp = model.generate_content(prompt, generation_config=generation_config)
    return resp.text

# === 4. 4 Dilde Dosyaya Yaz ===
def save_blogs(multilingual_text, image_filename="default.png"):
    sections = multilingual_text.split("[---BLOG-SEPARATOR---]")
    for code, lang in LANGS.items():
        section = next((s for s in sections if f"[{lang}]" in s), None)
        if not section:
            print(f"UYARI: {lang} için bölüm bulunamadı.")
            continue
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
    subprocess.run(["git", "config", "user.name", "Fures AI Bot"])
    subprocess.run(["git", "config", "user.email", "bot@fures.at"])
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
    print("Saving blogs...")
    save_blogs(blog_text)
    print("Committing to GitHub...")
    commit_and_push()
    print("✅ İşlem tamamlandı.")

if __name__ == "__main__":
    main()
