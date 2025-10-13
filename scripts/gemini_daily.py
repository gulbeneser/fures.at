import os
import feedparser
import datetime
import subprocess
from pathlib import Path
import requests
import base64
from io import BytesIO
from PIL import Image

# Metin ve GÖRSEL üretimi için Gemini API kütüphanesi
import google.generativeai as genai
from google.generativeai import types # config kullanmak için

# Vertex AI/GCP ile ilgili modüllere artık GEREK YOK!
# import vertexai
# from vertexai.vision_models import ImageGenerationModel


# === CONFIG ===
# Metin üretimi için güncel bir model
MODEL_TEXT = "gemini-2.5-flash"
LANGS = { "tr": "Turkish", "en": "English", "de": "German", "ru": "Russian" }
LANG_NAMES = { "tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский" }
ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
IMAGES_DIR = ROOT / "blog_images"
BLOG_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)

# === API & ORTAM YAPILANDIRMASI ===

# 1. Gemini API Anahtarı (Metin ve Görsel üretimi için)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY ortam değişkeni bulunamadı veya boş!")
genai.configure(api_key=GEMINI_API_KEY)


# Vertex AI Kullanılabilirlik Bayrağı KALDIRILDI, artık sadece GEMINI API kullanılıyor.
# Sadece bilgilendirme için tutulabilir:
IMAGE_GEN_ENABLED = True 

# GCP projesi kontrolü KALDIRILDI. Görsel üretimi artık bu anahtara bağlı.
print("✅ Gemini API, metin ve görsel üretimi için yapılandırıldı.")

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

# === 3. Görsel Üret (GEMINI API İLE GÜNCELLENMİŞ FONKSİYON) ===
def generate_image(prompt_text):
    if not IMAGE_GEN_ENABLED:
        print("ℹ️ Görsel üretimi devre dışı.")
        return None

    # Daha estetik bir görsel için prompt formatı korunuyor
    final_prompt = f"Create a futuristic, abstract, and visually stunning illustration representing the concept of '{prompt_text}'. Use a dark theme with vibrant, glowing data lines and geometric shapes. The style should be minimalistic, elegant, and high-tech. Photorealistic, cinematic lighting."
    print(f"Görsel prompt'u oluşturuluyor: {final_prompt}")

    try:
        model_name = "gemini-2.5-flash-image"
        client = genai.Client()

        print(f"{model_name} modeli ile görsel üretiliyor...")

        # Gemini API generate_content çağrısı
        response = client.models.generate_content(
            model=model_name,
            contents=[final_prompt],
            config=types.GenerateContentConfig(
                image_config=types.ImageConfig(
                    aspect_ratio="16:9", # Blog için geniş ekran formatı
                ),
                response_modalities=['Image'] # Sadece görsel çıktı iste
            )
        )
        
        # Yanıttan base64 kodlu görsel verisini al
        # Cevabın ilk adayın ilk parçası (part) olmasını bekliyoruz
        image_part = response.candidates[0].content.parts[0].inline_data
        
        if image_part is None:
            print("❌ Görsel üretildi ancak görsel verisi alınamadı (inline_data boş).")
            return None

        # Base64 verisini çöz ve görsel olarak aç
        image_data = base64.b64decode(image_part.data)
        image = Image.open(BytesIO(image_data))
        
        # Görseli kaydet
        filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        img_path = str(IMAGES_DIR / filename)
        image.save(img_path, format='PNG') 

        print(f"✅ Görsel başarıyla kaydedildi: {img_path}")
        return filename
    except Exception as e:
        # Hata mesajı artık 403 değil, API'nin kendisinden gelecektir.
        print(f"❌ Görsel üretimi sırasında Gemini API hatası oluştu: {e}")
        print("ℹ️ Lütfen GEMINI_API_KEY'nizin geçerli olduğundan ve Gemini API kullanım kotanızın dolmadığından emin olun.")
        return None

# === 4. Blog Dosyasını Kaydet ===
def save_blog(blog_content, lang_code, image_filename="default.png"):
    if not blog_content: return
    # Dosya adında çakışmayı önlemek için saat bilgisini ekliyoruz
    date_time_str = datetime.datetime.now().strftime("%Y-%m-%d-%H%M") 
    slug = f"{date_time_str}-{lang_code}-ai-news"
    path = BLOG_DIR / lang_code
    path.mkdir(exist_ok=True)
    html = f"""---
title: "AI Daily — {LANG_NAMES[lang_code]}"
date: {date_time_str}
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
    try:
        # Commit mesajına yeni bir tarih-saat bilgisi ekleniyor (çakışmayı önlemek için)
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
    # İlk haber başlığı görsel için prompt olarak kullanılıyor
    image_prompt = news[0]['title'] 
    image_filename = generate_image(image_prompt)
    
    if not image_filename:
        print("⚠️ Görsel üretilemedi, varsayılan görsel kullanılacak.")
    
    for lang_code in LANGS.keys():
        print(f"\n--- {LANG_NAMES[lang_code]} için içerik üretiliyor ---")
        blog_text = generate_single_blog(news, lang_code)
        if blog_text:
            save_blog(blog_text, lang_code, image_filename)
        else:
            print(f"❌ {LANG_NAMES[lang_code]} için blog metni oluşturulamadı, bu dil atlanıyor.")

    print("\nCommitting to GitHub...")
    commit_and_push()
    print("\n✅ İşlem tamamlandı.")

if __name__ == "__main__":
    main()
