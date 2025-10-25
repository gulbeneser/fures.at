# AI Agent Guide for fures.at

## Proje Özeti
- Bu depo, fures.at ve ilgili alt sitelerin içerik üretimi, çok dilli statik site dosyaları ve otomasyon scriptlerini barındırır.
- `src/` dizini Vite + React tabanlı ön yüz ve Eleventy üretim çıktıları için yapılandırmaları içerir.
- `scripts/` dizinindeki Python betikleri RSS haberlerinden günlük blog yazıları üretir, görselleri oluşturur ve medya varlıklarını yönetir.

## Otomasyon Scriptleri
- `scripts/gemini_daily.py` haberleri toplayıp çok dilli blog yazıları ve görseller üretir. Görsel üretim sıralaması şu şekildedir:
  1. Gemini 2.5 Flash Image modeli (google.genai `Client`).
  2. OpenAI DALL·E (varsa).
  3. Fal.ai Flux Schnell API'si.
  4. Google Imagen 4.0, Replicate, Stability AI ve Vertex AI yedekleri.
- Yeni entegrasyon eklerken önce uygun API anahtarının `.env`/Netlify ayarlarında bulunduğunu kontrol et ve hataları kullanıcıya açıklayan log satırları ekle.
- Görsel üretimi başarısız olursa haber dosyaları yayınlanmamalı; en az bir sağlayıcıdan çıktı alınmadan yazıyı canlıya alma.

## Sosyal Medya Çıktıları ve Güncel Özellikler
- `scripts/gemini_daily.py` artık her yazı için `description` front-matter alanında Instagram'a uygun bir özet üretir.
- `generate_instagram_caption` fonksiyonu Gemini 2.5 Pro modeliyle 2 cümlelik kısa bir özet yazar ve `_clean_instagram_caption` yardımıyla 2.200 karakter sınırını asla aşmaz, URL ve etiketleri temizler.
- Sınır değeri `INSTAGRAM_CAPTION_LIMIT` sabitindedir; platform limitleri değişirse burayı güncelle ve temizleme fonksiyonundaki mantığı aynı tutulacak şekilde gözden geçir.
- Özetler çok dilli üretildiğinden `LANGS` sözlüğüne yeni dil eklersen, ilgili çeviriler ve Instagram özeti kısıtlarının da aynı şekilde çalıştığından emin ol.
- Oluşturulan caption'lar link eklemez; farklı sosyal ağlar için link gerekiyorsa yeni bir alan ekleyerek mantığı ayır.

## Zapier ve Sosyal Paylaşım Otomasyonları
- Blog üretim zinciri RSS çıktısını `public/feed.xml` altında günceller; Zapier "RSS by Zapier" tetikleyicisi bu feed'i 15 dakikalık
  aralıklarla dinler.
- Zapier tarafında iki ayrı aksiyon kurgusu aktif:
  - **Instagram for Business → Fotoğraf paylaşımı**: `Media` alanı RSS öğesindeki görsel URL'sinden (enclosure) gelir. Caption,
    önce makalenin başlığını (`Title: AI Daily — English` örneğinde olduğu gibi) kullanır, ardından feed'deki kısa özet metnini
    yeni satırda ekler. Zapier arayüzünde iki satırlı yapı korunmalı, "Test run" sırasında çıktı metnini gözle kontrol et ve
    karakter sınırını aşmadığına emin ol.
  - **LinkedIn → Create Share Update (Furkan Yonat profili)**: `Comment` alanı feed'den gelen "Raw Encoded" açıklamayı içerir ve
    otomatik olarak bağlantıyı da ekler. `Title`, `Content - Description`, `Content - Image URL` ve `Content - URL` alanları
    sırasıyla başlık, kısa açıklama, kapak görseli ve blog linkiyle doldurulur. `Visible To` ayarı "Anyone" olarak bırakılmalı.
    Yeni alanlar eklersen aynı kaynaktan beslenecek şekilde eşleştirmeleri güncelle.
- Otomasyon değişikliklerinde Zapier senaryosunu ("v2" sürümü) güncellediğini, test çalıştırmasının başarılı olduğunu ve hem
  `fures.at` Instagram hesabında hem de `linkedin.com/in/furkanyonat` profilinde paylaşımın beklenen formatta göründüğünü doğrula.
- Instagram paylaşımında görselin kare veya 4:5 dikey oranında olması gerekir; script'in ürettiği görsel boyutları farklıysa
  Zapier aşamasında kırpma veya yedek görsel tanımla.
- LinkedIn gönderileri için açıklama alanında URL otomatik kısaltıldığından, RSS açıklamasına ek link koyma; aksi halde gönderi
  tekrar eden bağlantılarla spam görünebilir.

## Çalışma İlkeleri
- SEO önemlidir: yeni sayfalar oluşturulduğunda `public/sitemap.xml` dosyasını gözden geçir ve gerekiyorsa yeni URL'leri ekle.
- Çok dilli içeriklerde `LANGS` ve `LANG_NAMES` sözlüklerini güncel tut; yeni dil eklerken ilgili klasör ve çeviri dosyalarını oluştur.
- API entegrasyonlarında gizli anahtarları kod içine gömme, ortam değişkenleri kullan.
- Betiklerde harici isteklere zaman aşımı (timeout) verildiğinden emin ol ve hataları yedek sağlayıcılara geçecek şekilde yakala.

## Test ve Yayın
- Python scriptleri için mümkün olduğunda yerel olarak çalıştırıp logları incele; kritik değişikliklerde `python scripts/gemini_daily.py --help` gibi komutlarla çalışırlığını doğrula.
- Frontend değişikliklerinde `npm run build` ile üretim çıktısını test et.
- PR açıklamalarında yapılan değişikliklerin SEO'ya ve otomasyon akışına etkisini belirt.

Bu dosyayı güncel tut ve yeni önemli süreçler eklendiğinde buraya belgelemeyi unutma.
