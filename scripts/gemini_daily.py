# scripts/gemini_daily.py -- GÜNCELLENMİŞ VERSİYON

import os
import json
import feedparser
import datetime
import subprocess
from pathlib import Path
import google.generativeai as genai
from google.generativeai import types

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

# === 1. Haberleri Çek ===
def fetch_ai_news(limit=5):
    # YENİ EKLENEN KAYNAK: Turizm ve Yapay Zeka
    feeds = [
        "https://news.google.com/rss/search?q=artificial+intelligence+breakthrough&hl=en-US&gl=US&ceid=US:en",
        "https://news.google.com/rss/search?q=AI+in+tourism+industry&hl=en-US&gl=US&ceid=US:en",
        "https://news.google.com/rss/search?q=generative+ai+startups&hl=en-US&gl=US&ceid=US:en",
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
    summaries = "\n".join([f"- Başlık: {n['title']}\n  Link: {n['link']}" for n in news_list])

    # YENİ VE İYİLEŞTİRİLMİŞ PROMPT
    prompt = f"""
    You are a master storyteller and an expert AI journalist for a creative agency. Your tone is engaging, insightful, and slightly playful. Avoid dry, robotic language.
    
    Your task is to analyze the following AI news headlines and links, identify the most significant and interesting developments, and weave them into compelling narratives.

    News sources:
    {summaries}

    Create 4 blog articles (400-600 words each) in Turkish, English, German, and Russian.
    Each blog post must start with its language name in brackets (e.g., [Türkçe], [English], etc.).
    Each blog should have a title starting with '###'.
    Separate each complete blog post with the exact separator: [---BLOG-SEPARATOR---]

    CRITICAL INSTRUCTIONS FOR STYLE AND CONTENT:
    1.  **Captivating Storytelling:** Don't just list facts. Start with a hook that grabs the reader's attention. Explain WHY this news matters to businesses, creatives, or everyday people.
    2.  **Focus on "Wow" Factor:** Prioritize the news that is genuinely surprising, groundbreaking, or has huge future implications. If there is news about AI in tourism, make sure to feature it prominently.
    3.  **Add a Human Touch:** End with a reflective or inspiring note. Ask a thought-provoking question.
    4.  **Sources Section:** At the very end of EACH blog post, you MUST include a "Kaynaklar" (in Turkish), "Sources" (in English), "Quellen" (in German), and "Источники" (in Russian) section. In this section, list ALL of the original article links provided above.
    """
    
    model = genai.GenerativeModel(MODEL_TEXT)
    generation_config = genai.types.GenerationConfig(temperature=0.75) # Yaratıcılığı bir tık artırdık
    resp = model.generate_content(prompt, generation_config=generation_config)
    return resp.text

# === 4. 4 Dilde Dosyaya Yaz === (Bu fonksiyonda değişiklik yok)
def _generate_unique_slug(base_slug: str, target_dir: Path) -> str:
    """Ensure we never overwrite an existing blog file."""

    slug = base_slug
    counter = 1
    while (target_dir / f"{slug}.md").exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug


def save_blogs(multilingual_text, image_filename="default.png"):
    sections = multilingual_text.split("[---BLOG-SEPARATOR---]")
    for code, lang in LANGS.items():
        section = next((s for s in sections if f"[{lang}]" in s), None)
        if not section:
            print(f"UYARI: {lang} için bölüm bulunamadı.")
            continue
        section_content = section.replace(f"[{lang}]", "").strip()
        now = datetime.datetime.now(datetime.timezone.utc)
        date_str = now.strftime("%Y-%m-%d")
        slug_timestamp = now.strftime("%Y-%m-%d-%H%M")
        base_slug = f"{slug_timestamp}-{code}-ai-news"
        path = BLOG_DIR / code
        path.mkdir(exist_ok=True)
        slug = _generate_unique_slug(base_slug, path)
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

# === 5. GitHub Commit === (Bu fonksiyonda değişiklik yok)
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

# === MAIN === (Bu fonksiyonda değişiklik yok)
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
