import os
import feedparser
import datetime
import subprocess
from pathlib import Path
import requests
from io import BytesIO
from PIL import Image  # Pillow gerekli!

from image_rotation import ImageRotator, NoImagesAvailableError

# Metin üretimi için Gemini API
import google.generativeai as genai

# Vertex AI opsiyonel (yedek)
try:
    import vertexai
except ImportError:
    vertexai = None

# === CONFIG ===
MODEL_TEXT = "gemini-2.5-pro"
LANGS = {"tr": "Turkish", "en": "English", "de": "German", "ru": "Russian"}
LANG_NAMES = {"tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский"}

# Bu dosya scripts/ altında, repo kökü parent.parent
ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
IMAGES_DIR = ROOT / "blog_images"
BLOG_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)

# === API & ORTAM YAPILANDIRMASI ===

# 1) Gemini API Anahtarı (Metin üretimi için)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("HATA: GEMINI_API_KEY ortam değişkeni bulunamadı veya boş!")
genai.configure(api_key=GEMINI_API_KEY)
print("✅ Gemini (metin için) yapılandırıldı.")

# 2) Fal.ai ve Stability AI anahtarları (Görsel üretimi için)
FAL_KEY = os.environ.get("FAL_KEY")  # ZORUNLU (birincil görsel üretici)
STABILITY_API_KEY = os.environ.get("STABILITY_API_KEY")  # Opsiyonel (yedek)

# 3) Vertex AI (opsiyonel yedek)
GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
GCP_LOCATION = os.environ.get("GCP_LOCATION", "us-central1")
VERTEX_ENABLED = False
if GCP_PROJECT_ID and vertexai is not None:
    try:
        vertexai.init(project=GCP_PROJECT_ID, location=GCP_LOCATION)
        VERTEX_ENABLED = True
        print(f"✅ Vertex AI (Yedek) hazır: {GCP_PROJECT_ID}/{GCP_LOCATION}")
    except Exception as e:
        print(f"ℹ️ Vertex AI başlatılamadı: {e}")
else:
    print("ℹ️ Vertex AI opsiyonel; paket veya proje bilgisi yoksa atlanacak.")

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
                    if google_news_url in seen_links:
                        continue
                    final_url = google_news_url
                    try:
                        response = session.head(google_news_url, allow_redirects=True, timeout=5)
                        final_url = response.url
                    except requests.RequestException:
                        pass
                    articles.append({"title": entry.title, "link": final_url})
                    seen_links.add(google_news_url)
            except Exception as e:
                print(f"Uyarı: RSS akışı okunurken hata oluştu {feed}: {e}")
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
        print(f"❌ {language} dilinde içerik üretilirken hata: {e}")
        return None

# === GÖRSEL ÜRETİMİ: Fal.ai (Birincil) ===
def generate_image_fal_flux(final_prompt):
    print("\n[ Fal.ai Flux Schnell ] Görsel üretiliyor...")
    try:
        if not FAL_KEY:
            raise ValueError("FAL_KEY ortam değişkeni yok.")

        headers = {
            "Authorization": f"Key {FAL_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "prompt": final_prompt,
            "num_images": 1,
            "aspect_ratio": "16:9",
            "output_format": "png",
        }

        resp = requests.post(
            "https://fal.run/fal-ai/flux/schnell",
            headers=headers,
            json=payload,
            timeout=120,
        )
        resp.raise_for_status()
        data = resp.json()
        images = data.get("images") or (data.get("result", {}) or {}).get("images") or []
        if not images:
            raise ValueError(f"Fal.ai boş yanıt: {data}")

        img_url = images[0].get("url") if isinstance(images[0], dict) else images[0]
        if not img_url:
            raise ValueError(f"Görsel URL bulunamadı: {images[0]}")
        img_resp = requests.get(img_url, timeout=120)
        img_resp.raise_for_status()

        image = Image.open(BytesIO(img_resp.content))
        filename = f"ai_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.png"
        img_path = str(IMAGES_DIR / filename)
        image.save(img_path, format="PNG")

        print(f"✅ [ Fal.ai BAŞARILI ] {img_path}")
        return filename
    except Exception as e:
        print(f"❌ [ Fal.ai BAŞARISIZ ] {e}")
        return None

# === GÖRSEL ÜRETİMİ: Stability AI (Yedek) ===
def generate_image_stability(final_prompt):
    print("\n[ Stability AI ] Görsel üretiliyor...")
    try:
        if not STABILITY_API_KEY:
            print("ℹ️ STABILITY_API_KEY yok, Stability adımı atlanıyor.")
            return None

        endpoint = "https://api.stability.ai/v2beta/stable-image/generate/ultra"
        headers = {
            "Authorization": f"Bearer {STABILITY_API_KEY}",
            "Accept": "image/png",
        }
        files = {
            "prompt": (None, final_prompt),
            "aspect_ratio": (None, "16:9"),
            "output_format": (None, "png"),
        }

        r = requests.post(endpoint, headers=headers, files=files, timeout=180)
        if r.status_code != 200:
            raise ValueError(f"HTTP {r.status_code}: {r.text[:500]}")

        filename = f"ai_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.png"
        img_path = str(IMAGES_DIR / filename)
        with open(img_path, "wb") as f:
            f.write(r.content)

        print(f"✅ [ Stability BAŞARILI ] {img_path}")
        return filename
    except Exception as e:
        print(f"❌ [ Stability BAŞARISIZ ] {e}")
        return None

# === GÖRSEL ÜRETİMİ: Vertex AI (Opsiyonel Yedek) ===
def generate_image_vertexai(final_prompt):
    if not VERTEX_ENABLED:
        print("ℹ️ Vertex AI devre dışı, atlanıyor.")
        return None
    try:
        from vertexai.vision_models import ImageGenerationModel
        print("\n[ Vertex AI Imagen ] Görsel üretiliyor...")
        model = ImageGenerationModel.from_pretrained("imagegeneration@006")
        response = model.generate_images(prompt=final_prompt, number_of_images=1, aspect_ratio="16:9")
        if response.images:
            image = response.images[0]
            filename = f"ai_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.png"
            img_path = str(IMAGES_DIR / filename)
            image.save(location=img_path, include_generation_parameters=False)
            print(f"✅ [ Vertex BAŞARILI ] {img_path}")
            return filename
        else:
            raise RuntimeError("Vertex AI'dan görsel yanıt alınamadı.")
    except Exception as e:
        print(f"❌ [ Vertex BAŞARISIZ ] {e}")
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

    # 1) Fal.ai
    image_filename = generate_image_fal_flux(final_prompt)
    if image_filename:
        return image_filename

    # 2) Stability AI
    image_filename = generate_image_stability(final_prompt)
    if image_filename:
        return image_filename

    # 3) Vertex AI (opsiyonel)
    image_filename = generate_image_vertexai(final_prompt)
    if image_filename:
        return image_filename

    print("❌ Tüm görsel üretim denemeleri başarısız.")
    return None

# === 4. Blog Dosyasını Kaydet ===
def resolve_image_path(image_filename: str | None) -> str:
    if not image_filename:
        return "/blog_images/default.png"
    if image_filename.startswith("/"):
        return image_filename
    return f"/fotos/{image_filename}"


def save_blog(blog_content, lang_code, image_filename=None):
    if not blog_content:
        return
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    date_time_slug = now_utc.strftime("%Y-%m-%d-%H%M")
    # Eleventy requires a valid date string, so we store an ISO 8601 UTC timestamp.
    date_time_iso = now_utc.replace(microsecond=0).isoformat().replace("+00:00", "Z")
    slug = f"{date_time_slug}-{lang_code}-ai-news"
    path = BLOG_DIR / lang_code
    path.mkdir(exist_ok=True)
    image_path_for_blog = resolve_image_path(image_filename)
    html = f"""---
title: "AI Daily — {LANG_NAMES[lang_code]}"
date: {date_time_iso}
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
        current_time_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")  # UTC
        status_result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, check=True)
        if not status_result.stdout.strip():
            print("ℹ️ Değişiklik bulunmadığı için commit atılmadı.")
            return
        print("Değişiklikler commit ediliyor ve push ediliyor...")
        subprocess.run(["git", "config", "user.name", "Fures AI Bot"], check=True)
        subprocess.run(["git", "config", "user.email", "bot@fures.at"], check=True)
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", f"🤖 Daily AI Blog Update [auto] ({current_time_str} UTC)"], check=True)
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

    try:
        rotator = ImageRotator()
        print("\n✅ /fotos klasöründeki görseller kullanılacak.")
    except NoImagesAvailableError as exc:
        print(f"\n⚠️ {exc} Varsayılan görsel kullanılacak: default.png")
        rotator = None

    for lang_code in LANGS.keys():
        print(f"\n--- {LANG_NAMES[lang_code]} için içerik üretiliyor ---")
        blog_text = generate_single_blog(news, lang_code)
        if blog_text:
            next_image = rotator.next_for_language(lang_code) if rotator else "default.png"
            save_blog(blog_text, lang_code, next_image)
        else:
            print(f"❌ {LANG_NAMES[lang_code]} için blog metni oluşturulamadı.")

    print("\nCommitting to GitHub...")
    commit_and_push()
    print("\n✅ İşlem tamamlandı.")

if __name__ == "__main__":
    main()
