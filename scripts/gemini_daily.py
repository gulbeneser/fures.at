import os
import json
import base64
import feedparser
import datetime
import subprocess
from pathlib import Path
from google import genai
from google.genai import types

# === CONFIG ===
MODEL_TEXT = "gemini-2.0-flash"
MODEL_IMAGE = "gemini-2.5-flash-image"
LANGS = {
    "tr": "Türkçe",
    "en": "English",
    "de": "Deutsch",
    "ru": "Русский"
}
ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
IMAGES_DIR = ROOT / "blog_images"
BLOG_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# === 1. Haberleri Çek ===
def fetch_ai_news(limit=5):
    feeds = [
        "https://news.google.com/rss/search?q=artificial+intelligence&hl=en",
        "https://news.google.com/rss/search?q=ai+tourism&hl=en",
        "https://news.google.com/rss/search?q=artificial+intelligence+technology&hl=en",
    ]
    articles = []
    for feed in feeds:
        parsed = feedparser.parse(feed)
        for entry in parsed.entries[:limit]:
            articles.append({
                "title": entry.title,
                "link": entry.link,
                "summary": entry.summary if "summary" in entry else ""
            })
    return articles[:limit]

# === 2. Blog Metni Üret ===
def generate_multilingual_blog(news_list):
    summaries = "\n".join([f"- {n['title']} ({n['link']})" for n in news_list])

    prompt = f"""
    You are an expert AI journalist writing multilingual blog articles.
    Summarize and creatively expand on the following AI news headlines:

    {summaries}

    Create 4 short blog articles (400-600 words each) in:
    - Turkish
    - English
    - German
    - Russian

    Each blog should:
    - Have a title
    - Be engaging, educational and a bit playful
    - Mention real references from the links
    - End with a reflective or inspiring note
    """

    contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
    resp = client.models.generate_content(model=MODEL_TEXT, contents=contents)
    return resp.text

# === 3. Görsel Üret ===
def generate_image(prompt_text):
    try:
        response = client.models.generate_image(
            model=MODEL_IMAGE,
            prompt=f"Create a futuristic AI-themed illustration: {prompt_text}"
        )
        image_base64 = response.image.image_bytes
        filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        img_path = IMAGES_DIR / filename
        with open(img_path, "wb") as f:
            f.write(base64.b64decode(image_base64))
        return filename
    except Exception as e:
        print("Image generation failed:", e)
        return None

# === 4. 4 Dilde Dosyaya Yaz ===
def save_blogs(multilingual_text, image_filename):
    sections = multilingual_text.split("###")
    for code, lang in LANGS.items():
        section = next((s for s in sections if lang in s), None)
        if not section:
            continue
        date_str = datetime.datetime.now().strftime("%Y-%m-%d")
        slug = f"{date_str}-{code}-ai-news"
        path = BLOG_DIR / code
        path.mkdir(exist_ok=True)

        html = f"""---
title: "AI Daily — {lang}"
date: {date_str}
image: /blog_images/{image_filename if image_filename else 'default.png'}
lang: {code}
---

{section.strip()}
"""
        with open(path / f"{slug}.md", "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✅ Saved blog for {lang} → {slug}.md")

# === 5. GitHub Commit ===
def commit_and_push():
    subprocess.run(["git", "config", "--global", "user.email", "bot@fures.at"])
    subprocess.run(["git", "config", "--global", "user.name", "Fures AI Bot"])
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", "🤖 Daily AI Blog Update [auto]"])
    subprocess.run(["git", "push"])
    print("🚀 Blog pushed to GitHub successfully.")

# === MAIN ===
def main():
    print("Fetching latest AI news...")
    news = fetch_ai_news()
    print("Generating multilingual content...")
    blog_text = generate_multilingual_blog(news)
    print("Generating image...")
    image = generate_image(news[0]['title'] if news else "AI Innovation 2025")
    print("Saving blogs...")
    save_blogs(blog_text, image)
    print("Committing to GitHub...")
    commit_and_push()
    print("✅ All done. Netlify will rebuild automatically.")

if __name__ == "__main__":
    main()
