# AGENT KILAVUZU — furkanyonat

Bu klasör Furkan Yonat'ın ÖNORM uyumlu CV sayfasını barındırır. Buradaki tüm dosyalar için aşağıdaki kurallara uy.

## Tasarım ve Yerleşim
- Hero bölümü menü altında kalmamalı; `Hero` bileşeninde üstte pozitif padding kullan ve negatif margin ekleme.
- İsim + telefon + e-posta + adres satırı her dilde `contactInfo` alanlarından beslenen yuvarlak kartlarla hero'da öne çıkmalı.
- Ton tekil ve "bireysel yetkinlik" odaklıdır; ajans dili veya çoğul ifadeler ekleme.
- Profil fotoğrafı `fotofurkan.jpeg` dosyasından import edilir ve menü avatarında da kullanılır; yeni fotoğrafa geçerken aynı dosya adını koru ki build çıktısındaki referanslar kırılmasın.

## İçerik ve Kronoloji
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

Bu kılavuzu her değişiklik sonrası güncel tut ve yeni gereksinimleri buraya ekle.
