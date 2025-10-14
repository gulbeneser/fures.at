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
# from vertexai.vision_models import ImageGenerationModel # İhtiyaç duyulursa generate_image_vertexai içinde import edilecek


# === CONFIG ===
# Metin üretimi için güncel ve daha güçlü model (İSTEĞİNİZ ÜZERİNE GÜNCELLENDİ)
MODEL_TEXT = "gemini-2.5-pro"
LANGS = { "tr": "Turkish", "en": "English", "de": "German", "ru": "Russian" }
LANG_NAMES = { "tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский" }
ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
IMAGES_DIR = ROOT / "blog_images"
BLOG_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)

# === API & ORTAM YAPILANDIRMASI ===

# 1. Gemini API Anahtarı (Metin ve 1. Görsel denemesi için)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY ortam değişkeni bulunamadı veya boş! Metin üretimi yapılamaz.")
genai.configure(api_key=GEMINI_API_KEY)
print("✅ Gemini API (Metin ve 1. Görsel Denemesi) yapılandırıldı.")


# 2. Google Cloud Proje Bilgileri (2. Görsel denemesi için)
GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
GCP_LOCATION = os.environ.get("GCP_LOCATION", "us-central1") 

# Vertex AI kullanılabilirlik bayrağı.
VERTEX_ENABLED = False
if GCP_PROJECT_ID:
    try:
        # Vertex AI'ı Başlat
        vertexai.init(project=GCP_PROJECT_ID, location=GCP_LOCATION)
        VERTEX_ENABLED = True
        print(f"✅ Vertex AI (2. Görsel Denemesi), '{GCP_PROJECT_ID}' projesi için '{GCP_LOCATION}' bölgesinde başlatıldı.")
    except Exception as e:
        print(f"❌ Vertex AI başlatılamadı. Hata: {e}")
        print("ℹ️ Vertex AI ile görsel üretimi bu çalıştırmada atlanacak (2. Deneme).")
else:
    print("ℹ️ GCP_PROJECT_ID ortam değişkeni bulunamadığından Vertex AI (2. Görsel Denemesi) atlanacak.")


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

# === 2. Tek Bir Dilde Blog Metni Üret ===
def generate_single_blog(news_list, lang_code):
    language = LANGS[lang_code]
    summaries = "\n".join([f"- Title: {n['title']}\n  Link: {n['link']}" for n in news_list])
    
    # --- İYİLEŞTİRİLMİŞ PROMPT ---
    prompt = f"""
    Persona: You are a master storyteller and expert AI journalist for a popular tech blog.
    Tone: Your tone is engaging, insightful, and slightly playful. Make complex topics easily understandable.

    Target Audience: Write for a tech-savvy audience that is interested in AI but may not be an expert. Avoid overly technical jargon.

    Task: Analyze the following AI news and synthesize them into a single, compelling blog article (400-600 words) in {language}. Do not just list the news; weave them into a coherent narrative that tells a story about the current state of AI.

    News Sources:
    {summaries}

    Output Structure & Rules:
    1.  **Title:** Start the entire output with a catchy title, prefixed with '###'.
    2.  **Introduction:** Begin with a strong hook that grabs the reader's attention.
    3.  **Body:** Discuss the key developments. Instead of a simple summary, focus on the "Wow" factor. Explain the broader implications and WHY this news matters to our audience.
    4.  **Conclusion:** End with a forward-looking statement or a thought-provoking question about the future of AI.
    5.  **Hashtags:** Before the sources, include a line with 5-7 relevant hashtags in {language}.
    6.  **Sources:** Conclude with a "Sources" section (in the correct language), listing ALL original links.

    Negative Constraints:
    - Do NOT use clichés like "In a world where...".
    - Do NOT simply copy sentences from the source titles.
    - Do NOT be overly formal or academic.
    """
    model = genai.GenerativeModel(MODEL_TEXT)
    try:
        resp = model.generate_content(prompt)
        return resp.text
    except Exception as e:
        print(f"❌ {language} dilinde içerik üretilirken hata oluştu: {e}")
        return None

# === GÖRSEL ÜRETİMİ - 1. DENEME (GEMINI API) ===
def generate_image_gemini(final_prompt):
    print("\n[1. Deneme: Gemini API ile Görsel Üretiliyor...]")
    try:
        # ÖNEMLİ NOT: 'gemini-pro-vision' bir multimodal anlama modelidir, yani görsel ve metinleri
        # analiz eder, sıfırdan görsel ÜRETMEZ. Bu denemenin başarısız olması beklenir.
        # Görsel üretimi için Google'ın Imagen model ailesini hedefleyen bir Gemini API
        # endpoint'i kullanılmalıdır. Bu kod, bu API'nin gelecekteki olası entegrasyonu için
        # bir yer tutucu olarak düşünülebilir. Şimdilik bu adım atlanıp Vertex AI'a geçilecektir.
        model = genai.GenerativeModel("gemini-pro-vision") # Bu model görsel üretmez, bu deneme başarısız olacaktır.

        response = model.generate_content(contents=[final_prompt])
        
        # Yanıtı işle (Bu kısım teoriktir ve muhtemelen çalışmayacaktır)
        if response.candidates and response.candidates[0].content.parts:
            image_part_found = None
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    image_part_found = part.inline_data
                    break
            if image_part_found:
                image_data = base64.b64decode(image_part_found.data)
                image = Image.open(BytesIO(image_data))
                filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                img_path = str(IMAGES_DIR / filename)
                image.save(img_path, format='PNG') 
                print(f"✅ [1. Deneme BAŞARILI] Görsel başarıyla kaydedildi (Gemini API): {img_path}")
                return filename
        raise Exception("Görsel üretildi ancak yanıt boş veya görsel içermiyor.")

    except Exception as e:
        print(f"❌ [1. Deneme BAŞARISIZ] Gemini API hatası: {e}")
        print("ℹ️ Bu beklenen bir durumdur. 'gemini-pro-vision' görsel üretimi için tasarlanmamıştır.")
        print("   Şimdi 2. denemeye (Vertex AI) geçiliyor...")
        return None


# === GÖRSEL ÜRETİMİ - 2. DENEME (VERTEX AI IMAGEN) ===
def generate_image_vertexai(final_prompt):
    if not VERTEX_ENABLED:
        print("ℹ️ Vertex AI etkinleştirilmediği için 2. Deneme atlanıyor.")
        return None
        
    print("\n[2. Deneme: Vertex AI (Imagen) ile Görsel Üretiliyor...]")
    try:
        from vertexai.vision_models import ImageGenerationModel 
        
        model = ImageGenerationModel.from_pretrained("imagegeneration@006")

        response = model.generate_images(
            prompt=final_prompt,
            number_of_images=1,
            aspect_ratio="16:9"
        )
        
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
        print("ℹ️ Lütfen GCP izinlerinizi, faturalandırmanızı ve Vertex AI API'nin etkin olduğunu kontrol edin.")
        return None

# === 3. Ana Görsel Üretim Fonksiyonu (Çoklu Deneme) ===
def generate_image(prompt_text):
    
    # --- İYİLEŞTİRİLMİŞ GÖRSEL PROMPT'U ---
    final_prompt = f"""
    A visually stunning 16:9 digital art illustration.

    **Subject:** An abstract representation of '{prompt_text}'. A central, glowing neural network core pulses with energy, sending vibrant data streams outwards through intricate geometric patterns.

    **Style:** A fusion of cyberpunk aesthetic and minimalistic elegance. Inspired by the art of Syd Mead and the visual language of the movie 'Tron'.

    **Environment & Palette:** A dark, high-tech theme. The background is a deep cosmic void. The main colors are electric blue, magenta, and subtle gold highlights against the dark backdrop.

    **Lighting:** Photorealistic, cinematic lighting. Strong volumetric light rays emanate from the glowing elements, creating a sense of depth and drama.
    
    **Negative Prompts:** avoid text, avoid human figures, blurry, noisy, cluttered, ugly.
    """
    
    # 1. Deneme: Gemini API (Başarısız olması bekleniyor)
    image_filename = generate_image_gemini(final_prompt)
    if image_filename:
        return image_filename
        
    # 2. Deneme: Vertex AI (Asıl çalışan yöntem)
    image_filename = generate_image_vertexai(final_prompt)
    if image_filename:
        return image_filename

    print("❌ Hiçbir görsel üretim denemesi başarılı olamadı.")
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
            print(f"❌ {LANG_NAMES[lang_code]} için blog metni oluşturulamadı, bu dil atlanıyor.")

    print("\nCommitting to GitHub...")
    commit_and_push()
    print("\n✅ İşlem tamamlandı.")

if __name__ == "__main__":
    main()
