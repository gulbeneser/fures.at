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
from google.generativeai import types # Gemini config kullanmak için

# Vertex AI/GCP kütüphaneleri (2. deneme için gerekli)
import vertexai
# from vertexai.vision_models import ImageGenerationModel # İhtiyaç duyulursa generate_image_vertexai içinde import edilecek


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
        # Vertex AI'ı Başlat (403 hatasını çözmek için izinler ve faturalandırma gereklidir)
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
                        # Google News linklerinin doğrudan hedef siteye yönlendirmesi için
                        response = session.head(google_news_url, allow_redirects=True, timeout=5)
                        final_url = response.url
                    except requests.RequestException:
                        # Eğer head isteği başarısız olursa orijinal linki kullanmaya devam et
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

# === GÖRSEL ÜRETİMİ - 1. DENEME (GEMINI API) ===
def generate_image_gemini(final_prompt):
    print("\n[1. Deneme: Gemini API ile Görsel Üretiliyor...]")
    try:
        # Doğrudan görsel üretim modeli kimliği (varsa) veya multimodal model
        # `gemini-pro-vision` multimodal bir modeldir, ancak doğrudan Text-to-Image için
        # spesifik bir model adı gerekebilir veya API'nin default davranışı olabilir.
        # Eğer bu kısım hata verirse, `generate_content` çağrısını daha basit düşünmek gerekebilir.
        model = genai.GenerativeModel("gemini-pro-vision") # Multimodal model denemesi

        # Görsel parametreleri (en boy oranı) doğrudan `generate_content` içinde verilmez.
        # Ya modelin doğrudan Text-to-Image arayüzü vardır (ki bu genellikle ayrı bir modeldir)
        # Ya da prompt içinde belirtilir, ya da varsayılan değerlerle üretilir.
        # Buradaki ImageConfig hatası, bunun generate_content'e bu şekilde geçirilmediğini gösterir.
        # Bu yüzden en basit çağrı şeklini deniyoruz ve en boy oranını prompt'a bırakıyoruz.
        response = model.generate_content(
            contents=[final_prompt] # Sadece metin prompt'u gönderiyoruz
        )
        
        # Yanıtı kontrol et ve doğru şekilde görsel verisine eriş
        # Gemini API'nin multimodal yanıtları farklı formatlarda olabilir.
        # Eğer doğrudan bir Image objesi dönerse (ideal):
        if hasattr(response, 'images') and response.images:
            image = response.images[0]
        # Eğer base64 kodlu veri içeren partlar dönerse:
        elif response.candidates and response.candidates[0].content.parts:
            image_part_found = None
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    image_part_found = part.inline_data
                    break
            
            if image_part_found:
                image_data = base64.b64decode(image_part_found.data)
                image = Image.open(BytesIO(image_data))
            else:
                raise Exception("Görsel üretildi ancak yanıt parts içinde inline_data içermiyor.")
        else:
            print(f"DEBUG: Gemini API yanıtı beklenenden farklı formatta veya boş: {response}")
            raise Exception("Görsel üretildi ancak yanıt boş veya görsel içermiyor.")
        
        # Görseli kaydet
        filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        img_path = str(IMAGES_DIR / filename)
        image.save(img_path, format='PNG') 

        print(f"✅ [1. Deneme BAŞARILI] Görsel başarıyla kaydedildi (Gemini API): {img_path}")
        return filename
    except Exception as e:
        print(f"❌ [1. Deneme BAŞARISIZ] Gemini API hatası: {e}")
        print("ℹ️ Gemini API ile doğrudan Text-to-Image yetenekleri için model adı ve çağrı yöntemi değişmiş olabilir.")
        print("   Alternatif olarak, prompt'a en boy oranını belirtmek (örneğin 'generate a 16:9 image...') denenebilir.")
        return None


# === GÖRSEL ÜRETİMİ - 2. DENEME (VERTEX AI IMAGEN) ===
def generate_image_vertexai(final_prompt):
    if not VERTEX_ENABLED:
        print("ℹ️ Vertex AI etkinleştirilmediği için 2. Deneme atlanıyor.")
        return None
        
    print("\n[2. Deneme: Vertex AI (Imagen) ile Görsel Üretiliyor...]")
    try:
        # Import buraya taşındı, aksi halde modül yüklenemezse hata fırlatır
        from vertexai.vision_models import ImageGenerationModel 
        
        # Vertex AI'daki Imagen modelini kullanıyoruz.
        model = ImageGenerationModel.from_pretrained("imagegeneration@006")

        response = model.generate_images(
            prompt=final_prompt,
            number_of_images=1,
            aspect_ratio="16:9" # Imagen için bu parametre geçerlidir
        )
        
        # Vertex AI yanıtında resim listesi döner
        if response.images:
            image = response.images[0]

            filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            img_path = str(IMAGES_DIR / filename)
            # Vertex AI Image objesini kaydederken location parametresi kullanılır
            image.save(location=img_path, include_generation_parameters=False)

            print(f"✅ [2. Deneme BAŞARILI] Görsel başarıyla kaydedildi (Vertex AI): {img_path}")
            return filename
        else:
            raise Exception("Vertex AI'dan görsel yanıtı alınamadı.")
            
    except Exception as e:
        print(f"❌ [2. Deneme BAŞARISIZ] Vertex AI hatası: {e}")
        print("ℹ️ Lütfen GCP izinlerinizi (403 hatası için) ve faturalandırmanızı kontrol edin.")
        print("   - Vertex AI API'sinin etkin olduğundan emin olun.")
        print("   - Kullandığınız hizmet hesabının 'Vertex AI Kullanıcısı' ve 'Depolama Nesnesi Yöneticisi' izinlerine sahip olduğundan emin olun.")
        print("   - Projenizin faturalandırmasının etkin olduğundan emin olun.")
        return None

# === 3. Ana Görsel Üretim Fonksiyonu (Çoklu Deneme) ===
def generate_image(prompt_text):
    
    # Görsel üretim için daha zengin bir prompt oluştur
    # Prompt içine en boy oranını eklemek, bazı modeller için faydalı olabilir.
    final_prompt = f"Create a futuristic, abstract, and visually stunning 16:9 illustration representing the concept of '{prompt_text}'. Use a dark theme with vibrant, glowing data lines and geometric shapes. The style should be minimalistic, elegant, and high-tech. Photorealistic, cinematic lighting."
    
    # 1. Deneme: Gemini API
    image_filename = generate_image_gemini(final_prompt)
    if image_filename:
        return image_filename
        
    # 2. Deneme: Vertex AI (Sadece VERTEX_ENABLED ise denenir)
    image_filename = generate_image_vertexai(final_prompt)
    if image_filename:
        return image_filename

    print("❌ Hiçbir görsel üretim denemesi başarılı olamadı.")
    return None

# === 4. Blog Dosyasını Kaydet ===
def save_blog(blog_content, lang_code, image_filename="default.png"):
    if not blog_content: return
    # Dosya adında çakışmayı önlemek için saat bilgisini ekliyoruz
    date_time_str = datetime.datetime.now().strftime("%Y-%m-%d-%H%M") 
    slug = f"{date_time_str}-{lang_code}-ai-news"
    path = BLOG_DIR / lang_code
    path.mkdir(exist_ok=True)
    
    # Görsel yolu, sitenin kök dizinine göre ayarlanmalı
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
    # İlk haberin başlığını görsel için prompt olarak kullan
    image_prompt = news[0]['title'] if news else "AI breakthroughs and future technology" # Haber yoksa yedek prompt
    image_filename = generate_image(image_prompt)
    
    if not image_filename:
        print("⚠️ Görsel üretilemedi, varsayılan görsel kullanılacak: default.png")
        image_filename = "default.png" # Varsayılan görseli kullanmaya zorla

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
