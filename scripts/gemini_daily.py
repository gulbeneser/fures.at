import os
import feedparser
import datetime
import subprocess
import shutil
import tempfile
from pathlib import Path
import requests
from urllib.parse import urlparse, parse_qs, urlunparse, urlencode
from io import BytesIO
from PIL import Image  # Pillow gerekli!

from image_rotation import ImageRotator, NoImagesAvailableError
from utils import slugify

# Metin üretimi için Gemini API
import google.generativeai as genai

try:
    from google import genai as google_genai_lib
except ImportError:  # pragma: no cover - optional dependency
    google_genai_lib = None

try:
    import replicate
except ImportError:  # pragma: no cover - optional dependency
    replicate = None

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
FOTOS_DIR = ROOT / "fotos"
BLOG_DIR.mkdir(exist_ok=True)
FOTOS_DIR.mkdir(exist_ok=True)

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

# 4) Google Imagen 4.0 (opsiyonel yedek)
GOOGLE_IMAGEN_CLIENT = None
if google_genai_lib is None:
    print("ℹ️ google.genai paketi bulunamadı, Google Imagen 4.0 atlanacak.")
else:
    try:
        GOOGLE_IMAGEN_CLIENT = google_genai_lib.Client(api_key=GEMINI_API_KEY)
        print("✅ Google Imagen 4.0 (görsel) yapılandırıldı.")
    except Exception as e:  # pragma: no cover - depends on runtime config
        GOOGLE_IMAGEN_CLIENT = None
        print(f"ℹ️ Google Imagen 4.0 başlatılamadı: {e}")

# 5) Replicate (opsiyonel yedek)
DEFAULT_REPLICATE_TOKEN = "r8_NxXwms7k489axZVAuz32iPXbjlXbRge4SRKGF"
REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN") or DEFAULT_REPLICATE_TOKEN
if REPLICATE_API_TOKEN:
    os.environ.setdefault("REPLICATE_API_TOKEN", REPLICATE_API_TOKEN)
    print("ℹ️ Replicate API anahtarı ayarlandı (varsayılan veya ortam).")
else:
    print("ℹ️ Replicate API anahtarı bulunamadı, Replicate adımı atlanabilir.")

# === 1. Haberleri Çek ===
def _clean_tracking_params(url: str) -> str:
    """Strip common tracking query parameters from a URL."""
    parsed = urlparse(url)
    if not parsed.query:
        return url

    query_params = parse_qs(parsed.query, keep_blank_values=True)
    filtered_items = []
    for key, values in query_params.items():
        if key.lower().startswith("utm_") or key.lower() in {"oc", "ved", "usg", "clid", "ei", "sa", "source"}:
            continue
        for value in values:
            filtered_items.append((key, value))

    if not filtered_items:
        return urlunparse(parsed._replace(query="", fragment=""))

    clean_query = urlencode(filtered_items)
    return urlunparse(parsed._replace(query=clean_query, fragment=""))


def _resolve_final_url(session: requests.Session, link: str) -> str:
    """Resolve Google News or redirecting links to the original article URL."""
    parsed = urlparse(link)

    # Google redirect links may include the real URL in the `url` query parameter
    if parsed.netloc.endswith("google.com") and parsed.path == "/url":
        target = parse_qs(parsed.query).get("url", [None])[0]
        if target:
            return _clean_tracking_params(target)

    # Attempt to follow redirects for news.google.com article links
    if parsed.netloc.endswith("news.google.com"):
        try:
            resp = session.get(link, allow_redirects=True, timeout=10, stream=True)
            resp.raise_for_status()
            final_url = resp.url
            resp.close()
            if final_url:
                return _clean_tracking_params(final_url)
        except requests.RequestException:
            pass

    return _clean_tracking_params(link)


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
                    final_url = _resolve_final_url(session, google_news_url)

                    source_url = None
                    source = entry.get("source")
                    if isinstance(source, dict):
                        source_url = source.get("href") or source.get("url")
                    if source_url:
                        source_url = _clean_tracking_params(source_url)

                    parsed_final = urlparse(final_url)
                    if parsed_final.netloc.endswith("news.google.com") and source_url:
                        final_url = source_url
                    elif source_url and not final_url:
                        final_url = source_url

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
def _load_image(content: bytes) -> Image.Image:
    """Load image bytes into a PIL Image instance."""

    image = Image.open(BytesIO(content))
    image.load()
    return image


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

        image = _load_image(img_resp.content)

        print("✅ [ Fal.ai BAŞARILI ] Görsel elde edildi.")
        return image
    except Exception as e:
        print(f"❌ [ Fal.ai BAŞARISIZ ] {e}")
        return None

# === GÖRSEL ÜRETİMİ: Google Imagen 4.0 (Yedek) ===
def generate_image_google_imagen(final_prompt):
    if GOOGLE_IMAGEN_CLIENT is None:
        print("ℹ️ Google Imagen 4.0 devre dışı, atlanıyor.")
        return None

    print("\n[ Google Imagen 4.0 ] Görsel üretiliyor...")
    try:
        result = GOOGLE_IMAGEN_CLIENT.models.generate_images(
            model="models/imagen-4.0-generate-001",
            prompt=final_prompt,
            config=dict(
                number_of_images=1,
                output_mime_type="image/png",
                person_generation="ALLOW_ADULT",
                aspect_ratio="16:9",
                image_size="1K",
            ),
        )

        generated_images = getattr(result, "generated_images", None) or []
        if not generated_images:
            raise ValueError("Google Imagen 4.0 yanıtı boş döndü.")

        primary = generated_images[0]
        pil_image = None

        image_bytes = getattr(primary, "image_bytes", None)
        if image_bytes:
            pil_image = _load_image(image_bytes)
        else:
            image_obj = getattr(primary, "image", None)
            if isinstance(image_obj, Image.Image):
                pil_image = image_obj
            elif hasattr(image_obj, "as_pil_image"):
                pil_image = image_obj.as_pil_image()
            elif hasattr(image_obj, "read"):
                pil_image = _load_image(image_obj.read())

        if pil_image is None:
            raise ValueError("Google Imagen 4.0 yanıtı çözümlenemedi.")

        print("✅ [ Google Imagen 4.0 BAŞARILI ] Görsel elde edildi.")
        return pil_image
    except Exception as e:
        print(f"❌ [ Google Imagen 4.0 BAŞARISIZ ] {e}")
        return None

# === GÖRSEL ÜRETİMİ: Replicate (Google/Imagen-4) ===
def generate_image_replicate(final_prompt):
    if replicate is None:
        print("ℹ️ Replicate paketi kurulu değil, atlanıyor.")
        return None
    if not REPLICATE_API_TOKEN:
        print("ℹ️ REPLICATE_API_TOKEN yok, Replicate atlanıyor.")
        return None

    print("\n[ Replicate Imagen-4 ] Görsel üretiliyor...")
    try:
        output = replicate.run(
            "google/imagen-4",
            input={
                "prompt": final_prompt,
                "aspect_ratio": "16:9",
                "safety_filter_level": "block_medium_and_above",
            },
        )

        image_bytes = None
        image_url = None

        if hasattr(output, "read"):
            image_bytes = output.read()
            if hasattr(output, "url"):
                image_url = output.url()
        elif isinstance(output, (bytes, bytearray)):
            image_bytes = bytes(output)
        elif isinstance(output, str):
            image_url = output
        elif isinstance(output, dict):
            image_url = output.get("url") or output.get("href")
        elif isinstance(output, (list, tuple)) and output:
            candidate = output[0]
            if isinstance(candidate, (bytes, bytearray)):
                image_bytes = bytes(candidate)
            elif isinstance(candidate, str):
                image_url = candidate
            elif hasattr(candidate, "read"):
                image_bytes = candidate.read()

        if image_bytes is None and image_url:
            response = requests.get(image_url, timeout=120)
            response.raise_for_status()
            image_bytes = response.content

        if not image_bytes:
            raise ValueError("Replicate API'den görsel verisi alınamadı.")

        pil_image = _load_image(image_bytes)
        print("✅ [ Replicate Imagen-4 BAŞARILI ] Görsel elde edildi.")
        return pil_image
    except Exception as e:
        print(f"❌ [ Replicate Imagen-4 BAŞARISIZ ] {e}")
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

        image = _load_image(r.content)

        print("✅ [ Stability BAŞARILI ] Görsel elde edildi.")
        return image
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
            image_bytes = getattr(image, "image_bytes", None)
            if not image_bytes:
                temp_path: Path | None = None
                with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
                    temp_path = Path(tmp_file.name)
                try:
                    image.save(location=str(temp_path), include_generation_parameters=False)
                    pil_image = _load_image(temp_path.read_bytes())
                finally:
                    if temp_path and temp_path.exists():
                        temp_path.unlink()
            else:
                pil_image = _load_image(image_bytes)
            print("✅ [ Vertex BAŞARILI ] Görsel elde edildi.")
            return pil_image
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
    image = generate_image_fal_flux(final_prompt)
    if image:
        return image

    # 2) Google Imagen 4.0
    image = generate_image_google_imagen(final_prompt)
    if image:
        return image

    # 3) Replicate (Google/Imagen-4)
    image = generate_image_replicate(final_prompt)
    if image:
        return image

    # 4) Stability AI
    image = generate_image_stability(final_prompt)
    if image:
        return image

    # 5) Vertex AI (opsiyonel)
    image = generate_image_vertexai(final_prompt)
    if image:
        return image

    print("❌ Tüm görsel üretim denemeleri başarısız.")
    return None

# === 4. Blog Dosyasını Kaydet ===
def save_blog(blog_content, lang_code, image_path_for_blog: str):
    if not blog_content:
        return None
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    date_time_slug = now_utc.strftime("%Y-%m-%d-%H%M")
    # Eleventy requires a valid date string, so we store an ISO 8601 UTC timestamp.
    date_time_iso = now_utc.replace(microsecond=0).isoformat().replace("+00:00", "Z")
    slug = f"{date_time_slug}-{lang_code}-ai-news"
    path = BLOG_DIR / lang_code
    path.mkdir(exist_ok=True)
    html = f"""---
title: "AI Daily — {LANG_NAMES[lang_code]}"
date: {date_time_iso}
image: {image_path_for_blog}
lang: {lang_code}
---
{blog_content.strip()}
"""
    post_path = path / f"{slug}.md"
    with open(post_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ Blog kaydedildi: {LANG_NAMES[lang_code]} → {slug}.md")
    return post_path

# === 5. GitHub Commit ===
def commit_and_push(paths_to_stage: list[str]):
    try:
        if not paths_to_stage:
            print("ℹ️ Commit edilecek dosya yok.")
            return
        current_time_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")  # UTC
        print("Değişiklikler commit ediliyor ve push ediliyor...")
        subprocess.run(["git", "config", "user.name", "Fures AI Bot"], check=True)
        subprocess.run(["git", "config", "user.email", "bot@fures.at"], check=True)
        subprocess.run(["git", "add", *paths_to_stage], check=True)
        diff_result = subprocess.run(["git", "diff", "--cached", "--name-only"], capture_output=True, text=True, check=True)
        if not diff_result.stdout.strip():
            print("ℹ️ Değişiklik bulunmadığı için commit atılmadı.")
            return
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
        print("\n✅ /fotos klasöründeki görseller yedek olarak hazır.")
    except NoImagesAvailableError as exc:
        print(f"\n⚠️ {exc} Varsayılan görsel kopyası oluşturulacak.")
        rotator = None

    primary_title = next((item.get("title") for item in news if item.get("title")), None)
    timestamp_part = datetime.datetime.utcnow().strftime("%Y%m%d%H%M")
    slug_source = slugify(primary_title) if primary_title else "ai-news"
    slug_source = slug_source or "ai-news"
    # Çok uzun slug'ların dosya adını aşırı uzatmaması için kısalt.
    slug_trimmed = slug_source[:60].rstrip("-") or "ai-news"
    image_slug = f"{timestamp_part}-{slug_trimmed}"
    image_filename = f"{image_slug}.jpg"
    image_relative_path = f"/fotos/{image_filename}"
    image_path = FOTOS_DIR / image_filename
    image_created = False

    prompt_seed = primary_title or "Artificial intelligence daily news"
    generated_image = generate_image(prompt_seed)
    if generated_image:
        try:
            image_path.parent.mkdir(parents=True, exist_ok=True)
            generated_image.convert("RGB").save(image_path, format="JPEG", quality=92, optimize=True)
            image_created = True
            print(f"✅ Yeni görsel kaydedildi: {image_path}")
        except Exception as save_error:
            print(f"❌ Üretilen görsel kaydedilemedi: {save_error}")

    if not image_path.exists():
        fallback_source = None
        if rotator:
            try:
                fallback_name = rotator.next_for_language("fallback")
                fallback_candidate = FOTOS_DIR / fallback_name
                if fallback_candidate.exists():
                    fallback_source = fallback_candidate
                    print(f"ℹ️ Otomatik yedek görsel seçildi: {fallback_candidate}")
            except Exception as e:
                print(f"⚠️ Yedek görsel seçilemedi: {e}")
        if fallback_source is None:
            default_source = ROOT / "public" / "images" / "fures.png"
            if default_source.exists():
                fallback_source = default_source
                print(f"ℹ️ Varsayılan görsel kullanılacak: {default_source}")
        if fallback_source and fallback_source.exists():
            try:
                image_path.parent.mkdir(parents=True, exist_ok=True)
                if fallback_source.suffix.lower() != ".jpg":
                    with Image.open(fallback_source) as image:
                        image.convert("RGB").save(image_path, format="JPEG", quality=88, optimize=True)
                else:
                    shutil.copy(fallback_source, image_path)
                image_created = True
                print(f"✅ Yedek görsel kopyalandı: {image_path}")
            except Exception as copy_error:
                print(f"❌ Yedek görsel kopyalanamadı: {copy_error}")
        else:
            print("⚠️ Hiçbir görsel bulunamadı; front-matter varsayılan kapak ile güncellenecek.")
            image_relative_path = "/images/fures.png"

    created_posts: list[Path] = []
    for lang_code in LANGS.keys():
        print(f"\n--- {LANG_NAMES[lang_code]} için içerik üretiliyor ---")
        blog_text = generate_single_blog(news, lang_code)
        if blog_text:
            post_path = save_blog(blog_text, lang_code, image_relative_path)
            if post_path:
                created_posts.append(post_path)
        else:
            print(f"❌ {LANG_NAMES[lang_code]} için blog metni oluşturulamadı.")

    paths_to_stage = [str(path.relative_to(ROOT)) for path in created_posts if path.exists()]
    if image_created and image_relative_path.startswith("/fotos/") and image_path.exists():
        paths_to_stage.append(str(image_path.relative_to(ROOT)))

    print("\nCommitting to GitHub...")
    commit_and_push(paths_to_stage)
    print("\n✅ İşlem tamamlandı.")

if __name__ == "__main__":
    main()
