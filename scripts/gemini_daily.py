import os
import feedparser
import datetime
import subprocess
from pathlib import Path
import requests

# Metin üretimi için Gemini API kütüphanesi
import google.generativeai as genai

# DÜZELTME: Görsel üretimi için Vertex AI kütüphanesi eklendi
import vertexai
from vertexai.vision_models import ImageGenerationModel

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

# 1. Gemini API Anahtarı (Metin üretimi için)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY ortam değişkeni bulunamadı veya boş!")
genai.configure(api_key=GEMINI_API_KEY)

# 2. Google Cloud Proje Bilgileri (Görsel üretimi için)
GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
GCP_LOCATION = os.environ.get("GCP_LOCATION", "us-central1") # Örn: "europe-west1"

# Vertex AI kullanılabilirlik bayrağı.
VERTEX_ENABLED = True

if not GCP_PROJECT_ID:
    print("⚠️ GCP_PROJECT_ID ortam değişkeni bulunamadı. Görsel üretimi atlanacak ve varsayılan görsel kullanılacak.")
    VERTEX_ENABLED = False
else:
    # Vertex AI'ı Başlat
    # Bu kodun çalışması için ortamınızda `gcloud auth application-default login` ile yetkilendirme yapılmış olmalıdır.
    try:
        vertexai.init(project=GCP_PROJECT_ID, location=GCP_LOCATION)
        print(f"✅ Vertex AI, '{GCP_PROJECT_ID}' projesi için '{GCP_LOCATION}' bölgesinde başlatıldı.")
    except Exception as e:
        print(f"❌ Vertex AI başlatılamadı. Google Cloud yetkilendirmenizi kontrol edin. Hata: {e}")
        print("ℹ️ Görsel üretimi bu çalıştırmada atlanacak.")
        VERTEX_ENABLED = False


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

# === 3. Görsel Üret (VERTEX AI İLE DÜZELTİLMİŞ FONKSİYON) ===
def generate_image(prompt_text):
    if not VERTEX_ENABLED:
        print("ℹ️ Vertex AI aktif değil. Görsel üretimi atlanıyor.")
        return None

    final_prompt = f"Create a futuristic, abstract, and visually stunning illustration representing the concept of '{prompt_text}'. Use a dark theme with vibrant, glowing data lines and geometric shapes. The style should be minimalistic, elegant, and high-tech. Photorealistic, cinematic lighting."
    print(f"Görsel prompt'u oluşturuluyor: {final_prompt}")

    try:
        # Vertex AI'daki Imagen modelini kullanıyoruz. 'imagegeneration@006' stabil bir versiyondur.
        model = ImageGenerationModel.from_pretrained("imagegeneration@006")

        print("Imagen modeli ile görsel üretiliyor...")
        response = model.generate_images(
            prompt=final_prompt,
            number_of_images=1,
            aspect_ratio="16:9"
        )

        image = response[0] # Yanıt listesindeki ilk görseli al

        filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        img_path = str(IMAGES_DIR / filename) # path objesini string'e çevir
        image.save(location=img_path, include_generation_parameters=False)

        print(f"✅ Görsel başarıyla kaydedildi: {img_path}")
        return filename
    except Exception as e:
        print(f"❌ Görsel üretimi sırasında Vertex AI hatası oluştu: {e}")
        print("ℹ️ Lütfen GCP projenizin aktif olduğundan, Vertex AI API'nin etkinleştirildiğinden ve yetkilendirmenizin doğru olduğundan emin olun.")
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
    try:
        status_result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, check=True)
        if not status_result.stdout.strip():
            print("ℹ️ Değişiklik bulunmadığı için commit atılmadı.")
            return
        print("Değişiklikler commit ediliyor ve push ediliyor...")
        subprocess.run(["git", "config", "user.name", "Fures AI Bot"], check=True)
        subprocess.run(["git", "config", "user.email", "bot@fures.at"], check=True)
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", "🤖 Daily AI Blog Update [auto]"], check=True)
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
