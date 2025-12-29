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

## Kampanya Otomasyonu ve RSS2
- `scripts/gemini_daily.py` blog üretimine ek olarak her çalıştırıldığında Türkçe kampanya kiti üretir ve çıktıyı `kampanyalar/tr/`
  altına Markdown olarak yazar. Görseller `/fotos/campaigns/` altında tutulur ve 4:5 oranında üretilir.
- Kampanya içeriği `generate_campaign_payload` → `build_campaign_markdown` → `save_campaign` akışında oluşur. JSON şemasını
  değiştirirsen `src/utils/campaigns.ts`, `CampaignListPage`, `CampaignPostPage` ve `src/_data/campaignPosts.js` dosyalarını da
  güncelle.
- Yeni RSS feed’i `src/rss2.xml.njk` içinde tanımlıdır ve `campaignPosts.turkish` verisini kullanır. Zapier tarafında
  `https://fures.at/rss2.xml` adresini dinleyerek LinkedIn/Instagram kampanya otomasyonlarını tetikle.
- Kampanya sayfaları `/kampanyalar` ve `/kampanyalar/:slug` rotalarında hizmet verir; navigasyon ve footer bağlantıları eklendi.
  İçerik sadece Türkçe üretildiğinden diğer dillerde boş liste mesajları gösterilir.

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

## `projects/` Dizini Kılavuzu
`projects/` altındaki her klasör tek sayfalık statik bir tanıtım veya vaka incelemesi barındırır. Dosyalar halihazırda optimize edilmiş HTML olarak tutulur; harici derleme sürecine gerek yoktur. İçerik güncellerken aşağıdaki prensiplere uy:

- **SEO Perfect:** Başlıklar, açıklamalar ve CTA metinlerinin anahtar kelime yoğunluğu korunmalı; yeni bölümler eklerken `h2`/`h3` hiyerarşisine sadık kal.
- **Vaka tutarlılığı:** Her sayfa belirli bir etkinlik ya da ürünü anlatır. Metinleri değiştirirken tarihleri, başarı metriklerini ve hikâye akışını koru; gerekirse yeni rakamlar için kaynak belirt.
- **Görsel gövde**: Sayfalar çoğunlukla metinsel olsa da, `<img>` veya görsel yer tutucular eklenirken dosyaları `public/images/projects/<slug>/` altına koy ve göreli URL kullan.
- **CTA bağlantıları:** Var olan `Mehr erfahren`, `Launch the Planner`, `Platformu Ziyaret Et` gibi bağlantılar doğru hedef URL'ye işaret etmeli. Yeni sayfalara link veriyorsan sitemap'i güncelle.

### Abschluss – NEU Mezuniyet Deneyimi
- **Amaç:** Near East University MOE Open Air Stage'de düzenlenen mezuniyet günlerinin organizasyonunu ve etkisini anlatır.
- **İçerik Yapısı:** "Erster Tag der Abschlussfeier" ve takip eden günler için istatistikler, lojistik detaylar ve sahne planları bulunur. CTA `Mehr erfahren` bağlantısını güncel program PDF'ine yönlendir.
- **Güncelleme İpuçları:** Öğrenci sayıları veya VIP listeleri değiştiğinde, ilgili paragrafları aratarak (örn. "960 Absolventen") edit et. Her paragraf tek satıra sıkıştırıldığından düzenleme sırasında satır kırmaları ekleyip sonra tekrar minimize edebilirsin.

### Gymnastik – "Republik bist du" Gösterisi
- **Amaç:** Moe Open Air Arena'da gerçekleşen jimnastik galasını ve sponsor katkılarını öne çıkarır.
- **İçerik Yapısı:** Açılış paragrafı etkinliği özetler, ardından program akışı, katılımcı profilleri ve logistik plan anlatılır.
- **Güncelleme İpuçları:** Tarih veya mekan değişirse başlıktaki ve giriş paragrafındaki bilgileri birlikte güncelle. Seyirci sayılarını değiştirirken tüm metin boyunca aynı rakamı koru.

### aboutcyprus – AI Tatil Planlayıcısı
- **Amaç:** Gemini + Google Maps entegrasyonu ile çalışan Kıbrıs odaklı yapay zeka tur planlayıcısını tanıtır.
- **İçerik Yapısı:** `Experience Highlights`, `Visual Snapshot`, `Gemini-Orchestrated Travel Intelligence` ve `Implementation Stack` başlıklarıyla teknik ve kullanıcı faydalarını anlatır. Üstteki CTA "Launch the Planner" canlı demoya gider.
- **Güncelleme İpuçları:** Yeni API entegrasyonları eklerken ilgili başlık altında madde listesi kullan. Demo URL'si değişirse `<a href="/travel">` bağlantısını yeni konuma taşı.
- **Kod Yapısı & Kaynaklar:** `/aboutcyprus/index.html` Vite çıktısını yükler ve tüm işlevselliği hash'lenmiş modüller içeren `/aboutcyprus/assets/` klasöründen çeker; bu paket, React + Zustand tabanlı seyahat planlayıcısının üretim build'idir ve kaynak kodu aktif olarak `/travel/` projesinde tutulur. `/travel/index.tsx` ve `App.tsx` uygulamanın kök bileşenlerini tanımlar, `hooks/use-live-api.ts` Gemini Live bağlantısını yönetir, `lib/tools/*` ise fonksiyon çağrısı araçlarını sağlar.
- **Dağıtım Süreci:** Planner'ı güncellerken `cd travel && npm install && npm run build` komutuyla `dist/` üret; çıkan HTML/CSS/JS dosyalarını `/aboutcyprus/` altındaki karşılık gelen dosyalarla değiştir. Netlify yönlendirmeleri `/public/_redirects` dosyasındaki `/aboutcyprus` kurallarını kullanır, bu yüzden dosya yollarını koru.
- **Bakım Notları:** Build içinde ortam değişkenleri inline tutulmaz; anahtar çözümlemesi `travel/lib/env.ts` üzerinden yapılır. Yeni API anahtarlarını yalnızca dağıtım ortamı değişkenlerinde güncelle, ardından build al. Planner'da kullanılan `MapController` ve `AudioStreamer` gibi sınıflar, güncel `travel` koduyla uyumlu olmalıdır; farklı versiyonlar karışırsa hashed varlıklar kırılabilir.

### ankem – Uluslararası Kongre Yönetimi
- **Amaç:** Dorana Turizm'in 40. ANKEM Kongresi tecrübesini ve Furkan Yonat'ın rolünü belgelemek.
- **İçerik Yapısı:** Açılışta etkinliğin kapsamı, ardından lojistik operasyonlar, ekip koordinasyonu ve sonuç raporu detaylandırılır.
- **Güncelleme İpuçları:** Kongre yılı, tema veya katılımcı sayısı güncellenecekse metindeki tüm referansları aynı anda değiştir. `Koordinator: Furkan Yonat` satırı korunmalı.

### desam – DESAM Biyoteknoloji Kongresi
- **Amaç:** NEU DESAM'ın biyoteknoloji kongresi için operasyon planını sunar.
- **İçerik Yapısı:** Kongre tarihleri, konuşmacı profilleri, sponsor listesi ve bilimsel oturum akışı bulunur.
- **Güncelleme İpuçları:** Programda yeni oturum eklerken kronolojik sıralamayı koru. `Mehr erfahren` bağlantısını resmi kayıt formuna yönlendir.

### drift – Drift Turizmi Projesi
- **Amaç:** Drift NEU Racing School ile yürütülen turizm projesini ve beklenen ekonomik katkıyı anlatır.
- **İçerik Yapısı:** Proje vizyonu, hedef kitle segmentleri, güvenlik protokolleri ve iş ortakları listesi yer alır.
- **Güncelleme İpuçları:** Yeni partner eklersen ilgili bölümde listeye dahil edip SEO için anahtar kelimeleri ("Drift", "Nordzypern") koru.

### hotel – Otel & Acenta Entegrasyonu
- **Amaç:** Near East Hotels portföyünün dijital dönüşüm yol haritasını paylaşır.
- **İçerik Yapısı:** Genel hedefler, modüler entegrasyon adımları (PMS, CRM, kanal yönetimi), başarı metrikleri ve ekip organizasyonu öne çıkar.
- **Güncelleme İpuçları:** Tablo benzeri bloklar tek satırda tutulur; düzenlemeden önce kod editöründe otomatik satır sonları ekleyip ardından tekrar sıkıştır. CTA'lar (örn. `Lebenslauf`) doğru dosyalara işaret etmeli.

### icalt – ICALT 2024 Konferansı
- **Amaç:** ICALT 2024 organizasyonunun hikâyesini, akademik çıktıları ve Dorana Turizm lojistiklerini belgelemek.
- **İçerik Yapısı:** "ICALT 2024: Ein Überblick" girişinden sonra konuk profilleri, etkinlik takvimi, yan etkinlikler ve medya yansımaları gelir.
- **Güncelleme İpuçları:** Yeni oturum eklerken tarih formatını (17.–20. Oktober) koru ve ilgili meta etiketlerde `noindex`/`nofollow` gereksinimini değiştirme.

### kariyer – Fures Kariyer Koçu
- **Amaç:** Yapay zeka tabanlı kariyer koçluğu platformunun özelliklerini tanıtmak.
- **İçerik Yapısı:** `Fures Kariyer Koçu Hakkında`, `Neler Sunuyor?`, `Proje Vizyonumuz` başlıkları altında hizmet modülleri (CV analizi, mülakat simülasyonu) anlatılır. `Platformu Ziyaret Et` bağlantısı canlı ürüne gider.
- **Güncelleme İpuçları:** Yeni özellik eklerken madde işaretlerini `<li>` yapısında tut. Kullanıcı kazanım metriklerini güncellediğinde hem metin hem olası veri kartlarını eşleştir.
- **Kod Yapısı & Modüller:** `/kariyer/App.tsx` uygulamanın kontrol merkezidir; `LanguageContext` çok dilli çeviri katmanını sağlar, `FileUploader` metin/PDF/HTML/görsel yükleyip `services/geminiService.ts` üzerinden Gemini 2.5 API'lerine gönderir, `CVEditor` & `CVPreview` kullanıcı akışını yönetir. Yardımcı fonksiyonlar `utils/fileUtils.ts` (PDF metin çıkarımı, görüntü sıkıştırma) ve `utils/exportUtils.ts` (PDF/JSON dışa aktarım) dosyalarındadır. Şema türleri `types.ts` altında tutulur, çok dilli içerik `translations.ts` dosyasında toplanır.
- **API ve Ortam Yönetimi:** `services/geminiService.ts` çoklu `process.env` anahtarını destekler; Netlify'da `API_KEY` veya `GEMINI_API_KEY` tanımlı değilse uygulama yalnızca sınırlı modda çalışır. Fotoğraf iyileştirme `gemini-2.5-flash-image`, metin analizleri `gemini-2.5-flash` modellerini kullanır; kota hatalarında kullanıcıya anlamlı mesajlar göster.
- **Kritik Akışlar:** `FileUploader` yüklenen dosya türüne göre ilgili çıkarım fonksiyonunu seçer, 10MB üstü dosyaları reddeder ve akışı `setView('editor')` ile düzenler; `InterviewSimulatorModal` ve `ApplicationAssistantModal` modalları seçilen `Tool` tipine göre `geminiService` çağrıları yapar. Bu akışlar arasında durum paylaşımı `useState` ile sağlanır; yeni özellik eklerken `View` ve `Tool` birleşimlerini genişletmeyi unutma.
- **Bakım Notları:** Test sırasında `npm install && npm run dev` komutlarıyla lokal sunucu aç; `metadata.json` site haritası için JSON-LD üretir, güncelleme yaparken SEO alanlarını doldur. Üretim build'i `npm run build` ile oluşturulur ve çıktı `dist/` klasöründen Netlify'ya alınır.

### moe – Moe Open-Air Bühne
- **Amaç:** Moe Open-Air Stage kültür platformunun vizyonunu ve sezonluk programını duyurmak.
- **İçerik Yapısı:** Açılış bölümünde genel vizyon, ardından etkinlik türleri, kapasite detayları ve iş birliği çağrıları var.
- **Güncelleme İpuçları:** Yeni etkinlik tarihleri eklerken kronolojik sıralama ve mevsimsel alt başlıkları koru. `Mehr Erfahren` bağlantıları varsa güncelle.

### serakinci – Serakıncı Ürün Platformu
- **Amaç:** Serakıncı için geliştirilen çok dilli, statik ürün sunum altyapısını açıklamak.
- **İçerik Yapısı:** Proje hedefleri, otomatik içerik üretim pipeline'ı, entegrasyonlar ve SEO stratejisi alt başlıklarla anlatılır.
- **Güncelleme İpuçları:** Teknik yığın (Jamstack, AI pipeline) güncellenirse ilgili bölümlerde hem açıklama hem de liste halinde belirt. Meta etiketlerde `noindex` ayarı korunmalı.

### travel – Fures Travel AI Companion
- **Amaç:** Sesli/yazılı komutlarla çalışan, Gemini Live API ve Google Maps'i harmanlayan seyahat asistanını tanıtır.
- **İçerik Yapısı:** "Bölüm 1: Bu Uygulama Nedir", "Bölüm 2: Teknik Derinlemesine İnceleme", "Bölüm 3: Geliştirme ve Dağıtım" başlıklarıyla kullanıcı senaryoları, teknik mimari ve devops sürecini anlatır. CTA `/travel` altındaki canlı demoyu açar.
- **Güncelleme İpuçları:** Yeni API anahtarları veya altyapı servisleri eklersen Bölüm 2'de listelere dahil et. Dağıtım sürecinde Netlify/Vercel değişirse Bölüm 3'teki pipeline metnini güncelle.
- **Kod Yapısı:** Vite + React projesi `/travel/` altında tutulur; giriş noktası `index.html` + `index.tsx`, kök bileşen `App.tsx`'tir. `components/` klasöründe `ControlTray` (mikrofon, metin girişleri, bağlantı kontrolü), `StreamingConsole` (canlı transkript), `Sidebar` (ayar paneli) ve `map-3d/` sarmalayıcıları bulunur. `contexts/LiveAPIContext.tsx` Gemini Live durumunu globalde sağlar, `hooks/use-live-api.ts` gerçek zamanlı olayları yönetir, `lib/` klasörü `GenAILiveClient`, `AudioRecorder`, `AudioStreamer`, `MapController`, `state` (Zustand mağazaları) ve `tools/` fonksiyon çağrısı altyapısını içerir.
- **Gemini & Maps Entegrasyonu:** `lib/env.ts` ortam değişkenlerini çoklu anahtar adlarından çözer; `App.tsx` bu anahtarları doğrular ve yoksa hataya düşer. `use-live-api` içindeki `onToolCall` işleyicisi `lib/tools/tool-registry.ts` üzerinden `mapsGrounding`, `frameEstablishingShot`, `frameLocations` fonksiyonlarını yürütür, sonuçları `useLogStore` ve `useMapStore` mağazalarına yazar. Google Maps Photorealistic 3D bileşeni `components/map-3d` altındaki wrapper ile yönetilir, kamera hareketleri `lib/map-controller.ts` ve `lib/look-at.ts` üzerinden hesaplanır.
- **Ses ve Akış Katmanı:** Mikrofon girdisi `lib/audio-recorder.ts` + `lib/worklets/vol-meter` ile PCM'e dönüştürülür; çıktılar `lib/audio-streamer.ts` tarafından sıraya alınır ve gecikmesiz çalınır. Ses seviyeleri `ControlTray` üzerinden görselleştirilir, `use-live-api` `audioStreamer` referansını `LiveAPIContext` vasıtasıyla paylaştırır.
- **Geliştirme & Yayın:** `.env.local` içinde `GEMINI_API_KEY` ve `MAPS_API_KEY` tanımla, ardından `npm install`, `npm run dev` komutlarıyla geliştirme sunucusunu aç. Üretim için `npm run build` çalıştır; çıktı `dist/` klasöründen `/aboutcyprus/` üretim dizinine kopyalanır. `travel/README.md` mimari ve API limitleri hakkında kapsamlı bir rehber sunar; yeni geliştiricileri önce buraya yönlendir.

### furkanyonat – ÖNORM Odaklı CV Sayfası
- **Amaç:** Furkan Yonat'ın Avusturya standartlarına uygun, emir-komuta zincirine uyumlu IT & Front Office profilini çok dilli (TR/EN/DE/ES) olarak sergilemek.
- **İçerik Notları:**
  - Başlık `IT-Systembetreuer & Front Office Manager | Web Design & Coding (Associate Degree)` çizgisini koru; giriş bölümünde disiplin, saha odaklılık ve Avusturya'ya hazır olma vurguları bulunmalı.
  - Bio metni doğrudan rezervasyon artışını destekleyen dijital pazarlama (Google Ads, SEO, içerik tasarımı) katkısını belirtmeli; ajans tarzı CTA'lar kullanılmaz.
  - Deneyim sırası `experienceOrder` içinde önce Dorana/Fures, ardından Almanya (BMW, Continental, Infineon, FedEx, EDAG, Scheugenpflug) deneyimlerini getirir; bu önceliği bozma.
  - Fures Tech rolü yan iş (Nebenberuflich) olarak gösterilmeli; tam zamanlı sadakat mesajını zayıflatma.
  - Eğitimde yeni turizm & otel işletmeciliği önlisansını (2025–) ve web tasarımı önlisansını (2023–) tut; Regensburg mühendislik eğitimi “tamamlanmadı” ifadesi kullanmadan teknik temel ve Almanca vurgusuyla geçsin.
  - Hero bölümünün en başında büyük puntolu isim (Furkan Yonat) ve tekil iletişim satırı yer almalı; `contactInfo` içindeki telefon (phoneDisplay), e-posta ve `address` alanlarını kullanarak tel/mail/adres üçlüsünü göster. `hero.contact` etiketlerini koru, iletişim bloklarını kaldırma.
  - Hero butonları kaldırıldı; PDF/CV çıktısında "Mehr entdecken" gibi site CTA'ları görünmemeli.
 - **Bakım:** Dil çevirileri senkron olmalı; dört dilde de metinler aynı vurguyu taşımalı. İçerik güncelledikten sonra `npm run build` ile kontrol et.
  - **Profil Görseli:** Hero ve gezinti fotoğrafı `furkanyonat/fotofurkan.jpeg` dosyasından import edilir; yeni fotoğraf ekleyeceksen dosyayı aynı isimle değiştirip çeviri dosyalarındaki `profileImage` alanını koruyarak build al.
  - **Hero Portresi:** Hero bölümünde merkezde blur aurası olan yuvarlak profil fotoğrafı gösterilir; `App.tsx` içindeki `<Hero>` bileşeninde yer alır. Fotoğrafın görünür olduğundan emin olmak için build öncesi lokal görüntü kontrolü yap.
  - **Güncel Ton & Sıralama (2025-02):** Hero/bio metinleri tekil ve “sahada teslimat” odaklı tut; Almanca başlıkta verilen hiyerarşi vurgusunu koru. `features`/`Meine Kernkompetenzen` bloklarını ajans çoğul dili yerine bireysel yetkinlik anlatımıyla yaz. `experienceOrder` ters kronolojik ilerler: Dorana → Fures (yan iş) → Mimoza (müdür yrd./resepsiyon) → Concorde → Granada → Almanya bloğu (2012–2017) tek kutu halinde. Almanya başlığında BMW/Continental/Infineon/FedEx örnekleri toplu durmalı, eski tekil kayıtlar gösterilmemeli. Web Tasarımı & Kodlama detay satırında RWR “Datenverarbeitung/Techniker” uygunluk notunu koru.
