bu scriptteki yapay zeka sürekli hata veriyor ve görsel üretmiyor lütfen düzeltip ver bana.  # scripts/gemini_daily.py -- CLIENT SINIFI KALDIRILMIŞ, TAMAMEN MODERN YAPIYA GEÇİLMİŞ NİHAİ VERSİYON
import os
import feedparser
import datetime
import subprocess
from pathlib import Path
import google.generativeai as genai
from google.generativeai import types
import requests
import base64
=== CONFIG ===
MODEL_TEXT = "gemini-2.5-flash"
MODEL_IMAGE = "imagen-3.0-generate-002" # Bu model adı daha stabil olabilir, dokümantasyona göre seçildi
LANGS = { "tr": "Turkish", "en": "English", "de": "German", "ru": "Russian" }
LANG_NAMES = { "tr": "Türkçe", "en": "English", "de": "Deutsch", "ru": "Русский" }
ROOT = Path(file).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
IMAGES_DIR = ROOT / "blog_images"
BLOG_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)
API anahtarını yapılandır (TEK VE DOĞRU YÖNTEM)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
raise ValueError("HATA: GEMINI_API_KEY ortam değişkeni bulunamadı veya boş!")
genai.configure(api_key=GEMINI_API_KEY)
=== 1. Haberleri Çek ===
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
return articles[:limit]
=== 2. Tek Bir Dilde Blog Metni Üret ===
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
=== 3. Görsel Üret (Modern Yöntemle Düzeltildi) ===
def generate_image(prompt_text):
final_prompt = f"Create a futuristic, abstract, and visually stunning illustration representing the concept of '{prompt_text}'. Use a dark theme with vibrant, glowing data lines. Minimalistic and elegant."
print(f"Görsel prompt'u oluşturuluyor: {final_prompt}")
try:
# Görsel üretimi için de GenerativeModel kullanılır
image_model = genai.GenerativeModel(MODEL_IMAGE)
response = image_model.generate_content(
final_prompt,
generation_config={"response_mime_type": "image/png"}
)
if response.parts:
image_bytes = response.parts[0].inline_data.data
filename = f"ai_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
img_path = IMAGES_DIR / filename
with open(img_path, "wb") as f:
f.write(image_bytes)
print(f"✅ Görsel başarıyla kaydedildi: {filename}")
return filename
else:
print("❌ Görsel üretilemedi, API'den boş yanıt geldi.")
return None
except Exception as e:
print(f"❌ Görsel üretimi sırasında hata oluştu: {e}")
return None
=== 4. Blog Dosyasını Kaydet ===
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
{blog_content.strip()}
"""
with open(path / f"{slug}.md", "w", encoding="utf-8") as f:
f.write(html)
print(f"✅ Blog kaydedildi: {LANG_NAMES[lang_code]} → {slug}.md")
=== 5. GitHub Commit ===
def commit_and_push():
subprocess.run(["git", "config", "user.name", "Fures AI Bot"])
subprocess.run(["git", "config", "user.email", "bot@fures.at"])
status_result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
if not status_result.stdout.strip(): return
subprocess.run(["git", "add", "."])
subprocess.run(["git", "commit", "-m", "🤖 Daily AI Blog Update [auto]"])
subprocess.run(["git", "push"])
print("🚀 Blog başarıyla GitHub'a gönderildi.")
=== MAIN ===
def main():
print("Fetching latest AI news...")
news = fetch_ai_news()
if not news: return
code
Code
print("\nGenerating image...")
image_prompt = news[0]['title']
image_filename = generate_image(image_prompt)

for lang_code in LANGS.keys():
    print(f"\n--- {LANG_NAMES[lang_code]} için içerik üretiliyor ---")
    blog_text = generate_single_blog(news, lang_code)
    save_blog(blog_text, lang_code, image_filename)
    
print("\nCommitting to GitHub...")
commit_and_push()
print("\n✅ İşlem tamamlandı.")
if name == "main":
main()        hata usr/bin/git config --local --name-only --get-regexp http.https://github.com/.extraheader
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http.https://github.com/.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
Fetching the repository
/usr/bin/git -c protocol.version=2 fetch --prune --no-recurse-submodules origin +refs/heads/:refs/remotes/origin/ +refs/tags/:refs/tags/
From https://github.com/gulbeneser/fures.at
[new branch]      codex/add-blur-and-glass-effect-to-header -> origin/codex/add-blur-and-glass-effect-to-header
[new branch]      codex/add-faqpage-json-ld-structure -> origin/codex/add-faqpage-json-ld-structure
[new branch]      codex/add-localbusiness-json-ld-schema -> origin/codex/add-localbusiness-json-ld-schema
[new branch]      codex/add-seo-keywords-for-turkish-and-english -> origin/codex/add-seo-keywords-for-turkish-and-english
[new branch]      codex/add-translation-keys-for-hero-and-quote-components -> origin/codex/add-translation-keys-for-hero-and-quote-components
[new branch]      codex/add-translations-and-update-projects-component -> origin/codex/add-translations-and-update-projects-component
[new branch]      codex/analyze-and-fix-project-links -> origin/codex/analyze-and-fix-project-links
[new branch]      codex/analyze-and-fix-project-links-85qs85 -> origin/codex/analyze-and-fix-project-links-85qs85
[new branch]      codex/analyze-and-fix-project-links-hg00q2 -> origin/codex/analyze-and-fix-project-links-hg00q2
[new branch]      codex/analyze-and-fix-project-links-j7uwlr -> origin/codex/analyze-and-fix-project-links-j7uwlr
[new branch]      codex/analyze-and-fix-project-links-reyd7v -> origin/codex/analyze-and-fix-project-links-reyd7v
[new branch]      codex/build-figma-design-for-netlify -> origin/codex/build-figma-design-for-netlify
[new branch]      codex/change-color-palette-to-provided-design -> origin/codex/change-color-palette-to-provided-design
[new branch]      codex/create-daily-rss-feed-for-blog -> origin/codex/create-daily-rss-feed-for-blog
[new branch]      codex/create-multilingual-blog-with-eleventy-and-netlify -> origin/codex/create-multilingual-blog-with-eleventy-and-netlify
[new branch]      codex/create-multilingual-blog-with-eleventy-and-netlify-36xgzj -> origin/codex/create-multilingual-blog-with-eleventy-and-netlify-36xgzj
[new branch]      codex/duzelt-mobildeki-chat-penceresi-boyutu -> origin/codex/duzelt-mobildeki-chat-penceresi-boyutu
[new branch]      codex/eski-bloklar-kaldrma -> origin/codex/eski-bloklar-kaldrma
[new branch]      codex/find-location-of-generated-blog-posts -> origin/codex/find-location-of-generated-blog-posts
[new branch]      codex/find-location-of-generated-blog-posts-fzrh01 -> origin/codex/find-location-of-generated-blog-posts-fzrh01
[new branch]      codex/fix-blog-image-visibility-and-open-graph-tags -> origin/codex/fix-blog-image-visibility-and-open-graph-tags
[new branch]      codex/fix-kvkk-compliance-issues-and-navigation-errors -> origin/codex/fix-kvkk-compliance-issues-and-navigation-errors
[new branch]      codex/fix-navigation-and-design-issues -> origin/codex/fix-navigation-and-design-issues
[new branch]      codex/fix-navigation-to-subpages-on-fures.at -> origin/codex/fix-navigation-to-subpages-on-fures.at
[new branch]      codex/fix-navigation-to-subpages-on-fures.at-mufhlk -> origin/codex/fix-navigation-to-subpages-on-fures.at-mufhlk
[new branch]      codex/fix-syntax-error-in-script -> origin/codex/fix-syntax-error-in-script
[new branch]      codex/integrate-gemini-chatbot-site-wide -> origin/codex/integrate-gemini-chatbot-site-wide
[new branch]      codex/localize-hero-and-project-content -> origin/codex/localize-hero-and-project-content
[new branch]      codex/modify-rss-feed-content-format -> origin/codex/modify-rss-feed-content-format
[new branch]      codex/optimize-seo-for-cyprus-web-presence -> origin/codex/optimize-seo-for-cyprus-web-presence
[new branch]      codex/remove-old-rss-and-update-english-feed -> origin/codex/remove-old-rss-and-update-english-feed
[new branch]      codex/remove-orange-yellow-rectangle-element -> origin/codex/remove-orange-yellow-rectangle-element
[new branch]      codex/remove-visible-hero-text-styles -> origin/codex/remove-visible-hero-text-styles
[new branch]      codex/setup-automated-ai-news-blog -> origin/codex/setup-automated-ai-news-blog
[new branch]      codex/strip-html-from-content-encoded -> origin/codex/strip-html-from-content-encoded
[new branch]      codex/update-fures-logo-in-header -> origin/codex/update-fures-logo-in-header
[new branch]      codex/update-language-metadata-and-hreflang-values -> origin/codex/update-language-metadata-and-hreflang-values
[new branch]      codex/update-phone-number-across-system -> origin/codex/update-phone-number-across-system
[new branch]      codex/update-rss-feed-for-english-posts -> origin/codex/update-rss-feed-for-english-posts
[new branch]      codex/uygula-mukemmel-likid-tasarm-header-a -> origin/codex/uygula-mukemmel-likid-tasarm-header-a
[new branch]      codex/yumusat-tasarm-ve-efektleri -> origin/codex/yumusat-tasarm-ve-efektleri
[new branch]      main       -> origin/main
/usr/bin/git branch --list --remote origin/main
origin/main
/usr/bin/git rev-parse refs/remotes/origin/main
6f161a521f4b08cc8048c9fabdfee898fd212027
Determining the checkout info
/usr/bin/git sparse-checkout disable
/usr/bin/git config --local --unset-all extensions.worktreeConfig
Checking out the ref
/usr/bin/git log -1 --format=%H
6f161a521f4b08cc8048c9fabdfee898fd212027
0s
Run actions/setup-python@v5
Installed versions
17s
Run python -m pip install --upgrade pip
Requirement already satisfied: pip in /opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages (25.2)
Collecting google-generativeai (from -r requirements.txt (line 1))
Downloading google_generativeai-0.8.5-py3-none-any.whl.metadata (3.9 kB)
Collecting feedparser (from -r requirements.txt (line 2))
Downloading feedparser-6.0.12-py3-none-any.whl.metadata (2.7 kB)
Collecting PyYAML (from -r requirements.txt (line 3))
Downloading pyyaml-6.0.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (2.4 kB)
Collecting python-dateutil (from -r requirements.txt (line 4))
Downloading python_dateutil-2.9.0.post0-py2.py3-none-any.whl.metadata (8.4 kB)
Collecting requests (from -r requirements.txt (line 5))
Downloading requests-2.32.5-py3-none-any.whl.metadata (4.9 kB)
Collecting google-ai-generativelanguage==0.6.15 (from google-generativeai->-r requirements.txt (line 1))
Downloading google_ai_generativelanguage-0.6.15-py3-none-any.whl.metadata (5.7 kB)
Collecting google-api-core (from google-generativeai->-r requirements.txt (line 1))
Downloading google_api_core-2.26.0-py3-none-any.whl.metadata (3.2 kB)
Collecting google-api-python-client (from google-generativeai->-r requirements.txt (line 1))
Downloading google_api_python_client-2.184.0-py3-none-any.whl.metadata (7.0 kB)
Collecting google-auth>=2.15.0 (from google-generativeai->-r requirements.txt (line 1))
Downloading google_auth-2.41.1-py2.py3-none-any.whl.metadata (6.6 kB)
Collecting protobuf (from google-generativeai->-r requirements.txt (line 1))
Downloading protobuf-6.32.1-cp39-abi3-manylinux2014_x86_64.whl.metadata (593 bytes)
Collecting pydantic (from google-generativeai->-r requirements.txt (line 1))
Downloading pydantic-2.12.0-py3-none-any.whl.metadata (83 kB)
Collecting tqdm (from google-generativeai->-r requirements.txt (line 1))
Downloading tqdm-4.67.1-py3-none-any.whl.metadata (57 kB)
Collecting typing-extensions (from google-generativeai->-r requirements.txt (line 1))
Downloading typing_extensions-4.15.0-py3-none-any.whl.metadata (3.3 kB)
Collecting proto-plus<2.0.0dev,>=1.22.3 (from google-ai-generativelanguage==0.6.15->google-generativeai->-r requirements.txt (line 1))
Downloading proto_plus-1.26.1-py3-none-any.whl.metadata (2.2 kB)
Collecting protobuf (from google-generativeai->-r requirements.txt (line 1))
Downloading protobuf-5.29.5-cp38-abi3-manylinux2014_x86_64.whl.metadata (592 bytes)
Collecting googleapis-common-protos<2.0.0,>=1.56.2 (from google-api-core->google-generativeai->-r requirements.txt (line 1))
Downloading googleapis_common_protos-1.70.0-py3-none-any.whl.metadata (9.3 kB)
Collecting charset_normalizer<4,>=2 (from requests->-r requirements.txt (line 5))
Downloading charset_normalizer-3.4.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (36 kB)
Collecting idna<4,>=2.5 (from requests->-r requirements.txt (line 5))
Downloading idna-3.11-py3-none-any.whl.metadata (8.4 kB)
Collecting urllib3<3,>=1.21.1 (from requests->-r requirements.txt (line 5))
Downloading urllib3-2.5.0-py3-none-any.whl.metadata (6.5 kB)
Collecting certifi>=2017.4.17 (from requests->-r requirements.txt (line 5))
Downloading certifi-2025.10.5-py3-none-any.whl.metadata (2.5 kB)
Collecting grpcio<2.0.0,>=1.33.2 (from google-api-core[grpc]!=2.0.,!=2.1.,!=2.10.,!=2.2.,!=2.3.,!=2.4.,!=2.5.,!=2.6.,!=2.7.,!=2.8.,!=2.9.,<3.0.0dev,>=1.34.1->google-ai-generativelanguage==0.6.15->google-generativeai->-r requirements.txt (line 1))
Downloading grpcio-1.75.1-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl.metadata (3.7 kB)
Collecting grpcio-status<2.0.0,>=1.33.2 (from google-api-core[grpc]!=2.0.,!=2.1.,!=2.10.,!=2.2.,!=2.3.,!=2.4.,!=2.5.,!=2.6.,!=2.7.,!=2.8.,!=2.9.,<3.0.0dev,>=1.34.1->google-ai-generativelanguage==0.6.15->google-generativeai->-r requirements.txt (line 1))
Downloading grpcio_status-1.75.1-py3-none-any.whl.metadata (1.1 kB)
Collecting cachetools<7.0,>=2.0.0 (from google-auth>=2.15.0->google-generativeai->-r requirements.txt (line 1))
Downloading cachetools-6.2.1-py3-none-any.whl.metadata (5.5 kB)
Collecting pyasn1-modules>=0.2.1 (from google-auth>=2.15.0->google-generativeai->-r requirements.txt (line 1))
Downloading pyasn1_modules-0.4.2-py3-none-any.whl.metadata (3.5 kB)
Collecting rsa<5,>=3.1.4 (from google-auth>=2.15.0->google-generativeai->-r requirements.txt (line 1))
Downloading rsa-4.9.1-py3-none-any.whl.metadata (5.6 kB)
INFO: pip is looking at multiple versions of grpcio-status to determine which version is compatible with other requirements. This could take a while.
Collecting grpcio-status<2.0.0,>=1.33.2 (from google-api-core[grpc]!=2.0.,!=2.1.,!=2.10.,!=2.2.,!=2.3.,!=2.4.,!=2.5.,!=2.6.,!=2.7.,!=2.8.,!=2.9.*,<3.0.0dev,>=1.34.1->google-ai-generativelanguage==0.6.15->google-generativeai->-r requirements.txt (line 1))
Downloading grpcio_status-1.75.0-py3-none-any.whl.metadata (1.1 kB)
Downloading grpcio_status-1.74.0-py3-none-any.whl.metadata (1.1 kB)
Downloading grpcio_status-1.73.1-py3-none-any.whl.metadata (1.1 kB)
Downloading grpcio_status-1.73.0-py3-none-any.whl.metadata (1.1 kB)
Downloading grpcio_status-1.72.2-py3-none-any.whl.metadata (1.1 kB)
Downloading grpcio_status-1.72.1-py3-none-any.whl.metadata (1.1 kB)
Downloading grpcio_status-1.71.2-py3-none-any.whl.metadata (1.1 kB)
Collecting pyasn1>=0.1.3 (from rsa<5,>=3.1.4->google-auth>=2.15.0->google-generativeai->-r requirements.txt (line 1))
Downloading pyasn1-0.6.1-py3-none-any.whl.metadata (8.4 kB)
Collecting sgmllib3k (from feedparser->-r requirements.txt (line 2))
Downloading sgmllib3k-1.0.0.tar.gz (5.8 kB)
Installing build dependencies: started
Installing build dependencies: finished with status 'done'
Getting requirements to build wheel: started
Getting requirements to build wheel: finished with status 'done'
Preparing metadata (pyproject.toml): started
Preparing metadata (pyproject.toml): finished with status 'done'
Collecting six>=1.5 (from python-dateutil->-r requirements.txt (line 4))
Downloading six-1.17.0-py2.py3-none-any.whl.metadata (1.7 kB)
Collecting httplib2<1.0.0,>=0.19.0 (from google-api-python-client->google-generativeai->-r requirements.txt (line 1))
Downloading httplib2-0.31.0-py3-none-any.whl.metadata (2.2 kB)
Collecting google-auth-httplib2<1.0.0,>=0.2.0 (from google-api-python-client->google-generativeai->-r requirements.txt (line 1))
Downloading google_auth_httplib2-0.2.0-py2.py3-none-any.whl.metadata (2.2 kB)
Collecting uritemplate<5,>=3.0.1 (from google-api-python-client->google-generativeai->-r requirements.txt (line 1))
Downloading uritemplate-4.2.0-py3-none-any.whl.metadata (2.6 kB)
Collecting pyparsing<4,>=3.0.4 (from httplib2<1.0.0,>=0.19.0->google-api-python-client->google-generativeai->-r requirements.txt (line 1))
Downloading pyparsing-3.2.5-py3-none-any.whl.metadata (5.0 kB)
Collecting annotated-types>=0.6.0 (from pydantic->google-generativeai->-r requirements.txt (line 1))
Downloading annotated_types-0.7.0-py3-none-any.whl.metadata (15 kB)
Collecting pydantic-core==2.41.1 (from pydantic->google-generativeai->-r requirements.txt (line 1))
Downloading pydantic_core-2.41.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (7.3 kB)
Collecting typing-inspection>=0.4.2 (from pydantic->google-generativeai->-r requirements.txt (line 1))
Downloading typing_inspection-0.4.2-py3-none-any.whl.metadata (2.6 kB)
Downloading google_generativeai-0.8.5-py3-none-any.whl (155 kB)
Downloading google_ai_generativelanguage-0.6.15-py3-none-any.whl (1.3 MB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.3/1.3 MB 19.7 MB/s  0:00:00
Downloading google_api_core-2.26.0-py3-none-any.whl (162 kB)
Downloading requests-2.32.5-py3-none-any.whl (64 kB)
Downloading charset_normalizer-3.4.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (150 kB)
Downloading google_auth-2.41.1-py2.py3-none-any.whl (221 kB)
Downloading cachetools-6.2.1-py3-none-any.whl (11 kB)
Downloading googleapis_common_protos-1.70.0-py3-none-any.whl (294 kB)
Downloading grpcio-1.75.1-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl (6.5 MB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 6.5/6.5 MB 89.6 MB/s  0:00:00
Downloading grpcio_status-1.71.2-py3-none-any.whl (14 kB)
Downloading idna-3.11-py3-none-any.whl (71 kB)
Downloading proto_plus-1.26.1-py3-none-any.whl (50 kB)
Downloading protobuf-5.29.5-cp38-abi3-manylinux2014_x86_64.whl (319 kB)
Downloading rsa-4.9.1-py3-none-any.whl (34 kB)
Downloading typing_extensions-4.15.0-py3-none-any.whl (44 kB)
Downloading urllib3-2.5.0-py3-none-any.whl (129 kB)
Downloading feedparser-6.0.12-py3-none-any.whl (81 kB)
Downloading pyyaml-6.0.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (806 kB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 806.6/806.6 kB 129.3 MB/s  0:00:00
Downloading python_dateutil-2.9.0.post0-py2.py3-none-any.whl (229 kB)
Downloading certifi-2025.10.5-py3-none-any.whl (163 kB)
Downloading pyasn1-0.6.1-py3-none-any.whl (83 kB)
Downloading pyasn1_modules-0.4.2-py3-none-any.whl (181 kB)
Downloading six-1.17.0-py2.py3-none-any.whl (11 kB)
Downloading google_api_python_client-2.184.0-py3-none-any.whl (14.3 MB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 14.3/14.3 MB 100.8 MB/s  0:00:00
Downloading google_auth_httplib2-0.2.0-py2.py3-none-any.whl (9.3 kB)
Downloading httplib2-0.31.0-py3-none-any.whl (91 kB)
Downloading pyparsing-3.2.5-py3-none-any.whl (113 kB)
Downloading uritemplate-4.2.0-py3-none-any.whl (11 kB)
Downloading pydantic-2.12.0-py3-none-any.whl (459 kB)
Downloading pydantic_core-2.41.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (2.1 MB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2.1/2.1 MB 171.9 MB/s  0:00:00
Downloading annotated_types-0.7.0-py3-none-any.whl (13 kB)
Downloading typing_inspection-0.4.2-py3-none-any.whl (14 kB)
Downloading tqdm-4.67.1-py3-none-any.whl (78 kB)
Building wheels for collected packages: sgmllib3k
Building wheel for sgmllib3k (pyproject.toml): started
Building wheel for sgmllib3k (pyproject.toml): finished with status 'done'
Created wheel for sgmllib3k: filename=sgmllib3k-1.0.0-py3-none-any.whl size=6089 sha256=003278b0cd7d5cf896bf11fafeb91918a62a2ce7111f4d7a376a8b5e8370af5e
Stored in directory: /home/runner/.cache/pip/wheels/3b/25/2a/105d6a15df6914f4d15047691c6c28f9052cc1173e40285d03
Successfully built sgmllib3k
Installing collected packages: sgmllib3k, urllib3, uritemplate, typing-extensions, tqdm, six, PyYAML, pyparsing, pyasn1, protobuf, idna, feedparser, charset_normalizer, certifi, cachetools, annotated-types, typing-inspection, rsa, requests, python-dateutil, pydantic-core, pyasn1-modules, proto-plus, httplib2, grpcio, googleapis-common-protos, pydantic, grpcio-status, google-auth, google-auth-httplib2, google-api-core, google-api-python-client, google-ai-generativelanguage, google-generativeai
Successfully installed PyYAML-6.0.3 annotated-types-0.7.0 cachetools-6.2.1 certifi-2025.10.5 charset_normalizer-3.4.3 feedparser-6.0.12 google-ai-generativelanguage-0.6.15 google-api-core-2.26.0 google-api-python-client-2.184.0 google-auth-2.41.1 google-auth-httplib2-0.2.0 google-generativeai-0.8.5 googleapis-common-protos-1.70.0 grpcio-1.75.1 grpcio-status-1.71.2 httplib2-0.31.0 idna-3.11 proto-plus-1.26.1 protobuf-5.29.5 pyasn1-0.6.1 pyasn1-modules-0.4.2 pydantic-2.12.0 pydantic-core-2.41.1 pyparsing-3.2.5 python-dateutil-2.9.0.post0 requests-2.32.5 rsa-4.9.1 sgmllib3k-1.0.0 six-1.17.0 tqdm-4.67.1 typing-extensions-4.15.0 typing-inspection-0.4.2 uritemplate-4.2.0 urllib3-2.5.0
2m 19s
Run python scripts/gemini_daily.py
WARNING: All log messages before absl::InitializeLog() is called are written to STDERR
E0000 00:00:1760338632.775059    1998 alts_credentials.cc:93] ALTS creds ignored. Not running on GCP and untrusted ALTS is not enabled.
[main 2df483f] 🤖 Daily AI Blog Update [auto]
4 files changed, 86 insertions(+), 28 deletions(-)
create mode 100644 blog/de/2025-10-13-de-ai-news.md
create mode 100644 blog/ru/2025-10-13-ru-ai-news.md
To https://github.com/gulbeneser/fures.at
6f161a5..2df483f  main -> main
Fetching latest AI news...
Generating image...
Görsel prompt'u oluşturuluyor: Create a futuristic, abstract, and visually stunning illustration representing the concept of 'AI Breakthrough Finally Cracks Century-Old Physics Problem - SciTechDaily'. Use a dark theme with vibrant, glowing data lines. Minimalistic and elegant.
❌ Görsel üretimi sırasında hata oluştu: 400 * GenerateContentRequest.generation_config.response_mime_type: allowed mimetypes are text/plain, application/json, application/xml, application/yaml and text/x.enum.
--- Türkçe için içerik üretiliyor ---
✅ Blog kaydedildi: Türkçe → 2025-10-13-tr-ai-news.md
--- English için içerik üretiliyor ---
✅ Blog kaydedildi: English → 2025-10-13-en-ai-news.md
--- Deutsch için içerik üretiliyor ---
✅ Blog kaydedildi: Deutsch → 2025-10-13-de-ai-news.md
--- Русский için içerik üretiliyor ---
✅ Blog kaydedildi: Русский → 2025-10-13-ru-ai-news.md
Committing to GitHub...
🚀 Blog başarıyla GitHub'a gönderildi.
✅ İşlem tamamlandı.
0s
Post job cleanup.
0s
Post job cleanup.
/usr/bin/git version
git version 2.51.0
Temporarily overriding HOME='/home/runner/work/_temp/c72b614c-0d8b-4d16-a6bc-dc42dba2be38' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/fures.at/fures.at
/usr/bin/git config --local --name-only --get-regexp core.sshCommand
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
/usr/bin/git config --local --name-only --get-regexp http.https://github.com/.extraheader
http.https://github.com/.extraheader
/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http.https://github.com/.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
