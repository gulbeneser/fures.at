# AGENT KILAVUZU — furkanyonat

Bu klasör Furkan Yonat'ın ÖNORM uyumlu CV sayfasını barındırır. Buradaki tüm dosyalar için aşağıdaki kurallara uy.

## Tasarım ve Yerleşim
- Hero bölümü menü altında kalmamalı; `Hero` bileşeninde üstte pozitif padding kullan ve negatif margin ekleme.
- İsim + telefon + e-posta + adres satırı her dilde `contactInfo` alanlarından beslenen yuvarlak kartlarla hero'da öne çıkmalı.
- Ton tekil ve "bireysel yetkinlik" odaklıdır; ajans dili veya çoğul ifadeler ekleme.
- Profil fotoğrafı `fotofurkan.jpeg` dosyasından import edilir ve menü avatarında da kullanılır; yeni fotoğrafa geçerken aynı dosya adını koru ki build çıktısındaki referanslar kırılmasın.
- Hero görseli hero başlığının üstünde, blur auralı yuvarlak bir portre olarak gösterilir; `App.tsx` içindeki `Hero` bileşenindeki görsel sınıflarını (border, shadow, object-cover) koru ki fotoğraf kesilmesin.
- Header içinde PDF indirme/print butonu bulunur; `window.print()` çağrısıyla çalışır ve `t.actions.downloadPdf` çevirisini kullanır. Butonun print çıktısında görünmediğini (header `no-print`) koru.
- Deneyim başlığında çevirilerden gelen “Tüm kartları aç”/“Kartları tek tek görüntüle” toggle’ı vardır. Toggle açıkken tüm kartlar genişlemeli ve kart butonları devre dışı (`aria-disabled`), tekli moda dönünce varsayılan olarak `neu` kartı açık gelmelidir.

## İçerik ve Kronoloji
- Referans/proje listesinde `www.zuzumood.com` bağlantısı yer alır; bu kayıt çok dilli çeviri dosyalarında (TR/EN/DE/ES) eş zamanlı korunmalıdır.
- ZuzuMood referansı yalnızca CV içinde değil, ana sitenin `src/components/Projects.tsx` dosyasındaki proje kartlarında da canlı tutulur; proje mesajları platformlar arasında çelişmemelidir.
- Deneyim sırası `experienceOrder` ile ters kronolojiktir: Dorana → Fures (yan iş) → Mimoza (müdür yrd./resepsiyon) → Concorde → Granada → Almanya bloğu.
- Almanya bloğu tek kartta tutulur; görevler içinde tarih aralıklarını (2015–2016 BMW, 2013–2014 Continental & Infineon, 2014 FedEx) koru ve C1 disiplin vurgusunu sürdür.
- Hero başlıklarında "hiyerarşi" vurgusu kullanılmaz; teslimat ve sahada hazır olma mesajı tekil dille verilir.
- Bio/hero metni dijital pazarlama katkısını net vurgulamalı (Google Ads, SEO, içerik tasarımı ile direkt rezervasyon artışı) ve ajans dili içermemelidir.
- Eğitimde turizm/otelcilik (2025–) ve Web Design & Coding (2023–) önlisansları ile Regensburg teknik eğitimi (tamamlanma belirtmeden) kalmalıdır; Web Design satırındaki RWR uygunluk notunu silme.
- Web Design & Coding önlisansı 2020–2023 aralığında tamamlandı; tarih formatını bu şekilde koru.

## Test ve SEO
- İçerik değişikliklerinden sonra `npm run build` çalıştır.
- Yeni rota eklenirse `public/sitemap.xml` dahil ilgili sitemap dosyalarını güncelle.
- CV sayfasında siteye özgü CTA veya buton metinleri ("Mehr entdecken", "Projenizi Anlatalım" vb.) kullanılmaz; hero butonları kaldırılmıştır.
- "Mehr", "Mehr entdecken", "Erzählen Sie uns von Ihrem Projekt", "Angetrieben von Fures" gibi ifadeler ve abartılı asistan selamlamaları kullanılmaz; metinlerde bu kalıpları görürsen temizle.

Bu kılavuzu her değişiklik sonrası güncel tut ve yeni gereksinimleri buraya ekle.

## Görev Sonu Mini Checklist

- Ana sitedeki (`src/components/Projects.tsx`) görsel güncellemeler yapıldığında iOS/aero dilinin Furkan sayfasındaki genel tonla çelişmediğini doğrula.
- Her görev sonunda bu klasör özelindeki içerik, kronoloji ve SEO kurallarının güncelliğini hızlıca doğrula.
- Ana site proje sıralaması değiştiğinde ZuzuMood referans metinlerinin çok dilli dosyalarda tutarlı kaldığını kontrol et.
- Yeni bir rota oluşursa ilgili sitemap güncellemesinin yapıldığını doğrulamadan görevi kapatma.
- Header/nav üzerinde yapılan global glass değişiklikleri CV sayfasındaki metin netliğini düşürmemeli; okunabilirlik testini hızlıca kontrol et.

