import os
import feedparser
import datetime
import subprocess
from pathlib import Path
import requests
import base64
from io import BytesIO
from PIL import Image # Pillow kütüphanesi gerekli!

# Metin ve Görsel üretimi için Gemini API kütüphanesi
import google.generativeai as genai

# Vertex AI/GCP kütüphaneleri (2. deneme için gerekli)
import vertexai

# === CONFIG ===
MODEL_TEXT = "gemini-2.5-pro"
MODEL_IMAGE = "gemini-2.5-flash-image" 
LANGS = { "tr": "Turkish", "en": "English", "de": "German", "ru": "Russian" }
LANG_NAMES = { "tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский" }
ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
IMAGES_DIR = ROOT / "blog_images"
BLOG_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)

# === API & ORTAM YAPILANDIRMASI ===

# 1. Gemini API Anahtarı
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY ortam değişkeni bulunamadı veya boş!")
genai.configure(api_key=GEMINI_API_KEY)
print("✅ Gemini API yapılandırıldı.")

# 2. Google Cloud Proje Bilgileri (Vertex AI yedeği için)
GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
GCP_LOCATION = os.environ.get("GCP_LOCATION", "us-central1") 

VERTEX_ENABLED = False
if GCP_PROJECT_ID:
    try:
        vertexai.init(project=GCP_PROJECT_ID, location=GCP_LOCATION)
        VERTEX_ENABLED = True
        print(f"✅ Vertex AI (Yedek Sistem), '{GCP_PROJECT_ID}' projesi için '{GCP_LOCATION}' bölgesinde başlatıldı.")
    except Exception as e:
        print(f"❌ Vertex AI başlatılamadı. Hata: {e}")
        print("ℹ️ Vertex AI ile görsel üretimi (Yedek Sistem) bu çalıştırmada atlanacak.")
else:
    print("ℹ️ GCP_PROJECT_ID bulunamadığından Vertex AI (Yedek Sistem) atlanacak.")

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
                    except requests.RequestException:
                        pass
                    articles.append({"title": entry.title, "link": final_url})
                    seen_links.add(google_news_url)
            except Exception as e:
                print(f"Uyarı: RSS akışı okunurken bir hata oluştu {feed}: {e}")
    return articles[:limit]

# === 2. Blog Metni Üret ===
def generate_single_blog(news_list, lang_code):
    language = LANGS[lang_code]
    summaries = "\n".join([f"- Title: {n['title']}\n  Link: {n['link']}" for n in news_list])
    prompt = f"""
    Persona: You are a master storyteller and expert AI journalist for a popular tech blog.
    Tone: Your tone is engaging, insightful, and slightly playful.
    Task: Analyze the following AI news and synthesize them into a single, compelling blog article (400-600 words) in {language}.
    News Sources:\n{summaries}
    Output Structure:
    1. Title: Start with a catchy title, prefixed with '###'.
    2. Body: Weave the news into a coherent narrative. Focus on the "Wow" factor and WHY this news matters.
    3. Hashtags: Include a line with 5-7 relevant hashtags in {language}.
    4. Sources: Conclude with a "Sources" section (in the correct language), listing ALL original links.
    """
    model = genai.GenerativeModel(MODEL_TEXT)
    try:
        resp = model.generate_content(prompt)
        return resp.text
    except Exception as e:
        print(f"❌ {language} dilinde içerik üretilirken hata oluştu: {e}")
        return None

# === GÖRSEL ÜRETİMİ - 1. DENEME (GEMINI 2.5 FLASH IMAGE - STANDART YÖNTEM) ===
def generate_image_gemini(final_prompt):
    print(f"\n[1. Deneme: '{MODEL_IMAGE}' ile Görsel Üretiliyor...]")
    try:
        model = genai.GenerativeModel(MODEL_IMAGE)
        # Yanıtın tamamını tek seferde al (Non-Streaming)
        response = model.generate_content(final_prompt)
        
        # Yanıtı işle
        image_part = response.candidates[0].content.parts[0]
        if 'inline_data' not in image_part:
            raise ValueError("API yanıtında beklenen görsel verisi (inline_data) bulunamadı.")

        image_data = image_part.inline_data
        image_bytes = base64.b64decode(image_data.data)
        image = Image.open(BytesIO(image_bytes))

        # Görseli kaydet
        filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        img_path = str(IMAGES_DIR / filename)
        image.save(img_path, format='PNG') 

        print(f"✅ [1. Deneme BAŞARILI] Görsel başarıyla kaydedildi: {img_path}")
        return filename
    except Exception as e:
        print(f"❌ [1. Deneme BAŞARISIZ] Gemini API hatası: {e}")
        return None

# === GÖRSEL ÜRETİMİ - 2. DENEME (VERTEX AI IMAGEN - YEDEK) ===
def generate_image_vertexai(final_prompt):
    if not VERTEX_ENABLED:
        print("ℹ️ Vertex AI etkinleştirilmediği için 2. Deneme (Yedek) atlanıyor.")
        return None
        
    print("\n[2. Deneme (Yedek): Vertex AI (Imagen) ile Görsel Üretiliyor...]")
    try:
        from vertexai.vision_models import ImageGenerationModel 
        model = ImageGenerationModel.from_pretrained("imagegeneration@006")
        response = model.generate_images(prompt=final_prompt, number_of_images=1, aspect_ratio="16:9")
        
        if response.images:
            image = response.images[0]
            filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            img_path = str(IMAGES_DIR / filename)
            image.save(location=img_path, include_generation_parameters=False)
            print(f"✅ [2. Deneme BAŞARILI] Görsel başarıyla kaydedildi (Vertex AI): {img_path}")
            return filename
        else:
            raise Exception("Vertex AI'dan görsel yanıtı alınamadı.")
    except Exception as e:
        print(f"❌ [2. Deneme BAŞARISIZ] Vertex AI hatası: {e}")
        return None

# === 3. Ana Görsel Üretim Fonksiyonu ===
def generate_image(prompt_text):
    final_prompt = f"""
    A visually stunning 16:9 digital art illustration.
    **Subject:** An abstract representation of '{prompt_text}'. A central, glowing neural network core pulses with energy, sending vibrant data streams outwards through intricate geometric patterns.
    **Style:** A fusion of cyberpunk aesthetic and minimalistic elegance, inspired by the art of Syd Mead and the movie 'Tron'.
    **Palette:** A dark, high-tech theme with electric blue, magenta, and subtle gold highlights.
    **Lighting:** Photorealistic, cinematic lighting with strong volumetric rays.
    """
    
    # 1. Deneme: Ana yöntem
    image_filename = generate_image_gemini(final_prompt)
    if image_filename:
        return image_filename
        
    # 2. Deneme: Yedek yöntem
    print("ℹ️ Ana görsel üretimi başarısız oldu, yedek sisteme geçiliyor.")
    image_filename = generate_image_vertexai(final_prompt)
    if image_filename:
        return image_filename

    print("❌ Tüm görsel üretim denemeleri başarısız oldu.")
    return None

# === 4. Blog Dosyasını Kaydet ===
def save_blog(blog_content, lang_code, image_filename="default.png"):
    if not blog_content: return
    date_time_str = datetime.datetime.now().strftime("%Y-%m-%d-%H%M") 
    slug = f"{date_time_str}-{lang_code}-ai-news"
    path = BLOG_DIR / lang_code
    path.mkdir(exist_ok=True)
    image_path_for_blog = f"/blog_images/{image_filename if image_filename else 'default.png'}"
    html = f"""---
title: "AI Daily — {LANG_NAMES[lang_code]}"
date: {date_time_str}
image: {image_path_for_blog}
lang: {lang_code}
---
{blog_content.strip()}
"""
    with open(path / f"{slug}.md", "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ Blog kaydedildi: {LANG_NAMES[lang_code]} → {slug}.md")

# === 5. GitHub Commit ===
def commit_and_push():
    try:
        current_time_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        status_result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, check=True)
        if not status_result.stdout.strip():
            print("ℹ️ Değişiklik bulunmadığı için commit atılmadı.")
            return
        print("Değişiklikler commit ediliyor ve push ediliyor...")
        subprocess.run(["git", "config", "user.name", "Fures AI Bot"], check=True)
        subprocess.run(["git", "config", "user.email", "bot@fures.at"], check=True) 
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", f"🤖 Daily AI Blog Update [auto] ({current_time_str})"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("🚀 Blog başarıyla GitHub'a gönderildi.")
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"❌ Git işlemi sırasında bir hata oluştu: {e}")

# === MAIN ===
def main():
    print("Fetching latest AI news...")
    news = fetch_ai_news()
    if not news: 
        print("❌ Haberler alınamadı, işlem durduruluyor.")
        return

    print("\nGenerating image...")
    image_prompt = news[0]['title'] if news else "AI breakthroughs and future technology"
    image_filename = generate_image(image_prompt)
    
    if not image_filename:
        print("⚠️ Görsel üretilemedi, varsayılan görsel kullanılacak: default.png")
        image_filename = "default.png"

    for lang_code in LANGS.keys():
        print(f"\n--- {LANG_NAMES[lang_code]} için içerik üretiliyor ---")
        blog_text = generate_single_blog(news, lang_code)
        if blog_text:
            save_blog(blog_text, lang_code, image_filename)
        else:
            print(f"❌ {LANG_NAMES[lang_code]} için blog metni oluşturulamadı.")

    print("\nCommitting to GitHub...")
    commit_and_push()
    print("\n✅ İşlem tamamlandı.")

if __name__ == "__main__":
    main()
