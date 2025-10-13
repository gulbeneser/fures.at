import os
import feedparser
import datetime
import subprocess
from pathlib import Path
import google.generativeai as genai
import requests

# === CONFIG ===
# Not: Metin üretimi için en güncel ve yetenekli modellerden biri.
MODEL_TEXT = "gemini-2.5-flash" 
# DÜZELTME: Metinden görsel üretmek için doğru ve en güncel model adı kullanıldı.
MODEL_IMAGE = "imagen-4.0-generate-001" 
LANGS = { "tr": "Turkish", "en": "English", "de": "German", "ru": "Russian" }
LANG_NAMES = { "tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский" }
# DÜZELTME: Betiğin çalıştığı dizini doğru bulmak için `__file__` kullanıldı.
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
                        # Yönlendirmeleri takip et ve zaman aşımı ekle
                        response = session.head(google_news_url, allow_redirects=True, timeout=5)
                        final_url = response.url
                    except requests.RequestException:
                        pass # Eğer URL'ye ulaşılamazsa orijinal linki kullan
                        
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
    News sources:
    {summaries}
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

# === 3. Görsel Üret (TAMAMEN DÜZELTİLMİŞ FONKSİYON) ===
def generate_image(prompt_text):
    final_prompt = f"Create a futuristic, abstract, and visually stunning illustration representing the concept of '{prompt_text}'. Use a dark theme with vibrant, glowing data lines. Minimalistic and elegant."
    print(f"Görsel prompt'u oluşturuluyor: {final_prompt}")
    
    try:
        # 1. DÜZELTME: Doğru görsel modeli çağırıyoruz.
        image_model = genai.GenerativeModel(MODEL_IMAGE)
        
        # 2. DÜZELTME: 'generate_content' çağrısından hatalı 'generation_config' parametresi kaldırıldı.
        # Imagen modelleri bu parametreye ihtiyaç duymaz ve doğrudan görsel üretir.
        response = image_model.generate_content(final_prompt)

        # Yanıtın içeriğini daha güvenli bir şekilde kontrol ediyoruz
        if response.parts and hasattr(response.parts[0], 'inline_data') and response.parts[0].inline_data.data:
            image_bytes = response.parts[0].inline_data.data
            filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            img_path = IMAGES_DIR / filename
            
            with open(img_path, "wb") as f:
                f.write(image_bytes)
                
            print(f"✅ Görsel başarıyla kaydedildi: {filename}")
            return filename
        else:
            # Hata ayıklamayı kolaylaştırmak için API'den gelen ham yanıtı yazdırıyoruz
            print(f"❌ Görsel üretilemedi, API'den beklenen formatta yanıt gelmedi. Yanıt: {response}")
            return None
    except Exception as e:
        print(f"❌ Görsel üretimi sırasında genel bir hata oluştu: {e}")
        return None

# === 4. Blog Dosyasını Kaydet ===
def save_blog(blog_content, lang_code, image_filename="default.png"):
    if not blog_content: return
    date_str = datetime.datetime.now().strftime("%Y-%m-%d")
    slug = f"{date_str}-{lang_code}-ai-news"
    path = BLOG_DIR / lang_code
    path.mkdir(exist_ok=True)
    
    # DÜZELTME: Markdown frontmatter formatı düzeltildi. (--- ile kapatıldı)
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
        # İyileştirme: Sadece değişiklik varsa commit at
        status_result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, check=True)
        if not status_result.stdout.strip():
            print("ℹ️ Değişiklik bulunmadığı için commit atılmadı.")
            return
            
        print("Değişiklikler commit ediliyor ve push ediliyor...")
        subprocess.run(["git", "config", "user.name", "Fures AI Bot"], check=True)
        subprocess.run(["git", "config", "user.email", "bot@fures.at"], check=True)
        subprocess.run(["git", "add", str(BLOG_DIR), str(IMAGES_DIR)], check=True)
        subprocess.run(["git", "commit", "-m", "🤖 Daily AI Blog Update [auto]"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("🚀 Blog başarıyla GitHub'a gönderildi.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Git işlemi sırasında bir hata oluştu: {e}")
    except FileNotFoundError:
        print("❌ 'git' komutu bulunamadı. Git'in kurulu ve PATH'de olduğundan emin olun.")

# === MAIN ===
def main():
    print("Fetching latest AI news...")
    news = fetch_ai_news()
    if not news: 
        print("❌ Haberler alınamadı, işlem durduruluyor.")
        return

    print("\nGenerating image...")
    # Görsel için en ilgi çekici başlığı kullan
    image_prompt = news[0]['title']
    image_filename = generate_image(image_prompt)
    
    # Eğer görsel üretilemezse, blog yazılarında varsayılan bir görsel kullan
    if not image_filename:
        print("⚠️ Görsel üretilemedi, varsayılan görsel kullanılacak.")
    
    for lang_code in LANGS.keys():
        print(f"\n--- {LANG_NAMES[lang_code]} için içerik üretiliyor ---")
        blog_text = generate_single_blog(news, lang_code)
        save_blog(blog_text, lang_code, image_filename)
        
    print("\nCommitting to GitHub...")
    commit_and_push()
    print("\n✅ İşlem tamamlandı.")

if __name__ == "__main__":
    main()
