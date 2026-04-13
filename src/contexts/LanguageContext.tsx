import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

export type Language = 'tr' | 'en' | 'ru' | 'de';

export const LANGUAGE_META: Record<Language, { label: string; locale: string; hrefLang: string; direction: 'ltr' | 'rtl' }> = {
  tr: { label: 'Türkçe', locale: 'tr_CY', hrefLang: 'tr-CY', direction: 'ltr' },
  en: { label: 'English', locale: 'en_CY', hrefLang: 'en-CY', direction: 'ltr' },
  ru: { label: 'Русский', locale: 'ru_RU', hrefLang: 'ru-RU', direction: 'ltr' },
  de: { label: 'Deutsch', locale: 'de_AT', hrefLang: 'de-AT', direction: 'ltr' }
};

export const DEFAULT_LANGUAGE: Language = 'tr';
export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_META) as Language[];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  tr: {
    // Header
    'nav.home': 'Ana Sayfa',
    'nav.about': 'Hakkımızda',
    'nav.services': 'Hizmetler',
    'nav.projects': 'Projeler',
    'nav.campaigns': 'Kampanyalar',
    'nav.blog': 'Blog',
    'nav.contact': 'İletişim',
    'nav.more': 'Daha Fazla',
    'nav.lets_talk': 'Hadi Konuşalım',

    // Blog
    'blog.title': 'Fures Blogu',
    'blog.subtitle': 'Yapay zekâ ve dijital dönüşüm üzerine günlük notlar ve seçkiler.',
    'blog.no_posts': 'Bu dilde henüz blog yazısı bulunmuyor.',
    'blog.read_more': 'Devamını Oku',
    'blog.back_to_list': 'Bloga Dön',
    'blog.not_found': 'Yazı bulunamadı',
    'blog.not_found_description': 'Aradığınız içerik taşınmış veya kaldırılmış olabilir. Diğer yazılara göz atın.',

    // Campaigns
    'campaigns.title': 'Fures Kampanyaları',
    'campaigns.subtitle': 'Türkiye ve KKTC için günlük yapay zekâ destekli kampanya kitleri.',
    'campaigns.no_posts': 'Bugün kampanya bulunamadı. Lütfen yarın tekrar kontrol edin.',
    'campaigns.read_more': 'Detayları Gör',
    'campaigns.back_to_list': 'Kampanyalara Dön',
    'campaigns.not_found': 'Kampanya bulunamadı',
    'campaigns.not_found_description': 'Aradığınız kampanya yayından kaldırılmış olabilir. Güncel kampanyalara göz atın.',

    // SEO
    'seo.site_name': 'Fures Tech · Otel & Turizm Dijital Ajansı',
    'seo.tagline': 'Web & AI tasarım, yapay zekâ otomasyonu, sosyal medya ve büyüme çözümleri',
    'seo.common.keywords': 'kktc otel web sitesi, kktc yerel seo, kuzey kıbrıs dijital ajans, kktc otel sosyal medya, kktc rezervasyon otomasyonu, girne otel web tasarım, gazimağusa otel web sitesi, avusturya otel dijital ajansı',
    'seo.organization.description': [
      'Fures Tech, Gazimağusa merkezli çok dilli web tasarım, AI tasarım, yapay zekâ otomasyon ve büyüme ajansıdır.',
      'KKTC web tasarım ajansı olarak Girne, Lefkoşa ve Gazimağusa\'da oteller, turizm işletmeleri, ürün markaları ve hizmet şirketleri için ürün web siteleri, tanıtım web siteleri, otel web sitesi oluşturma ve otomasyon tasarımı projeleri geliştiriyoruz.'
    ].join(' '),
    'seo.home.title': 'Fures Tech | Otel Web Sitesi, Local SEO & Rezervasyon Otomasyonu | KKTC',
    'seo.home.description': 'Fures Tech, KKTC ve Avusturya ofislerinden DACH bölgesi otellerine otel web sitesi tasarımı, Google Haritalar optimizasyonu, sosyal medya yönetimi ve misafir deneyimi otomasyonu hizmetleri sunar.',
    'seo.home.keywords': 'kktc otel web sitesi, kktc otel seo, kuzey kıbrıs otel dijital ajansı, kktc rezervasyon otomasyonu, kktc otel sosyal medya, girne otel web tasarım, gazimağusa otel web sitesi',
    'seo.about.title': 'Hakkımızda | Fures Tech Dijital Ajansı',
    'seo.about.description': 'Fures Tech ekibi tasarım, yazılım, yapay zekâ ve büyüme alanlarında deneyimli uzmanlardan oluşur. Kuzey Kıbrıs ve uluslararası projelerde uçtan uca dijital dönüşüm sağlıyoruz.',
    'seo.about.keywords': 'fures tech ekibi, kıbrıs dijital uzmanları, kuzey kıbrıs teknoloji şirketi',
    'seo.services.title': 'Hizmetler | Otel Web Sitesi, SEO, Sosyal Medya | Fures Tech',
    'seo.services.description': 'Fures Tech; otel web sitesi tasarımı, Google Haritalar optimizasyonu, sosyal medya yönetimi, otel yazılım entegrasyonu ve misafir deneyimi otomasyonu hizmetleriyle KKTC ve DACH bölgesi otellerini büyütür.',
    'seo.services.keywords': 'kktc web tasarım hizmetleri, kktc ürün web sitesi geliştirme, kktc tanıtım web sitesi, kktc otel web sitesi, kktc logo tasarımı, kktc otomasyon tasarımı, kktc sosyal medya yönetimi',
    'seo.campaigns.title': 'Kampanyalar | Fures Tech Günlük Yapay Zekâ Reklam Planları',
    'seo.campaigns.description': 'Fures Tech her gün Türkiye ve KKTC için yapay zekâ destekli kampanya konseptleri, otomasyon akışları ve sosyal medya fikirleri üretir.',
    'seo.campaigns.keywords': 'fures kampanyalar, kktc reklam kampanyası, türkiye yapay zeka ajansı, kampanya otomasyonu, sosyal medya otomasyon paketi',
    'seo.projects.title': 'Projeler | Fures Tech Başarı Hikayeleri',
    'seo.projects.description': 'KKTC ve uluslararası pazarlarda gerçekleştirdiğimiz web tasarım, AI otomasyon ve büyüme projelerini inceleyin.',
    'seo.projects.keywords': 'kuzey kıbrıs web projeleri, kıbrıs yapay zeka projeleri, kıbrıs dijital dönüşüm referansları',
    'seo.team.title': 'Ekip | Fures Tech Kurucu ve Uzmanları',
    'seo.team.description': 'Fures Tech kurucuları ve uzman ekibimizle tanışın. Çok dilli dijital deneyimler tasarlayan ve AI otomasyonları geliştiren profesyoneller.',
    'seo.team.keywords': 'fures tech kurucu, fures tech takım, kıbrıs teknoloji uzmanları',
    'seo.faq.title': 'Sıkça Sorulan Sorular | Fures Tech',
    'seo.faq.description': 'Fures Tech hizmetleri, proje süreleri, destek süreçleri ve veri güvenliği hakkında sıkça sorulan soruların yanıtları.',
    'seo.faq.keywords': 'kuzey kıbrıs web tasarım soruları, kıbrıs dijital ajans fiyatları, fures tech destek',
    'seo.contact.title': 'İletişim | Fures Tech Kuzey Kıbrıs Dijital Ajansı',
    'seo.contact.description': 'Fures Tech ile hemen iletişime geçin. Gazimağusa merkezli KKTC dijital ajans ekibimiz web tasarım, AI otomasyon ve sosyal medya projeleriniz için hazır.',
    'seo.contact.keywords': 'fures tech iletişim, kuzey kıbrıs dijital ajans iletişim, gazimağusa web tasarım iletişim, kktc dijital ajans',
    'seo.profile.furkanyonat.title': 'Furkan Yonat Dijital CV | Fures Tech',
    'seo.profile.furkanyonat.description': 'Fures Tech kurucu ortağı Furkan Yonat\'ın yapay zekâ tabanlı kariyer sunumu, projeler ve sertifikalarını inceleyin.',
    'seo.profile.furkanyonat.keywords': 'furkan yonat, fures tech kurucu ortağı, kıbrıs yapay zeka uzmanı',
    'seo.profile.gulbeneser.title': 'Gülben Eser Portfolyo | Fures Tech',
    'seo.profile.gulbeneser.description': 'Fures Tech kurucusu Gülben Eser\'in tasarım liderliği, içerik stratejisi ve projelerine göz atın.',
    'seo.profile.gulbeneser.keywords': 'gülben eser, fures tech kurucusu, kıbrıs kreatif direktör',
    'seo.profile.kariyer.title': 'Fures Tech Kariyer Asistanı | Yapay Zekâ Destekli İşe Alım',
    'seo.profile.kariyer.description': 'Fures Tech kariyer platformu yapay zekâ destekli aday değerlendirme simülasyonları ve otomatik iş ilanı üretimi sunar.',
    'seo.profile.kariyer.keywords': 'fures tech kariyer, kıbrıs işe alım otomasyonu, yapay zeka kariyer asistanı',
    'seo.privacy.title': 'Gizlilik Politikası | Fures Tech',
    'seo.privacy.description': 'Fures Tech olarak kişisel verilerinizi KVKK ve GDPR standartlarına göre işler, güvenle korur ve şeffaf biçimde yönetiriz.',
    'seo.privacy.keywords': 'kvkk gizlilik, kıbrıs gizlilik politikası, veri koruma fures tech, kktc veri güvenliği',
    'seo.cookies.title': 'Çerez Politikası | Fures Tech',
    'seo.cookies.description': 'Fures Tech web sitesinde kullanılan çerez kategorileri, amaçları ve yönetim seçenekleri hakkında bilgi alın.',
    'seo.cookies.keywords': 'çerez politikası, cookie policy türkçe, dijital ajans çerezleri, kvkk çerez',
    'seo.kvkk.title': 'KVKK Aydınlatma Metni | Fures Tech',
    'seo.kvkk.description': 'Fures Tech veri işleme süreçleri, hukuki sebepler, aktarım ve başvuru yöntemleri hakkında KVKK uyumlu aydınlatma.',
    'seo.kvkk.keywords': 'kvkk aydınlatma metni, kişisel veri işleme, kktc veri sorumlusu, fures tech kvkk',

    // Hero
    'hero.title': 'Otel Dijital Ajansı',
    'hero.rotating': 'Otel Web Sitesi|Yerel SEO|Google Haritalar|Misafir Otomasyonu',
    'hero.subtitle': 'Daha Fazla Direkt Rezervasyon. Daha Az Aracı.',
    'hero.ai_powered': 'KKTC Otellerine Özel Dijital Çözümler.',
    'hero.description': 'Otel web sitesi tasarımı, yerel SEO, sosyal medya yönetimi ve misafir deneyimi otomasyonu ile rezervasyon oranınızı artırıyoruz. Avusturya ve KKTC ofislerimizden DACH ve KKTC bölgesine hizmet veriyoruz.',
    'hero.badge': 'Otel & Turizm Dijital Ajansı',
    'hero.cta_discover': 'Hizmetleri Keşfet',
    'hero.cta_pricing': 'Fiyatları Gör',
    'hero.cta_talk': 'Hadi Konuşalım',
    'hero.secondary_cta': 'Danışmanlık Talep Edin →',

    // Quotes
    'quotes.items': 'Teknolojiyle değil, zekâyla ölçekleniyoruz.|Fures = Akıllı sistem tasarımı|Estetik ≠ lüks, işlevdir|Yapay zekâ = yaratıcı hız',

    // Why Us
    'why_us.title': 'AI-Native yaklaşım. Reel sonuç.',
    'why_us.subtitle': 'Neden Biz',
    'why_us.operational': 'Operasyonel Verim',
    'why_us.operational_desc': 'Tekrarlı işleri otomatikleştirir, maliyetleri düşürür, zamanı geri kazandırır.',
    'why_us.design_engineering': 'Tasarım + Mühendislik',
    'why_us.design_engineering_desc': 'Estetikle performansı aynı masada buluştururuz.',
    'why_us.data_driven': 'Veriyle Karar',
    'why_us.data_driven_desc': 'Paneller, raporlar, A/B testleriyle neyin işe yaradığını anlarız.',
    'why_us.industry_depth': 'Sektörel Derinlik',
    'why_us.industry_depth_desc': 'Turizm–otelcilik, e-ticaret/ürün katalogları (dermokozmetik & veteriner), deneyim ve etkinlik satışı.',

    // Benefits
    'benefits.title': 'Kazandırdıklarımız',
    'benefits.customer_experience': 'Geliştirilmiş Müşteri Deneyimi',
    'benefits.customer_experience_desc': 'Etkileşim ve memnuniyet artışı',
    'benefits.efficiency': 'Verimlilik Artışı',
    'benefits.efficiency_desc': 'Süreçlerin akıllı otomasyonu',
    'benefits.better_decisions': 'Daha İyi Kararlar',
    'benefits.better_decisions_desc': 'Şeffaf veri ve içgörü akışı',

    // Mission
    'mission.title': 'Misyonumuz',
    'mission.description': 'İşletmeleri ürün web siteleri, otel web sitesi projeleri, logo tasarımı ve yapay zekâ otomasyonu ile dijitalde zirveye taşımak.',
    'mission.priority': 'Önceliğimiz: netlik, hız ve kalıcı estetik.',
    'mission.cta': 'Bir Görüşme Ayarla',

    // Services
    'services.title': 'Hizmetler',
    'services.seo': 'SEO (Arama Motoru Optimizasyonu)',
    'services.seo_desc': 'Google\'da üst sıralarda görünün. Otel ve turizm işletmeniz için hedefli anahtar kelime optimizasyonu, teknik SEO ve içerik stratejisiyle organik trafiğinizi artırıyoruz.',
    'services.local_seo': 'Google Haritalar & Yerel SEO',
    'services.local_seo_desc': 'Google İşletme Profilinizi optimize ediyoruz; tutarlı NAP verileri, yerel atıflar ve yorum stratejisiyle bölgesel aramalarda rakiplerinizin önüne geçiyoruz.',
    'services.social_media': 'Sosyal Medya Yönetimi',
    'services.social_media_desc': 'Instagram, Facebook ve TikTok\'ta düzenli, kaliteli içerikler; misafir deneyimini öne çıkaran kampanyalar; rezervasyon artışına odaklı sosyal strateji.',
    'services.hotel_web': 'Otel Web Sitesi Tasarımı',
    'services.hotel_web_desc': 'Çok dilli, rezervasyon motorlu, mobil-öncelikli otel web siteleri. Hızlı yükleme, KVKK/GDPR uyumlu yapı ve doğrudan rezervasyon oranını artıran dönüşüm optimizasyonu.',
    'services.hotel_pms': 'Otel Yönetim Yazılımı Entegrasyonu',
    'services.hotel_pms_desc': 'PMS, channel manager ve online rezervasyon portallarınızı web sitenize entegre ediyoruz. Otomatik müsaitlik ve fiyat senkronizasyonu; manuel iş yükünü sıfıra indiriyoruz.',
    'services.guest_automation': 'Misafir Deneyimi Otomasyonu',
    'services.guest_automation_desc': 'Otomatik ön-varış mesajları, dijital check-in formları, WhatsApp ve e-posta akışları ile ayrılış sonrası yorum toplama; sadık misafir kitlesi oluşturun.',

    // Service Packages
    'packages.title': 'Ayrıntılı Hizmet Paketleri',
    'packages.subtitle': 'Modüler ve ölçekte esnek paketler',
    'packages.note': 'Paketler ölçekte esnektir; proje ve sektör gereksinimlerine göre yapılandırılır.',
    'packages.launch_web': 'Launch Web',
    'packages.launch_web_subtitle': 'Küçük/orta ölçekli markalar için hızlı kurulum',
    'packages.launch_web_desc': 'Bilgi mimarisi, çok dilli şablon, SEO temeli, ürün ve tanıtım sayfaları, otel veya hizmet tanıtımı • Entegrasyonlar: formlar, haritalar, temel analitik',
    'packages.launch_web_price': 'Kapsam için iletişime geçin',
    'packages.growth_web': 'Growth Web+',
    'packages.growth_web_subtitle': 'Dönüşüm odaklı, veriyle yönetilen site',
    'packages.growth_web_desc': 'Özel tasarım, hız optimizasyonu, blog/ürün yapısı, ürün satış web sitesi mimarisi • A/B test, içerik üretim hattı, gelişmiş analitik',
    'packages.growth_web_price': 'Özelleştirilmiş teklif için iletişime geçin',
    'packages.ai_automation': 'AI Automation',
    'packages.ai_automation_subtitle': 'Süreç otomasyonu ve entegrasyon',
    'packages.ai_automation_desc': 'Veri toplama/senkron, içerik otomasyonu, özel otomasyon tasarımı, rezervasyon & CRM entegrasyonları • Yönetim paneli ve raporlama',
    'packages.ai_automation_price': 'Çözüm detayları için iletişime geçin',
    'packages.social_media_pro': 'Sosyal Medya Pro',
    'packages.social_media_pro_subtitle': 'Strateji + üretim + reklam',
    'packages.social_media_pro_desc': 'Aylık içerik planı (TR/EN/DE/RU), prodüksiyon ve yayın • Performans raporu, optimizasyon',
    'packages.social_media_pro_price': 'Planlamayı birlikte belirleyelim',
    'packages.translation': 'Çeviri & Yerelleştirme',
    'packages.translation_subtitle': 'Yeminli/sertifikalı çeviri',
    'packages.translation_desc': 'Yeminli/sertifikalı çeviri, teknik/akademik kalite güvencesi',
    'packages.translation_price': 'Dil ve kapsam için iletişime geçin',

    // Projects
    'projects.title': 'Projeler',
    'projects.subtitle': 'AI destekli referanslarımız',
    'projects.description': 'Yapay zeka teknolojileriyle geliştirdiğimiz yenilikçi çözümler ve başarı hikayelerimiz.',
    'projects.visit': 'Tümü için',
    'projects.visit_project': 'Projeyi İncele',
    'projects.cta': 'Hadi Konuşalım',
    'projects.start.title': 'Kendi Projenizi Başlatın',
    'projects.start.description': 'AI destekli çözümlerle hayalinizdeki projeyi gerçeğe dönüştürmeye hazır mısınız? Deneyimli ekibimizle birlikte dijital dönüşüm yolculuğunuza başlayın.',
    'projects.start.cta': 'Projemi Başlat',
    'projects.start.email': 'E-posta ile proje özeti gönder',
    'projects.start.email_desc': 'info@fures.at adresine proje beklentilerinizi paylaşın.',
    'projects.start.whatsapp': 'WhatsApp üzerinden hızlıca konuş',
    'projects.start.whatsapp_desc': '+90 548 876 68 19 numarasına mesaj gönderin, 1 iş günü içinde dönüş yapalım.',
    'projects.start.phone': 'Telefonla hemen arayın',
    'projects.start.phone_desc': 'Çalışma saatleri içinde doğrudan ekibimize ulaşın.',
    'projects.start_heading': 'Projeye birlikte başlayalım',
    'projects.start_body': 'İletişime geçtiğinizde hedeflerinizi dinleyip uygun çözüm yolunu planlıyoruz. Yapay zekâ destekli ekiplerimiz projenizi fikir aşamasından yayına kadar taşıyor.',
    'projects.start_primary_cta': 'İletişime geç',
    'projects.start_secondary_cta': 'Tüm projeleri gör',

    // Why Fures
    'why_fures.title': 'Neden Fures Tech?',
    'why_fures.description': 'Tasarımcı duyarlılığı + Mühendis aklı + AI refleksi. KKTC dijital ekosisteminde güncel araçları değil, doğru sistemleri kurarız: sürdürülebilir, ölçülebilir ve devredilebilir.',

    // Team
    'team.badge': 'Ekibimiz',
    'team.title': 'Ekip',
    'team.gulben.name': 'Gülben Eser',
    'team.gulben.role': 'Kurucu',
    'team.gulben.description': 'Tasarım, içerik, kalite ve proje yönetimi',
    'team.furkan.name': 'Furkan Yonat',
    'team.furkan.role': 'Co-Founder',
    'team.furkan.description': 'Sistem mimarisi, otomasyon, entegrasyon ve büyüme',

    // Pricing
    'pricing.title': 'Fiyatlandırma',
    'pricing.subtitle': 'Şeffaf ve modüler',
    'pricing.description': 'İhtiyaca göre paketler birleştirilebilir; sabit kapsam + sprint yaklaşımıyla ilerleriz.',
    'pricing.cta': 'Teklif Al',
    'pricing.cta_desc': '48 saat içinde özet çözüm ve tahmini bütçe.',

    // FAQ
    'faq.title': 'Sıkça Sorulan Sorular',
    'faq.q1': 'Süreler ne kadar?',
    'faq.a1': 'Launch Web 2–4 hafta, Growth Web+ 4–8 hafta; otomasyon ve entegrasyonlar kapsamına göre fazlanır.',
    'faq.q2': 'Destek/garanti?',
    'faq.a2': 'Canlıya çıkış sonrası 30 gün stabilizasyon; isteğe bağlı aylık bakım/iyileştirme planı.',
    'faq.q3': 'Veri güvenliği?',
    'faq.a3': 'Roller, erişim seviyeleri ve loglama standarttır. Üçüncü taraf servislerde best-practice uygularız.',
    'faq.q4': 'Hangi diller?',
    'faq.a4': 'TR/EN/DE/RU başta olmak üzere talebe göre genişletilir.',

    // Contact
    'contact.title': 'İletişim',
    'contact.subtitle': 'Projenizi birlikte büyütelim.',
    'contact.description': 'KKTC ve Avusturya ofislerimizden uzman ekibimizle otel dijital dönüşümünüzü planlıyoruz.',
    'contact.email': 'E-posta',
    'contact.headquarters': 'Avusturya Ofisi',
    'contact.headquarters_location': 'Maria Alm, Salzburgerland, Avusturya',
    'contact.second_location': 'KKTC Ofisi',
    'contact.second_location_place': 'Gazimağusa, Kuzey Kıbrıs',
    'contact.phone': 'Telefon',
    'contact.phone_at': '+43 664 99735268',
    'contact.send_message': 'Mesaj Gönder',
    'contact.schedule_meeting': 'Toplantı Planla',

    // Footer
    'footer.copyright': '© 2025 Fures Tech — fures.at · Tüm hakları saklıdır.',
    'footer.privacy': 'Gizlilik',
    'footer.cookies': 'Çerezler',
    'footer.kvkk': 'KVKK/Aydınlatma',

    // Form
    'form.title': 'Hadi projenizi kıvılcımlayalım.',
    'form.name': 'Ad Soyad',
    'form.email': 'E-posta',
    'form.company': 'Şirket',
    'form.needs': 'İhtiyaç(lar)',
    'form.budget': 'Bütçe Aralığı',
    'form.date': 'Tarih',
    'form.submit': 'Teklif Hazırla',
    'form.success': 'Teşekkürler! 1 iş günü içinde dönüş yapacağız.',
    'form.error': 'Bir şeyler ters gitti. Lütfen alanları kontrol edin.',
  },
  en: {
    // Header
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.projects': 'Projects',
    'nav.campaigns': 'Campaigns',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.more': 'More',
    'nav.lets_talk': 'Let\'s Talk',

    // Blog
    'blog.title': 'Fures Blog',
    'blog.subtitle': 'Daily AI updates and insights on digital growth.',
    'blog.no_posts': 'No blog posts are available in this language yet.',
    'blog.read_more': 'Read More',
    'blog.back_to_list': 'Back to Blog',
    'blog.not_found': 'Post not found',
    'blog.not_found_description': 'The article you are looking for might have been moved or deleted. Explore the latest posts instead.',

    // Campaigns
    'campaigns.title': 'Fures Campaigns',
    'campaigns.subtitle': 'Daily AI-driven campaign kits for Turkey and Northern Cyprus.',
    'campaigns.no_posts': 'Campaigns are currently available in Turkish. Check back soon.',
    'campaigns.read_more': 'View Details',
    'campaigns.back_to_list': 'Back to Campaigns',
    'campaigns.not_found': 'Campaign not found',
    'campaigns.not_found_description': 'The campaign might have been removed. Browse the latest kits.',

    // SEO
    'seo.site_name': 'Fures Tech · North Cyprus Digital Agency',
    'seo.tagline': 'Web design, AI automation, social media and growth solutions',
    'seo.common.keywords': 'north cyprus web design, cyprus web design agency, cyprus digital agency, famagusta web design, nicosia web design, cyprus ai automation, cyprus social media management, cyprus seo agency, trnc web design agency, north cyprus (trnc) digital agency',
    'seo.organization.description': 'Fures Tech is a Famagusta-based multilingual digital agency delivering web design, AI automation and growth marketing for hotels, tourism companies, e-commerce brands and service businesses in North Cyprus (TRNC) and nearby markets.',
    'seo.home.title': 'Fures Tech | North Cyprus Web Design, AI Automation & Social Media Agency',
    'seo.home.description': 'Fures Tech delivers bespoke web design, AI automations, social media management and data-driven growth services for businesses in North Cyprus (TRNC) and Turkey. We build multilingual, SEO-optimised experiences that help you dominate search results.',
    'seo.home.keywords': 'north cyprus digital agency, cyprus social media agency, cyprus ai agency, cyprus seo consulting, famagusta marketing agency, trnc web design agency, north cyprus (trnc) marketing',
    'seo.about.title': 'About Us | Fures Tech Digital Agency',
    'seo.about.description': 'Fures Tech combines design, engineering, AI and growth expertise to deliver end-to-end digital transformation for North Cyprus (TRNC) and international brands.',
    'seo.about.keywords': 'fures tech team, cyprus digital experts, north cyprus technology company',
    'seo.services.title': 'Services | Cyprus Web Design, AI Automation & Social Media',
    'seo.services.description': 'Fures Tech supports your growth in Cyprus with web design and development, AI automations, social media management, analytics and multilingual content production crafted by a TRNC web design agency team.',
    'seo.services.keywords': 'north cyprus web services, cyprus automation solutions, cyprus social media management, cyprus data analytics, trnc web design agency',
    'seo.campaigns.title': 'Campaigns | Fures Tech Daily AI Marketing Kits',
    'seo.campaigns.description': 'Fures Tech crafts AI-first campaign concepts, automation flows and social content ideas for Turkey and the TRNC every day.',
    'seo.campaigns.keywords': 'fures campaigns, turkey ai marketing, trnc advertising automation, campaign automation, social media kit',
    'seo.projects.title': 'Projects | Fures Tech Case Studies',
    'seo.projects.description': 'Explore the web design, AI automation and growth projects we deliver across North Cyprus (TRNC) and global markets.',
    'seo.projects.keywords': 'north cyprus web projects, cyprus ai projects, cyprus digital transformation case studies',
    'seo.team.title': 'Team | Fures Tech Founders & Specialists',
    'seo.team.description': 'Meet the founders and experts behind Fures Tech – designers and engineers creating multilingual digital experiences and AI automations.',
    'seo.team.keywords': 'fures tech founders, fures tech team, cyprus technology experts',
    'seo.faq.title': 'FAQ | Fures Tech',
    'seo.faq.description': 'Answers to common questions about Fures Tech services, project timelines, support models and data protection.',
    'seo.faq.keywords': 'north cyprus web design faq, cyprus digital agency pricing, fures tech support',
    'seo.contact.title': 'Contact | Fures Tech North Cyprus Digital Agency',
    'seo.contact.description': 'Contact Fures Tech today. Our Famagusta-based TRNC web design agency team is ready to plan web design, AI automation and social media projects with you.',
    'seo.contact.keywords': 'fures tech contact, north cyprus digital agency contact, famagusta web design contact, trnc web design agency',
    'seo.profile.furkanyonat.title': 'Furkan Yonat Digital CV | Fures Tech',
    'seo.profile.furkanyonat.description': 'Review the AI-powered career presentation, projects and certifications of Fures Tech co-founder Furkan Yonat.',
    'seo.profile.furkanyonat.keywords': 'furkan yonat, fures tech co-founder, cyprus ai specialist',
    'seo.profile.gulbeneser.title': 'Gülben Eser Portfolio | Fures Tech',
    'seo.profile.gulbeneser.description': 'Discover the design leadership, content strategy and selected projects of Fures Tech founder Gülben Eser.',
    'seo.profile.gulbeneser.keywords': 'gulben eser, fures tech founder, cyprus creative director',
    'seo.profile.kariyer.title': 'Fures Tech Career Assistant | AI-Powered Recruitment',
    'seo.profile.kariyer.description': 'The Fures Tech career platform delivers AI-assisted candidate screening, interview simulations and automated job posting workflows.',
    'seo.profile.kariyer.keywords': 'fures tech career, cyprus recruitment automation, ai career assistant',
    'seo.privacy.title': 'Privacy Policy | Fures Tech',
    'seo.privacy.description': 'Learn how Fures Tech processes and protects personal data in compliance with KVKK and GDPR standards.',
    'seo.privacy.keywords': 'privacy policy cyprus, kvkk privacy, fures tech data protection, trnc gdpr',
    'seo.cookies.title': 'Cookie Policy | Fures Tech',
    'seo.cookies.description': 'Understand the categories of cookies Fures Tech uses, why we use them and how to manage your preferences.',
    'seo.cookies.keywords': 'cookie policy cyprus, marketing cookies, analytics cookies, fures tech',
    'seo.kvkk.title': 'KVKK Disclosure | Fures Tech',
    'seo.kvkk.description': 'Detailed information about Fures Tech data processing purposes, legal bases, transfers and data subject rights.',
    'seo.kvkk.keywords': 'kvkk information notice, personal data processing cyprus, trnc data controller, fures tech kvkk',

    // Hero
    'hero.title': 'Digital Agency',
    'hero.rotating': 'Digital Agency|Intelligent System|Creative Automation|Fures Tech',
    'hero.subtitle': 'Beyond Boundaries. Experience-led.',
    'hero.ai_powered': 'AI-Powered Design, Code & Growth.',
    'hero.description': 'Smart automation, impactful web experiences, and data-driven marketing for your brand. Fast, measurable, scalable.',
    'hero.badge': 'AI-Native Digital Agency',
    'hero.cta_discover': 'Discover More',
    'hero.cta_pricing': 'See Pricing',
    'hero.cta_talk': 'Let\'s Talk',
    'hero.secondary_cta': 'Tell Us About Your Project →',

    // Quotes
    'quotes.items': 'We scale with intelligence, not just technology.|Fures = Intelligent systems design|Aesthetics ≠ luxury, they are function.|AI = creative speed',

    // Why Us
    'why_us.title': 'AI-Native approach. Real results.',
    'why_us.subtitle': 'Why Us',
    'why_us.operational': 'Operational Efficiency',
    'why_us.operational_desc': 'Automates repetitive tasks, reduces costs, reclaims time.',
    'why_us.design_engineering': 'Design + Engineering',
    'why_us.design_engineering_desc': 'We unite aesthetics with performance.',
    'why_us.data_driven': 'Data-Driven Decisions',
    'why_us.data_driven_desc': 'Dashboards, reports, A/B tests to understand what works.',
    'why_us.industry_depth': 'Industry Depth',
    'why_us.industry_depth_desc': 'Tourism-hospitality, e-commerce/product catalogs (dermocosmetics & veterinary), experience and event sales.',

    // Benefits
    'benefits.title': 'What We Deliver',
    'benefits.customer_experience': 'Enhanced Customer Experience',
    'benefits.customer_experience_desc': 'Increased engagement and satisfaction',
    'benefits.efficiency': 'Efficiency Boost',
    'benefits.efficiency_desc': 'Smart automation of processes',
    'benefits.better_decisions': 'Better Decisions',
    'benefits.better_decisions_desc': 'Transparent data and insight flow',

    // Mission
    'mission.title': 'Our Mission',
    'mission.description': 'To elevate businesses across North Cyprus (TRNC) to the top of their field through comprehensive AI automation and timeless design.',
    'mission.priority': 'Our priority: clarity, speed, and lasting aesthetics.',
    'mission.cta': 'Schedule a Meeting',

    // Services
    'services.title': 'Services',
    'services.seo': 'Search Engine Optimisation (SEO)',
    'services.seo_desc': 'More organic visibility on Google. We optimise your hotel website for the keywords that matter — so guests find you before they find the competition.',
    'services.local_seo': 'Google Maps & Local SEO',
    'services.local_seo_desc': 'Your property on the digital map: optimised Google Business Profile, consistent listing details, local citations and review strategies for DACH-region hotels.',
    'services.social_media': 'Social Media Management',
    'services.social_media_desc': 'Professional presence on Instagram, Facebook and more. Regular, authentic content that strengthens your brand, inspires guests and drives booking intent.',
    'services.hotel_web': 'Hotel Website with Booking Engine',
    'services.hotel_web_desc': 'Multilingual, conversion-optimised hotel websites with integrated booking engine. Mobile-first, fast-loading, GDPR-compliant — for maximum direct bookings without commission losses.',
    'services.hotel_pms': 'Hotel Management Software Integration',
    'services.hotel_pms_desc': 'Seamless connection of your Property Management System, channel manager and OTA portals to your website. Automatic availability and price synchronisation, no manual effort.',
    'services.guest_automation': 'Guest Experience Automation',
    'services.guest_automation_desc': 'Automated pre-arrival communication, digital check-in forms, WhatsApp and email workflows, and post-stay follow-ups for more reviews and returning guests.',

    // Service Packages
    'packages.title': 'Detailed Service Packages',
    'packages.subtitle': 'Modular and scalable packages',
    'packages.note': 'Packages are flexible in scale; configured according to project and industry requirements.',
    'packages.launch_web': 'Launch Web',
    'packages.launch_web_subtitle': 'Quick setup for small/medium-sized brands',
    'packages.launch_web_desc': 'Information architecture, multilingual template, SEO foundation, 5–7 pages • Integrations: forms, maps, basic analytics',
    'packages.launch_web_price': 'Get in touch for scope details',
    'packages.growth_web': 'Growth Web+',
    'packages.growth_web_subtitle': 'Conversion-focused, data-driven site',
    'packages.growth_web_desc': 'Custom design, speed optimization, blog/product structure • A/B testing, content pipeline, advanced analytics',
    'packages.growth_web_price': 'Request a tailored proposal',
    'packages.ai_automation': 'AI Automation',
    'packages.ai_automation_subtitle': 'Process automation and integration',
    'packages.ai_automation_desc': 'Data collection/sync, content automation, agent/tool orchestration • Management panel and reporting',
    'packages.ai_automation_price': 'Let\'s define the solution together',
    'packages.social_media_pro': 'Social Media Pro',
    'packages.social_media_pro_subtitle': 'Strategy + production + advertising',
    'packages.social_media_pro_desc': 'Monthly content plan (TR/EN/DE/RU), production and publication • Performance reporting, optimization',
    'packages.social_media_pro_price': 'Co-create the plan with our team',
    'packages.translation': 'Translation & Localization',
    'packages.translation_subtitle': 'Sworn/certified translation',
    'packages.translation_desc': 'Sworn/certified translation, technical/academic quality assurance',
    'packages.translation_price': 'Contact us to discuss languages & scope',

    // Projects
    'projects.title': 'Projects',
    'projects.subtitle': 'AI-native case snapshots',
    'projects.description': 'AI-powered solutions and success stories we deliver for partners in Cyprus and beyond.',
    'projects.visit': 'View All',
    'projects.visit_project': 'View Project',
    'projects.cta': 'Let\'s Talk',
    'projects.start.title': 'Launch Your Project',
    'projects.start.description': 'Ready to turn your idea into reality with AI-driven execution? Our team is here to guide your digital transformation.',
    'projects.start.cta': 'Start My Project',
    'projects.start.email': 'Send a project brief via email',
    'projects.start.email_desc': 'Share your goals with info@fures.at and receive a tailored roadmap.',
    'projects.start.whatsapp': 'Chat quickly on WhatsApp',
    'projects.start.whatsapp_desc': 'Message us at +90 548 876 68 19 and get a reply within one business day.',
    'projects.start.phone': 'Call us directly',
    'projects.start.phone_desc': 'Reach our team during business hours for immediate support.',
    'projects.start_heading': 'Ready to kick off your project?',
    'projects.start_body': 'Tell us about your objectives and we will map the right solution. Our AI-native team supports you from discovery to launch.',
    'projects.start_primary_cta': 'Talk to our team',
    'projects.start_secondary_cta': 'Browse all projects',

    // Why Fures
    'why_fures.title': 'Why Fures Tech?',
    'why_fures.description': 'Designer sensitivity + Engineer mind + AI reflex. In the TRNC digital ecosystem we build the right systems, not just current tools: sustainable, measurable, and transferable.',

    // Team
    'team.badge': 'Our Team',
    'team.title': 'Team',
    'team.gulben.name': 'Gülben Eser',
    'team.gulben.role': 'Founder',
    'team.gulben.description': 'Design, content, quality and project management',
    'team.furkan.name': 'Furkan Yonat',
    'team.furkan.role': 'Co-Founder',
    'team.furkan.description': 'System architecture, automation, integration and growth',

    // Pricing
    'pricing.title': 'Pricing',
    'pricing.subtitle': 'Transparent and modular',
    'pricing.description': 'Packages can be combined as needed; we proceed with fixed scope + sprint approach.',
    'pricing.cta': 'Get Quote',
    'pricing.cta_desc': 'Summary solution and estimated budget within 48 hours.',

    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'What are the timelines?',
    'faq.a1': 'Launch Web 2–4 weeks, Growth Web+ 4–8 weeks; automation and integrations vary by scope.',
    'faq.q2': 'Support/warranty?',
    'faq.a2': '30-day stabilization after go-live; optional monthly maintenance/improvement plan.',
    'faq.q3': 'Data security?',
    'faq.a3': 'Roles, access levels, and logging are standard. We apply best practices with third-party services.',
    'faq.q4': 'Which languages?',
    'faq.a4': 'TR/EN/DE/RU primarily, expandable on demand.',

    // Contact
    'contact.title': 'Contact',
    'contact.subtitle': 'We\'re here to help.',
    'contact.description': 'Let\'s move quickly from idea to live with our expert team.',
    'contact.email': 'Email',
    'contact.headquarters': 'Headquarters',
    'contact.headquarters_location': 'Famagusta, North Cyprus (TRNC)',
    'contact.second_location': 'Second Location',
    'contact.second_location_place': 'Istanbul, Turkey',
    'contact.phone': 'Phone',
    'contact.phone_at': '+43 664 99735268',
    'contact.send_message': 'Send Message',
    'contact.schedule_meeting': 'Schedule Meeting',

    // Footer
    'footer.copyright': '© 2025 Fures Tech — fures.at · All rights reserved.',
    'footer.privacy': 'Privacy',
    'footer.cookies': 'Cookies',
    'footer.kvkk': 'GDPR/Disclosure',

    // Form
    'form.title': 'Let\'s spark your project.',
    'form.name': 'Full Name',
    'form.email': 'Email',
    'form.company': 'Company',
    'form.needs': 'Need(s)',
    'form.budget': 'Budget Range',
    'form.date': 'Date',
    'form.submit': 'Prepare Quote',
    'form.success': 'Thank you! We\'ll get back to you within 1 business day.',
    'form.error': 'Something went wrong. Please check the fields.',
  },
  ru: {
    // Header
    'nav.home': 'Главная',
    'nav.about': 'О нас',
    'nav.services': 'Услуги',
    'nav.projects': 'Проекты',
    'nav.campaigns': 'Кампании',
    'nav.blog': 'Блог',
    'nav.contact': 'Контакты',
    'nav.more': 'Больше',
    'nav.lets_talk': 'Давайте поговорим',

    // Blog
    'blog.title': 'Блог Fures',
    'blog.subtitle': 'Ежедневные новости об ИИ и заметки о цифровой трансформации.',
    'blog.no_posts': 'В этой языковой версии пока нет записей.',
    'blog.read_more': 'Читать дальше',
    'blog.back_to_list': 'Назад к блогу',
    'blog.not_found': 'Статья не найдена',
    'blog.not_found_description': 'Возможно, запись была перемещена или удалена. Посмотрите другие публикации.',

    // Campaigns
    'campaigns.title': 'Кампании Fures',
    'campaigns.subtitle': 'Ежедневные AI-кампании для Турции и Северного Кипра.',
    'campaigns.no_posts': 'Кампании доступны только на турецком языке. Загляните позже.',
    'campaigns.read_more': 'Подробнее',
    'campaigns.back_to_list': 'Назад к кампаниям',
    'campaigns.not_found': 'Кампания не найдена',
    'campaigns.not_found_description': 'Возможно, кампания удалена. Посмотрите актуальные материалы.',

    // SEO
    'seo.site_name': 'Fures Tech · Цифровое агентство Северного Кипра',
    'seo.tagline': 'Веб-дизайн, автоматизация на базе ИИ, соцсети и рост бизнеса',
    'seo.common.keywords': 'северный кипр веб-дизайн, кипр цифровое агентство, famagusta веб студия, кипр seo, кипр автоматизация ии, кипр управление соцсетями, северный кипр digital agency',
    'seo.organization.description': 'Fures Tech — многоязычное цифровое агентство из Фамагусты. Мы создаём веб-сайты, автоматизацию на базе ИИ и стратегии роста для отелей, туристических компаний, e-commerce и сервисных бизнесов на Северном Кипре и соседних рынках.',
    'seo.home.title': 'Fures Tech | Веб-дизайн и автоматизация ИИ на Северном Кипре',
    'seo.home.description': 'Fures Tech разрабатывает индивидуальные сайты, автоматизацию на базе ИИ, управление соцсетями и маркетинг на основе данных для компаний на Северном Кипре и в Турции. Многоязычные и SEO-дружественные решения помогают вам выходить в топ выдачи.',
    'seo.home.keywords': 'северный кипр digital agency, кипр social media agency, кипр автоматизация ии, кипр seo консалтинг, famagusta маркетинговое агентство',
    'seo.about.title': 'О нас | Цифровое агентство Fures Tech',
    'seo.about.description': 'Команда Fures Tech сочетает опыт в дизайне, разработке, автоматизации и росте бизнеса, обеспечивая полный цикл цифровой трансформации для брендов Северного Кипра и мира.',
    'seo.about.keywords': 'команда fures tech, кипр цифровые эксперты, северный кипр технологическая компания',
    'seo.services.title': 'Услуги | Веб-дизайн, автоматизация ИИ и соцсети на Кипре',
    'seo.services.description': 'Fures Tech помогает вашему бизнесу расти: веб-разработка, автоматизация процессов, управление соцсетями, аналитика и многоязычный контент.',
    'seo.services.keywords': 'северный кипр веб услуги, кипр автоматизация процессов, кипр управление соцсетями, кипр аналитика данных',
    'seo.campaigns.title': 'Кампании | Ежедневные AI-планы Fures Tech',
    'seo.campaigns.description': 'Fures Tech ежедневно готовит AI-кампании, автоматизации и контент-пакеты для Турции и Северного Кипра.',
    'seo.campaigns.keywords': 'fures кампании, турция ai маркетинг, северный кипр реклама, автоматизация кампаний, social media kit',
    'seo.projects.title': 'Проекты | Кейсы Fures Tech',
    'seo.projects.description': 'Изучите проекты по веб-дизайну, автоматизации ИИ и росту, реализованные нами на Северном Кипре и на международных рынках.',
    'seo.projects.keywords': 'северный кипр веб проекты, кипр проекты по ИИ, цифровая трансформация кипр кейсы',
    'seo.team.title': 'Команда | Основатели и эксперты Fures Tech',
    'seo.team.description': 'Познакомьтесь с основателями и экспертами Fures Tech — дизайнерами и инженерами, создающими многоязычные цифровые продукты и системы ИИ.',
    'seo.team.keywords': 'основатели fures tech, команда fures tech, кипр технологические эксперты',
    'seo.faq.title': 'FAQ | Fures Tech',
    'seo.faq.description': 'Ответы на популярные вопросы о наших услугах, сроках, поддержке и защите данных.',
    'seo.faq.keywords': 'северный кипр веб-дизайн вопросы, кипр цифровое агентство цены, fures tech поддержка',
    'seo.contact.title': 'Контакты | Цифровое агентство Fures Tech на Северном Кипре',
    'seo.contact.description': 'Свяжитесь с Fures Tech. Команда из Фамагусты готова обсудить веб-дизайн, автоматизацию ИИ и продвижение в соцсетях.',
    'seo.contact.keywords': 'fures tech контакты, северный кипр digital agency контакты, famagusta веб-дизайн связь',
    'seo.profile.furkanyonat.title': 'Фуркан Йонат — цифровое резюме | Fures Tech',
    'seo.profile.furkanyonat.description': 'Изучите цифровое портфолио и проекты сооснователя Fures Tech Фуркана Йоната с акцентом на автоматизацию и ИИ.',
    'seo.profile.furkanyonat.keywords': 'furkan yonat, fures tech сооснователь, кипр специалист по ИИ',
    'seo.profile.gulbeneser.title': 'Гюльбен Эсер — портфолио | Fures Tech',
    'seo.profile.gulbeneser.description': 'Познакомьтесь с опытом Гюльбен Эсер в дизайне, контент-стратегии и управлении проектами в Fures Tech.',
    'seo.profile.gulbeneser.keywords': 'gülben eser, fures tech основатель, кипр креативный директор',
    'seo.profile.kariyer.title': 'Карьера Fures Tech | Автоматизированный помощник по найму',
    'seo.profile.kariyer.description': 'Платформа Fures Tech использует ИИ для оценки кандидатов, симуляции собеседований и автоматического создания вакансий.',
    'seo.profile.kariyer.keywords': 'fures tech карьера, кипр автоматизация найма, ассистент по найму на базе ИИ',
    'seo.privacy.title': 'Политика конфиденциальности | Fures Tech',
    'seo.privacy.description': 'Узнайте, как Fures Tech обрабатывает и защищает персональные данные в соответствии с KVKK и GDPR.',
    'seo.privacy.keywords': 'политика конфиденциальности кипр, kvkk privacy, защита данных fures tech',
    'seo.cookies.title': 'Политика файлов cookie | Fures Tech',
    'seo.cookies.description': 'Категории, цели и управление cookie-файлами, которые мы используем на сайте Fures Tech.',
    'seo.cookies.keywords': 'cookie политика, маркетинговые cookies, аналитические cookies, fures tech',
    'seo.kvkk.title': 'Уведомление KVKK | Fures Tech',
    'seo.kvkk.description': 'Подробная информация о целях обработки данных, правовых основаниях, передаче и правах субъектов данных Fures Tech.',
    'seo.kvkk.keywords': 'kvkk уведомление, обработка персональных данных кипр, оператор данных северный кипр',

    // Hero
    'hero.title': 'Цифровое Агентство',
    'hero.rotating': 'Цифровое агентство|Умная система|Креативная автоматизация|Fures Tech',
    'hero.subtitle': 'За Пределами Границ.',
    'hero.ai_powered': 'Дизайн, Код и Рост на основе ИИ.',
    'hero.description': 'Умная автоматизация, впечатляющий веб-опыт и маркетинг на основе данных для вашего бренда. Быстро, измеримо, масштабируемо.',
    'hero.badge': 'Цифровое агентство с ИИ в основе',
    'hero.cta_discover': 'Узнать Больше',
    'hero.cta_pricing': 'Посмотреть Цены',
    'hero.cta_talk': 'Давайте Поговорим',
    'hero.secondary_cta': 'Рассказать о проекте →',

    // Quotes
    'quotes.items': 'Мы масштабируемся не технологиями, а интеллектом.|Fures = дизайн умных систем|Эстетика ≠ роскошь, это функция|ИИ = творческая скорость',

    // Why Us
    'why_us.title': 'ИИ-нативный подход. Реальные результаты.',
    'why_us.subtitle': 'Почему Мы',
    'why_us.operational': 'Операционная Эффективность',
    'why_us.operational_desc': 'Автоматизирует повторяющиеся задачи, снижает затраты, экономит время.',
    'why_us.design_engineering': 'Дизайн + Инжиниринг',
    'why_us.design_engineering_desc': 'Мы объединяем эстетику с производительностью.',
    'why_us.data_driven': 'Решения на Основе Данных',
    'why_us.data_driven_desc': 'Панели, отчеты, A/B тесты для понимания того, что работает.',
    'why_us.industry_depth': 'Отраслевая Глубина',
    'why_us.industry_depth_desc': 'Туризм-гостиничный бизнес, электронная коммерция/каталоги продуктов (дермокосметика и ветеринария), продажа впечатлений и мероприятий.',

    // Benefits
    'benefits.title': 'Что Мы Предоставляем',
    'benefits.customer_experience': 'Улучшенный Клиентский Опыт',
    'benefits.customer_experience_desc': 'Повышение вовлеченности и удовлетворенности',
    'benefits.efficiency': 'Повышение Эффективности',
    'benefits.efficiency_desc': 'Умная автоматизация процессов',
    'benefits.better_decisions': 'Лучшие Решения',
    'benefits.better_decisions_desc': 'Прозрачный поток данных и аналитики',

    // Mission
    'mission.title': 'Наша Миссия',
    'mission.description': 'Вывести бизнес на вершину своей области с помощью комплексной автоматизации ИИ и вневременного дизайна.',
    'mission.priority': 'Наш приоритет: ясность, скорость и долговечная эстетика.',
    'mission.cta': 'Назначить Встречу',

    // Services
    'services.title': 'Услуги',
    'services.seo': 'Поисковая оптимизация (SEO)',
    'services.seo_desc': 'Больше органической видимости в Google. Мы оптимизируем ваш отельный сайт под нужные запросы — чтобы гости находили вас раньше конкурентов.',
    'services.local_seo': 'Google Maps и локальное SEO',
    'services.local_seo_desc': 'Ваш объект на цифровой карте: оптимизированный профиль Google Business, единые данные, локальные цитирования и стратегии работы с отзывами.',
    'services.social_media': 'Управление социальными сетями',
    'services.social_media_desc': 'Профессиональное присутствие в Instagram, Facebook и других каналах. Регулярный контент, который укрепляет бренд и стимулирует бронирования.',
    'services.hotel_web': 'Сайт отеля с модулем бронирования',
    'services.hotel_web_desc': 'Многоязычные, оптимизированные под конверсию сайты отелей со встроенным модулем бронирования. Мобильные, быстрые — для прямых бронирований без комиссий.',
    'services.hotel_pms': 'Интеграция систем управления отелем',
    'services.hotel_pms_desc': 'Бесшовное подключение вашей PMS, менеджера каналов и порталов OTA к сайту. Автоматическая синхронизация доступности и цен без ручного труда.',
    'services.guest_automation': 'Автоматизация клиентского опыта',
    'services.guest_automation_desc': 'Автоматические коммуникации до заезда, цифровые формы регистрации, WhatsApp и email-воркфлоу, а также постпребывательная работа для получения отзывов.',

    // Service Packages
    'packages.title': 'Подробные Пакеты Услуг',
    'packages.subtitle': 'Модульные и масштабируемые пакеты',
    'packages.note': 'Пакеты гибкие по масштабу; настроены в соответствии с требованиями проекта и отрасли.',
    'packages.launch_web': 'Launch Web',
    'packages.launch_web_subtitle': 'Быстрая настройка для малого/среднего бизнеса',
    'packages.launch_web_desc': 'Информационная архитектура, многоязычный шаблон, основа SEO, 5–7 страниц • Интеграции: формы, карты, базовая аналитика',
    'packages.launch_web_price': 'Свяжитесь с нами, чтобы обсудить объём',
    'packages.growth_web': 'Growth Web+',
    'packages.growth_web_subtitle': 'Ориентированный на конверсию сайт на основе данных',
    'packages.growth_web_desc': 'Индивидуальный дизайн, оптимизация скорости, структура блога/продукта • A/B тестирование, конвейер контента, расширенная аналитика',
    'packages.growth_web_price': 'Запросите индивидуальное предложение',
    'packages.ai_automation': 'AI Automation',
    'packages.ai_automation_subtitle': 'Автоматизация процессов и интеграция',
    'packages.ai_automation_desc': 'Сбор/синхронизация данных, автоматизация контента, оркестрация агентов/инструментов • Панель управления и отчетность',
    'packages.ai_automation_price': 'Обсудим решение под ваши задачи',
    'packages.social_media_pro': 'Social Media Pro',
    'packages.social_media_pro_subtitle': 'Стратегия + производство + реклама',
    'packages.social_media_pro_desc': 'Ежемесячный план контента (TR/EN/DE/RU), производство и публикация • Отчетность о производительности, оптимизация',
    'packages.social_media_pro_price': 'Сформируем план вместе с вами',
    'packages.translation': 'Перевод и Локализация',
    'packages.translation_subtitle': 'Присяжный/сертифицированный перевод',
    'packages.translation_desc': 'Присяжный/сертифицированный перевод, техническое/академическое обеспечение качества',
    'packages.translation_price': 'Свяжитесь с нами для деталей и языков',

    // Projects
    'projects.title': 'Проекты',
    'projects.subtitle': 'Наши кейсы на основе ИИ',
    'projects.description': 'Наши решения на основе искусственного интеллекта и истории успеха клиентов.',
    'projects.visit': 'Посмотреть Все',
    'projects.visit_project': 'Посмотреть проект',
    'projects.cta': 'Давайте Поговорим',
    'projects.start.title': 'Запустите свой проект',
    'projects.start.description': 'Готовы превратить идею в реальность с помощью ИИ? Команда Fures Tech проведет вас через цифровую трансформацию.',
    'projects.start.cta': 'Запустить проект',
    'projects.start.email': 'Отправить бриф на e-mail',
    'projects.start.email_desc': 'Поделитесь задачами на info@fures.at и получите персональный план.',
    'projects.start.whatsapp': 'Быстрый диалог в WhatsApp',
    'projects.start.whatsapp_desc': 'Напишите на +90 548 876 68 19 — ответим в течение одного рабочего дня.',
    'projects.start.phone': 'Позвоните нам напрямую',
    'projects.start.phone_desc': 'Свяжитесь с командой в рабочие часы и обсудите проект сразу.',
    'projects.start_heading': 'Готовы начать новый проект?',
    'projects.start_body': 'Расскажите о целях — мы предложим оптимальное решение. Наша команда, работающая с ИИ, сопровождает проект от идеи до запуска.',
    'projects.start_primary_cta': 'Связаться с нами',
    'projects.start_secondary_cta': 'Все проекты',

    // Why Fures
    'why_fures.title': 'Почему Fures Tech?',
    'why_fures.description': 'Чувствительность дизайнера + Разум инженера + Рефлекс ИИ. Мы создаем правильные системы, а не просто текущие инструменты: устойчивые, измеримые и передаваемые.',

    // Team
    'team.badge': 'Наша Команда',
    'team.title': 'Команда',
    'team.gulben.name': 'Гюльбен Эсер',
    'team.gulben.role': 'Основатель',
    'team.gulben.description': 'Дизайн, контент, качество и управление проектами',
    'team.furkan.name': 'Фуркан Йонат',
    'team.furkan.role': 'Со-основатель',
    'team.furkan.description': 'Архитектура систем, автоматизация, интеграция и рост',

    // Pricing
    'pricing.title': 'Цены',
    'pricing.subtitle': 'Прозрачно и модульно',
    'pricing.description': 'Пакеты можно комбинировать по мере необходимости; мы работаем с фиксированным объемом + спринт-подход.',
    'pricing.cta': 'Получить Предложение',
    'pricing.cta_desc': 'Краткое решение и предполагаемый бюджет в течение 48 часов.',

    // FAQ
    'faq.title': 'Часто Задаваемые Вопросы',
    'faq.q1': 'Какие сроки?',
    'faq.a1': 'Launch Web 2–4 недели, Growth Web+ 4–8 недель; автоматизация и интеграции варьируются в зависимости от объема.',
    'faq.q2': 'Поддержка/гарантия?',
    'faq.a2': '30-дневная стабилизация после запуска; опциональный ежемесячный план обслуживания/улучшения.',
    'faq.q3': 'Безопасность данных?',
    'faq.a3': 'Роли, уровни доступа и логирование являются стандартными. Мы применяем лучшие практики со сторонними сервисами.',
    'faq.q4': 'Какие языки?',
    'faq.a4': 'В основном TR/EN/DE/RU, расширяемо по запросу.',

    // Contact
    'contact.title': 'Контакты',
    'contact.subtitle': 'Мы здесь, чтобы помочь.',
    'contact.description': 'Давайте быстро перейдем от идеи к реализации с нашей командой экспертов.',
    'contact.email': 'Электронная почта',
    'contact.headquarters': 'Штаб-квартира',
    'contact.headquarters_location': 'Фамагуста, ТРСК',
    'contact.second_location': 'Второй Офис',
    'contact.second_location_place': 'Стамбул, Турция',
    'contact.phone': 'Телефон',
    'contact.phone_at': '+43 664 99735268',
    'contact.send_message': 'Отправить Сообщение',
    'contact.schedule_meeting': 'Назначить Встречу',

    // Footer
    'footer.copyright': '© 2025 Fures Tech — fures.at · Все права защищены.',
    'footer.privacy': 'Конфиденциальность',
    'footer.cookies': 'Куки',
    'footer.kvkk': 'GDPR/Раскрытие',

    // Form
    'form.title': 'Давайте зажжем ваш проект.',
    'form.name': 'Полное Имя',
    'form.email': 'Электронная почта',
    'form.company': 'Компания',
    'form.needs': 'Потребность(и)',
    'form.budget': 'Диапазон Бюджета',
    'form.date': 'Дата',
    'form.submit': 'Подготовить Предложение',
    'form.success': 'Спасибо! Мы свяжемся с вами в течение 1 рабочего дня.',
    'form.error': 'Что-то пошло не так. Пожалуйста, проверьте поля.',
  },
  de: {
    // Nav
    'nav.home': 'Startseite',
    'nav.about': 'Über uns',
    'nav.services': 'Leistungen',
    'nav.projects': 'Referenzen',
    'nav.campaigns': 'Kampagnen',
    'nav.blog': 'Blog',
    'nav.contact': 'Kontakt',
    'nav.more': 'Mehr',
    'nav.lets_talk': 'Beratung anfragen',

    // Blog
    'blog.title': 'Fures Blog',
    'blog.subtitle': 'Einblicke zu Digital, Hotel-Marketing und lokaler SEO im DACH-Raum.',
    'blog.no_posts': 'Für diese Sprache sind noch keine Beiträge verfügbar.',
    'blog.read_more': 'Weiterlesen',
    'blog.back_to_list': 'Zurück zum Blog',
    'blog.not_found': 'Beitrag nicht gefunden',
    'blog.not_found_description': 'Der gesuchte Artikel wurde möglicherweise verschoben. Entdecken Sie unsere aktuellen Beiträge.',

    // Campaigns
    'campaigns.title': 'Fures Kampagnen',
    'campaigns.subtitle': 'Tägliche KI-gestützte Kampagnenimpulse für die Hotellerie.',
    'campaigns.no_posts': 'Kampagnen sind derzeit auf Türkisch verfügbar. Bald auch auf Deutsch.',
    'campaigns.read_more': 'Details ansehen',
    'campaigns.back_to_list': 'Zurück zu Kampagnen',
    'campaigns.not_found': 'Kampagne nicht gefunden',
    'campaigns.not_found_description': 'Diese Kampagne wurde möglicherweise entfernt. Sehen Sie sich unsere aktuellen Angebote an.',

    // SEO
    'seo.site_name': 'Fures Tech · Hotel-Digitalpartner für DACH',
    'seo.tagline': 'Hotel-Website, Local SEO & Gästekommunikation für Österreich, Deutschland & Schweiz',
    'seo.common.keywords': 'hotel website österreich, hotel seo dach, google maps hotel optimierung, hotelmanagementsoftware integration, hotel social media management, direktbuchungen steigern, hotel digital marketing salzburg, hotel webseite österreich',
    'seo.organization.description': 'Fures Tech ist ein auf Hotellerie und Tourismus spezialisiertes Digitalunternehmen mit Büro in Maria Alm, Salzburgerland. Wir entwickeln Hotel-Webseiten, optimieren lokale Suchpräsenz und automatisieren die Gästekommunikation für Hotels und Gastronomiebetriebe im DACH-Raum.',
    'seo.home.title': 'Fures Tech | Hotel-Website, Local SEO & Direktbuchungen | Salzburgerland',
    'seo.home.description': 'Fures Tech aus Maria Alm im Salzburgerland entwickelt maßgeschneiderte Hotel-Webseiten mit Buchungsmotor, Google Maps Optimierung und automatisierte Gästekommunikation für Hotels und Tourismusbetriebe in Österreich, Deutschland und der Schweiz.',
    'seo.home.keywords': 'hotel website österreich, hotel seo salzburg, local seo hotel dach, hotel buchungsmotor, direktbuchungen steigern österreich, hotel webseite salzburgerland, google maps hotel optimierung, hotel digital agentur austria',
    'seo.about.title': 'Über uns | Fures Tech – Ihr Hotel-Digitalpartner',
    'seo.about.description': 'Fures Tech verbindet Design, Technologie und Hotellerie-Know-how für nachhaltige digitale Präsenz. Unser Team aus Maria Alm, Salzburgerland, betreut Hotelbetriebe im gesamten DACH-Raum.',
    'seo.about.keywords': 'fures tech hotel agentur, digitalpartner hotellerie österreich, hotel marketing salzburg',
    'seo.services.title': 'Leistungen | Hotel-Website, SEO & Automatisierung | Fures Tech',
    'seo.services.description': 'Fures Tech bietet Hotel-Webseiten mit Buchungsmotor, Google Maps Optimierung, Social-Media-Management, Hotelmanagementsoftware-Integration und Gästeerlebnis-Automatisierung für Hotels im DACH-Raum.',
    'seo.services.keywords': 'hotel webseite erstellen österreich, hotel seo dach, google maps hotel, hotel pms integration, gästekommunikation automatisieren, hotel social media österreich',
    'seo.campaigns.title': 'Kampagnen | Fures Tech Hotel-Marketing',
    'seo.campaigns.description': 'Aktuelle digitale Marketingimpulse und Kampagnenideen für Hotels und Tourismusbetriebe im DACH-Raum.',
    'seo.campaigns.keywords': 'hotel marketing kampagnen österreich, dach tourismus marketing, hotel social media kampagne',
    'seo.projects.title': 'Referenzen | Fures Tech Hotel-Projekte',
    'seo.projects.description': 'Entdecken Sie unsere Hotel-Website-Projekte, SEO-Erfolge und Digitalprojekte für die Hotellerie im DACH-Raum.',
    'seo.projects.keywords': 'hotel website referenzen österreich, hotel seo projekte, dach hotellerie digital',
    'seo.team.title': 'Team | Fures Tech – Ihr Hotel-Digitalexperte',
    'seo.team.description': 'Lernen Sie das Team hinter Fures Tech kennen – Digitalexperten mit Hotellerie-Erfahrung und Sitz im Salzburgerland.',
    'seo.team.keywords': 'fures tech team, hotel digital experten österreich, digitalpartner salzburgerland',
    'seo.faq.title': 'Häufige Fragen | Fures Tech Hotel-Digital',
    'seo.faq.description': 'Antworten auf häufige Fragen zu Hotel-Websites, Local SEO, Buchungsmotor-Integration und Gästekommunikation.',
    'seo.faq.keywords': 'hotel website fragen österreich, hotel seo faq, buchungsmotor integration fragen',
    'seo.contact.title': 'Kontakt | Fures Tech – Maria Alm, Salzburgerland',
    'seo.contact.description': 'Kontaktieren Sie Fures Tech in Maria Alm, Salzburgerland. Wir beraten Hotels und Tourismusbetriebe im DACH-Raum kostenlos zu Website, SEO und Gästedigitalisierung.',
    'seo.contact.keywords': 'fures tech kontakt, hotel digital agentur salzburg kontakt, hotel marketing beratung österreich, maria alm digital agentur',
    'seo.profile.furkanyonat.title': 'Furkan Yonat | Fures Tech',
    'seo.profile.furkanyonat.description': 'Mitgründer von Fures Tech – Systemarchitektur, Automatisierung und digitales Wachstum für Hotellerie.',
    'seo.profile.furkanyonat.keywords': 'furkan yonat fures tech, hotel digital experte',
    'seo.profile.gulbeneser.title': 'Gülben Eser | Fures Tech',
    'seo.profile.gulbeneser.description': 'Gründerin von Fures Tech – Design, Inhalt und Projektmanagement für Hotellerie-Digitalprojekte.',
    'seo.profile.gulbeneser.keywords': 'gülben eser fures tech, hotel design expertin',
    'seo.profile.kariyer.title': 'Karriere | Fures Tech',
    'seo.profile.kariyer.description': 'Werden Sie Teil von Fures Tech und gestalten Sie die Digitalisierung der Hotellerie mit.',
    'seo.profile.kariyer.keywords': 'fures tech karriere, hotel digital jobs',
    'seo.privacy.title': 'Datenschutzerklärung | Fures Tech',
    'seo.privacy.description': 'Erfahren Sie, wie Fures Tech personenbezogene Daten gemäß DSGVO verarbeitet und schützt.',
    'seo.privacy.keywords': 'datenschutz fures tech, dsgvo hotel website, datenschutzerklärung österreich',
    'seo.cookies.title': 'Cookie-Richtlinie | Fures Tech',
    'seo.cookies.description': 'Informationen zu den Cookies, die Fures Tech verwendet, und wie Sie Ihre Präferenzen verwalten können.',
    'seo.cookies.keywords': 'cookies fures tech, cookie richtlinie österreich, dsgvo cookies',
    'seo.kvkk.title': 'Datenschutzhinweis | Fures Tech',
    'seo.kvkk.description': 'Detaillierte Informationen zur Datenverarbeitung, Rechtsgrundlagen und Betroffenenrechten bei Fures Tech.',
    'seo.kvkk.keywords': 'datenschutzhinweis fures tech, dsgvo österreich, betroffenenrechte',

    // Hero
    'hero.title': 'Hotel-Digitalpartner',
    'hero.rotating': 'Hotel-Webseiten|Lokale SEO|Google Maps|Gäste-Automatisierung',
    'hero.subtitle': 'Mehr Direktbuchungen. Mehr Sichtbarkeit.',
    'hero.ai_powered': 'Digitale Lösungen für Hotels & Gastronomie im DACH-Raum.',
    'hero.description': 'Von Maria Alm im Salzburgerland betreuen wir Hotels, Gasthöfe und Tourismusbetriebe in Österreich, Deutschland und der Schweiz. Professionelle Webseiten mit Buchungsmotor, lokale Suchoptimierung und automatisierte Gästekommunikation — alles aus einer Hand.',
    'hero.badge': 'Hotel-Digitalpartner | Maria Alm, Salzburgerland',
    'hero.cta_discover': 'Leistungen entdecken',
    'hero.cta_pricing': 'Preise ansehen',
    'hero.cta_talk': 'Beratung anfragen',
    'hero.secondary_cta': 'Jetzt Beratung anfragen →',

    // Quotes
    'quotes.items': 'Mehr Direktbuchungen durch kluge Digitalisierung.|Fures = Hotellerie trifft Technologie|Ihre Website ist Ihr bester Verkäufer.|Automatisierung schafft Zeit für Ihre Gäste.',

    // Why Us
    'why_us.title': 'Wir verstehen die Hotellerie.',
    'why_us.subtitle': 'Warum Fures Tech',
    'why_us.operational': 'Zeitsparende Automatisierung',
    'why_us.operational_desc': 'Reservierungsbestätigungen, Bewertungsanfragen und Gästenachrichten laufen automatisch — Sie konzentrieren sich auf das Wesentliche: Ihre Gäste.',
    'why_us.design_engineering': 'Design & Technik aus einer Hand',
    'why_us.design_engineering_desc': 'Ästhetische, schnelle und technisch saubere Hotel-Webseiten — DSGVO-konform, barrierefrei und für alle Geräte optimiert.',
    'why_us.data_driven': 'Datenbasierte Entscheidungen',
    'why_us.data_driven_desc': 'Klare Google Analytics-Berichte, Buchungsstatistiken und A/B-Tests zeigen Ihnen, was wirklich funktioniert.',
    'why_us.industry_depth': 'Hotellerie-Expertise',
    'why_us.industry_depth_desc': 'Von Boutique-Hotels in Salzburg bis zu Stadthotels in Wien und München — wir kennen die Anforderungen der DACH-Hotellerie.',

    // Benefits
    'benefits.title': 'Was Sie gewinnen',
    'benefits.customer_experience': 'Besseres Gästeerlebnis',
    'benefits.customer_experience_desc': 'Vom ersten Google-Klick bis zur Bewertung nach dem Aufenthalt — ein nahtloses digitales Erlebnis.',
    'benefits.efficiency': 'Weniger Verwaltungsaufwand',
    'benefits.efficiency_desc': 'Automatisierte Abläufe sparen Zeit und Personalressourcen.',
    'benefits.better_decisions': 'Klarere Zahlen',
    'benefits.better_decisions_desc': 'Transparente Berichte und Buchungsstatistiken für fundierte Entscheidungen.',

    // Mission
    'mission.title': 'Unsere Mission',
    'mission.description': 'Hotels und Tourismusbetriebe im DACH-Raum durch professionelle Webseiten, lokale Sichtbarkeit und smarte Gästekommunikation nachhaltig erfolgreicher zu machen.',
    'mission.priority': 'Unser Anspruch: Verständlichkeit, Verlässlichkeit und messbarer Erfolg.',
    'mission.cta': 'Kostenloses Erstgespräch vereinbaren',

    // Services
    'services.title': 'Unsere Leistungen',
    'services.seo': 'Suchmaschinenoptimierung (SEO)',
    'services.seo_desc': 'Mehr organische Sichtbarkeit auf Google. Wir optimieren Ihre Hotel-Website gezielt für relevante Suchbegriffe — damit Gäste Sie finden, bevor sie zur Konkurrenz gehen.',
    'services.local_seo': 'Google Maps & Lokale SEO',
    'services.local_seo_desc': 'Ihr Betrieb auf der digitalen Landkarte: optimiertes Google-Unternehmensprofil, konsistente Eintragsdetails, lokale Zitate und gezielte Bewertungsstrategien für Ihren Standort im DACH-Raum.',
    'services.social_media': 'Social-Media-Management',
    'services.social_media_desc': 'Professionelle Präsenz auf Instagram, Facebook und weiteren Kanälen. Regelmäßige, authentische Inhalte, die Ihre Marke stärken, Gäste inspirieren und Buchungsanreize schaffen.',
    'services.hotel_web': 'Hotel-Website mit Buchungsmotor',
    'services.hotel_web_desc': 'Mehrsprachige, conversion-optimierte Hotel-Webseiten mit integriertem Buchungsmotor. Mobile-first, schnell geladen, DSGVO-konform — für maximale Direktbuchungen ohne Provisionsverluste.',
    'services.hotel_pms': 'Hotelmanagementsoftware-Integration',
    'services.hotel_pms_desc': 'Nahtlose Anbindung Ihres Property-Management-Systems, Channel-Managers und Online-Buchungsportale an Ihre Website. Automatische Verfügbarkeits- und Preissynchronisation ohne manuellen Aufwand.',
    'services.guest_automation': 'Gästeerlebnis-Automatisierung',
    'services.guest_automation_desc': 'Automatisierte Vor-Anreise-Kommunikation, digitale Check-in-Formulare, WhatsApp- und E-Mail-Workflows sowie Post-Stay-Nachfassung für mehr Bewertungen und wiederkehrende Gäste.',

    // Service Packages
    'packages.title': 'Unsere Leistungspakete',
    'packages.subtitle': 'Modular und individuell anpassbar',
    'packages.note': 'Alle Pakete sind flexibel kombinierbar und werden auf Ihre spezifischen Anforderungen zugeschnitten.',
    'packages.launch_web': 'Hotel-Website Basis',
    'packages.launch_web_subtitle': 'Professioneller Einstieg für kleinere Betriebe',
    'packages.launch_web_desc': 'Mehrsprachige Hotel-Website, Buchungsmotor-Integration, SEO-Grundlagen, mobil-optimiertes Design • Kontaktformular, Google Maps, Bewertungswidget',
    'packages.launch_web_price': 'Unverbindlich anfragen',
    'packages.growth_web': 'Hotel-Website Premium',
    'packages.growth_web_subtitle': 'Conversion-optimiert für mehr Direktbuchungen',
    'packages.growth_web_desc': 'Individuelles Design, erweiterte Buchungsfunktionen, Blog-/Angebotsbereich, A/B-Testing • Analytics-Dashboard, Content-Pipeline, Mehrsprachigkeit DE/EN/FR',
    'packages.growth_web_price': 'Angebot anfordern',
    'packages.ai_automation': 'Gäste-Automatisierung',
    'packages.ai_automation_subtitle': 'Smarte Kommunikation, weniger Aufwand',
    'packages.ai_automation_desc': 'Automatisierte Check-in/Check-out-Kommunikation, WhatsApp-Workflows, Bewertungsanfragen, CRM-Integration • Verwaltungs-Dashboard und monatliche Berichte',
    'packages.ai_automation_price': 'Details besprechen',
    'packages.social_media_pro': 'Social Media Pro',
    'packages.social_media_pro_subtitle': 'Strategie + Produktion + Werbung',
    'packages.social_media_pro_desc': 'Monatlicher Contentplan (DE/EN), Produktion und Veröffentlichung • Performance-Bericht, Optimierung, Saisonkampagnen',
    'packages.social_media_pro_price': 'Plan gemeinsam definieren',
    'packages.translation': 'Mehrsprachigkeit & Lokalisierung',
    'packages.translation_subtitle': 'Professionelle Übersetzung & Lokalisierung',
    'packages.translation_desc': 'Hotel-Website-Übersetzung, lokalisierte Inhalte für verschiedene Märkte, kulturgerechte Anpassung',
    'packages.translation_price': 'Sprachen und Umfang anfragen',

    // Projects
    'projects.title': 'Referenzen',
    'projects.subtitle': 'Digitale Projekte für die Hotellerie',
    'projects.description': 'Ausgewählte Hotel-Website-Projekte und SEO-Erfolge aus dem DACH-Raum.',
    'projects.visit': 'Alle ansehen',
    'projects.visit_project': 'Projekt ansehen',
    'projects.cta': 'Beratung anfragen',
    'projects.start.title': 'Ihr Projekt starten',
    'projects.start.description': 'Bereit für mehr Direktbuchungen und bessere Online-Sichtbarkeit? Unser Team berät Sie kostenlos und unverbindlich.',
    'projects.start.cta': 'Mein Projekt starten',
    'projects.start.email': 'Projektbeschreibung per E-Mail senden',
    'projects.start.email_desc': 'Schreiben Sie uns an info@fures.at — wir antworten innerhalb von 24 Stunden.',
    'projects.start.whatsapp': 'Schnell über WhatsApp kontaktieren',
    'projects.start.whatsapp_desc': 'Senden Sie uns eine Nachricht an +43 664 99735268, wir melden uns innerhalb eines Werktages.',
    'projects.start.phone': 'Direkt anrufen',
    'projects.start.phone_desc': 'Erreichen Sie unser Team während der Geschäftszeiten für ein sofortiges Erstgespräch.',
    'projects.start_heading': 'Gemeinsam Ihr Projekt starten',
    'projects.start_body': 'Erzählen Sie uns von Ihren Zielen — wir entwickeln die passende digitale Strategie. Vom ersten Gespräch bis zum Launch begleiten wir Sie Schritt für Schritt.',
    'projects.start_primary_cta': 'Jetzt Kontakt aufnehmen',
    'projects.start_secondary_cta': 'Alle Referenzen ansehen',

    // Why Fures
    'why_fures.title': 'Warum Fures Tech?',
    'why_fures.description': 'Wir kombinieren Hotellerie-Erfahrung mit moderner Webtechnologie. Mit unserem Büro in Maria Alm kennen wir den DACH-Markt aus erster Hand — und entwickeln Lösungen, die wirklich zum Betrieb passen: nachhaltig, messbar und verständlich erklärt.',

    // Team
    'team.badge': 'Unser Team',
    'team.title': 'Team',
    'team.gulben.name': 'Gülben Eser',
    'team.gulben.role': 'Gründerin',
    'team.gulben.description': 'Design, Inhalt, Qualitätssicherung und Projektmanagement',
    'team.furkan.name': 'Furkan Yonat',
    'team.furkan.role': 'Mitgründer',
    'team.furkan.description': 'Systemarchitektur, Automatisierung, Integration und Wachstum',

    // Pricing
    'pricing.title': 'Preise',
    'pricing.subtitle': 'Transparent und modular',
    'pricing.description': 'Klare Leistungen, faire Konditionen — individuell auf Ihren Betrieb zugeschnitten.',
    'pricing.cta': 'Angebot anfordern',
    'pricing.cta_desc': 'Innerhalb von 48 Stunden erhalten Sie ein individuelles Angebot.',

    // FAQ
    'faq.title': 'Häufige Fragen',
    'faq.q1': 'Wie lange dauert eine Hotel-Website?',
    'faq.a1': 'Eine Basis-Hotel-Website ist in 3–5 Wochen fertig. Premium-Projekte mit individuellen Funktionen dauern 6–10 Wochen.',
    'faq.q2': 'Gibt es Support nach dem Launch?',
    'faq.a2': '30 Tage Stabilisierungsphase inklusive — danach optional monatliche Wartungs- und Optimierungspakete.',
    'faq.q3': 'Ist die Website DSGVO-konform?',
    'faq.a3': 'Ja, alle unsere Websites werden DSGVO-konform umgesetzt: Cookie-Consent, Datenschutzerklärung, sichere Formularverarbeitung.',
    'faq.q4': 'Welche Sprachen werden unterstützt?',
    'faq.a4': 'Standardmäßig Deutsch und Englisch. Auf Wunsch auch Französisch, Russisch, Arabisch und weitere Sprachen.',

    // Contact
    'contact.title': 'Kontakt',
    'contact.subtitle': 'Wir freuen uns auf Ihre Anfrage.',
    'contact.description': 'Unser Team in Maria Alm, Salzburgerland, berät Sie kostenlos und unverbindlich zu Ihrer Hotel-Website und digitalen Strategie.',
    'contact.email': 'E-Mail',
    'contact.headquarters': 'Büro Österreich',
    'contact.headquarters_location': 'Maria Alm, Salzburgerland, Österreich',
    'contact.second_location': 'Internationales Büro',
    'contact.second_location_place': 'Nordzypern (KKTC)',
    'contact.phone': 'Telefon',
    'contact.phone_at': '+43 664 99735268',
    'contact.send_message': 'Nachricht senden',
    'contact.schedule_meeting': 'Termin vereinbaren',

    // Footer
    'footer.copyright': '© 2025 Fures Tech — fures.at · Alle Rechte vorbehalten.',
    'footer.privacy': 'Datenschutz',
    'footer.cookies': 'Cookies',
    'footer.kvkk': 'DSGVO/Datenschutzhinweis',

    // Form
    'form.title': 'Beschreiben Sie uns Ihr Projekt.',
    'form.name': 'Vor- und Nachname',
    'form.email': 'E-Mail-Adresse',
    'form.company': 'Hotel / Betrieb',
    'form.needs': 'Was benötigen Sie?',
    'form.budget': 'Budgetrahmen',
    'form.date': 'Gewünschter Starttermin',
    'form.submit': 'Anfrage senden',
    'form.success': 'Vielen Dank! Wir melden uns innerhalb von 24 Stunden.',
    'form.error': 'Etwas ist schiefgelaufen. Bitte überprüfen Sie Ihre Eingaben.',
  }
};

const STORAGE_KEY = 'fures.language';

const isLanguage = (value: string | null): value is Language =>
  value !== null && SUPPORTED_LANGUAGES.includes(value as Language);

const detectInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const urlLang = new URL(window.location.href).searchParams.get('lang');
  if (isLanguage(urlLang)) {
    return urlLang;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) {
      return stored;
    }
  } catch {
    // ignore storage errors
  }

  if (typeof navigator !== 'undefined') {
    const navigatorLanguages = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
    for (const locale of navigatorLanguages) {
      if (!locale) continue;
      const shortCode = locale.slice(0, 2).toLowerCase();
      if (isLanguage(shortCode)) {
        return shortCode;
      }
    }
  }

  return DEFAULT_LANGUAGE;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage ?? detectInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState((current) => (current === lang ? current : lang));
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const meta = LANGUAGE_META[language];
      const html = document.documentElement;
      html.setAttribute('lang', language);
      html.setAttribute('dir', meta.direction);
      html.setAttribute('data-language', language);
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, language);
      } catch {
        // ignore storage errors
      }

      // Only sync URL params when not using a fixed initialLanguage
      if (initialLanguage === undefined) {
        const url = new URL(window.location.href);
        if (language === DEFAULT_LANGUAGE) {
          url.searchParams.delete('lang');
        } else {
          url.searchParams.set('lang', language);
        }
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [language, initialLanguage]);

  useEffect(() => {
    // Only listen to popstate when not using a fixed initialLanguage
    if (typeof window === 'undefined' || initialLanguage !== undefined) {
      return;
    }

    const handlePopState = () => {
      const urlLang = new URL(window.location.href).searchParams.get('lang');
      setLanguageState((current) => {
        if (isLanguage(urlLang) && urlLang !== current) {
          return urlLang;
        }
        if (!isLanguage(urlLang) && current !== DEFAULT_LANGUAGE) {
          return DEFAULT_LANGUAGE;
        }
        return current;
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialLanguage]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.tr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
