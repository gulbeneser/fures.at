import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'tr' | 'en' | 'ru' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  tr: {
    // Header
    'nav.about': 'Hakkımızda',
    'nav.services': 'Hizmetler',
    'nav.projects': 'Projeler',
    'nav.contact': 'İletişim',
    'nav.more': 'Daha Fazla',
    'nav.lets_talk': 'Hadi Konuşalım',
    
    // Hero
    'hero.title': 'Dijital Ajans',
    'hero.subtitle': 'Sınırların Ötesinde.',
    'hero.ai_powered': 'Yapay Zekâ ile Güçlendirilmiş Tasarım, Kod ve Büyüme.',
    'hero.description': 'Markanız için akıllı otomasyon, etkileyici web deneyimleri ve veriyle çalışan pazarlama. Hızlı, ölçülebilir, ölçeklenebilir.',
    'hero.cta_discover': 'Daha Fazlasını Keşfet',
    'hero.cta_pricing': 'Fiyatları Gör',
    'hero.cta_talk': 'Hadi Konuşalım',
    
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
    'mission.description': 'Geniş kapsamlı yapay zekâ otomasyonu ve zamansız tasarımla işletmeleri kendi kulvarlarında zirveye taşımak.',
    'mission.priority': 'Önceliğimiz: netlik, hız ve kalıcı estetik.',
    'mission.cta': 'Bir Görüşme Ayarla',
    
    // Services
    'services.title': 'Hizmetler',
    'services.web_design': 'Web Tasarımı',
    'services.web_design_desc': 'Kullanıcı deneyimini ve iş büyümesini artıran modern, yüksek performanslı web siteleri tasarlıyor ve geliştiriyoruz',
    'services.ai_automation': 'Akıllı Otomasyon',
    'services.ai_automation_desc': 'Operasyonları kolaylaştırmak, maliyetleri azaltmak ve verimliliği artırmak için yapay zeka destekli otomasyon çözümleri sunuyoruz.',
    'services.social_media': 'Sosyal Medya Yönetimi',
    'services.social_media_desc': 'Veriye dayalı sosyal medya stratejileri oluşturuyor ve çevrimiçi varlığınızı yönetiyoruz, böylece etkileşimi ve marka bilinirliğini en üst düzeye çıkarıyoruz.',
    'services.data_analytics': 'Veri & Analitik',
    'services.data_analytics_desc': 'GTM/GA4, ısı haritaları, dashboard\'lar, ROI takibi, deney tasarımı.',
    'services.cloud_integration': 'Bulut & Entegrasyon',
    'services.cloud_integration_desc': 'API entegrasyonları (ör. rezervasyon/ödeme), yapısal veriler ve altyapı düzeni.',
    'services.certified_translation': 'Onaylı Çeviri Hizmetleri',
    'services.certified_translation_desc': 'Hukuki, akademik ve ticari belgeler için yeminli ve sertifikalı çeviri hizmetleri sunuyoruz, uluslararası standartlara uygunluk ve doğruluğu sağlıyoruz.',
    'services.ad_targeting': 'Reklam Hedefleme (AI)',
    'services.ad_targeting_desc': 'Kitle modelleme, yaratıcı varyasyonları, çok kanallı optimizasyon.',
    'services.ai_content': 'AI Destekli İçerik & Sosyal Strateji',
    'services.ai_content_desc': 'Metin–görsel–video üretimi; marka rehberine bağlı, tutarlı üretim.',
    
    // Service Packages
    'packages.title': 'Ayrıntılı Hizmet Paketleri',
    'packages.subtitle': 'Modüler ve ölçekte esnek paketler',
    'packages.note': 'Paketler ölçekte esnektir; proje ve sektör gereksinimlerine göre yapılandırılır.',
    'packages.launch_web': 'Launch Web',
    'packages.launch_web_subtitle': 'Küçük/orta ölçekli markalar için hızlı kurulum',
    'packages.launch_web_desc': 'Bilgi mimarisi, çok dilli şablon, SEO temeli, 5–7 sayfa • Entegrasyonlar: formlar, haritalar, temel analitik',
    'packages.launch_web_price': 'Başlangıç: 1.200–2.500 EUR',
    'packages.growth_web': 'Growth Web+',
    'packages.growth_web_subtitle': 'Dönüşüm odaklı, veriyle yönetilen site',
    'packages.growth_web_desc': 'Özel tasarım, hız optimizasyonu, blog/ürün yapısı • A/B test, içerik üretim hattı, gelişmiş analitik',
    'packages.growth_web_price': 'Başlangıç: 3.500–6.500 EUR',
    'packages.ai_automation': 'AI Automation',
    'packages.ai_automation_subtitle': 'Süreç otomasyonu ve entegrasyon',
    'packages.ai_automation_desc': 'Veri toplama/senkron, içerik otomasyonu, ajan/araç orkestrasyonu • Yönetim paneli ve raporlama',
    'packages.ai_automation_price': 'Başlangıç: 2.500–8.000 EUR',
    'packages.social_media_pro': 'Sosyal Medya Pro',
    'packages.social_media_pro_subtitle': 'Strateji + üretim + reklam',
    'packages.social_media_pro_desc': 'Aylık içerik planı (TR/EN/DE/RU), prodüksiyon ve yayın • Performans raporu, optimizasyon',
    'packages.social_media_pro_price': 'Aylık: 900–2.400 EUR (+reklam bütçesi)',
    'packages.translation': 'Çeviri & Yerelleştirme',
    'packages.translation_subtitle': 'Yeminli/sertifikalı çeviri',
    'packages.translation_desc': 'Yeminli/sertifikalı çeviri, teknik/akademik kalite güvencesi',
    'packages.translation_price': 'Ücret: Sayfa/dil başına değişken',
    
    // Projects
    'projects.title': 'Projeler',
    'projects.subtitle': 'Vaka kısa özetleri',
    'projects.visit': 'Tümü için',
    'projects.cta': 'Hadi Konuşalım',
    
    // Why Fures
    'why_fures.title': 'Neden Fures Tech?',
    'why_fures.description': 'Tasarımcı duyarlılığı + Mühendis aklı + AI refleksi. Güncel araçları değil, doğru sistemleri kurarız: sürdürülebilir, ölçülebilir ve devredilebilir.',
    
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
    'contact.subtitle': 'Buradayız, yardıma hazırız.',
    'contact.description': 'Uzman ekibimizle fikirden canlıya hızlıca ilerleyelim.',
    'contact.email': 'E-posta',
    'contact.headquarters': 'Merkez',
    'contact.headquarters_location': 'Gazimağusa, KKTC',
    'contact.second_location': 'İkinci Lokasyon',
    'contact.second_location_place': 'İstanbul, Türkiye',
    'contact.phone': 'Telefon',
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
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'nav.more': 'More',
    'nav.lets_talk': 'Let\'s Talk',
    
    // Hero
    'hero.title': 'Digital Agency',
    'hero.subtitle': 'Beyond Boundaries.',
    'hero.ai_powered': 'AI-Powered Design, Code & Growth.',
    'hero.description': 'Smart automation, impactful web experiences, and data-driven marketing for your brand. Fast, measurable, scalable.',
    'hero.cta_discover': 'Discover More',
    'hero.cta_pricing': 'See Pricing',
    'hero.cta_talk': 'Let\'s Talk',
    
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
    'mission.description': 'To elevate businesses to the top of their field through comprehensive AI automation and timeless design.',
    'mission.priority': 'Our priority: clarity, speed, and lasting aesthetics.',
    'mission.cta': 'Schedule a Meeting',
    
    // Services
    'services.title': 'Services',
    'services.web_design': 'Web Design',
    'services.web_design_desc': 'We design and develop modern, high-performance websites that enhance user experience and drive business growth',
    'services.ai_automation': 'Smart Automation',
    'services.ai_automation_desc': 'We provide AI-powered automation solutions to streamline operations, reduce costs, and increase efficiency.',
    'services.social_media': 'Social Media Management',
    'services.social_media_desc': 'We create data-driven social media strategies and manage your online presence to maximize engagement and brand awareness.',
    'services.data_analytics': 'Data & Analytics',
    'services.data_analytics_desc': 'GTM/GA4, heat maps, dashboards, ROI tracking, experiment design.',
    'services.cloud_integration': 'Cloud & Integration',
    'services.cloud_integration_desc': 'API integrations (e.g., booking/payment), structured data, and infrastructure setup.',
    'services.certified_translation': 'Certified Translation Services',
    'services.certified_translation_desc': 'We provide sworn and certified translation services for legal, academic, and commercial documents, ensuring international standards compliance and accuracy.',
    'services.ad_targeting': 'Ad Targeting (AI)',
    'services.ad_targeting_desc': 'Audience modeling, creative variations, multi-channel optimization.',
    'services.ai_content': 'AI-Powered Content & Social Strategy',
    'services.ai_content_desc': 'Text–image–video generation; brand-aligned, consistent production.',
    
    // Service Packages
    'packages.title': 'Detailed Service Packages',
    'packages.subtitle': 'Modular and scalable packages',
    'packages.note': 'Packages are flexible in scale; configured according to project and industry requirements.',
    'packages.launch_web': 'Launch Web',
    'packages.launch_web_subtitle': 'Quick setup for small/medium-sized brands',
    'packages.launch_web_desc': 'Information architecture, multilingual template, SEO foundation, 5–7 pages • Integrations: forms, maps, basic analytics',
    'packages.launch_web_price': 'Starting: 1,200–2,500 EUR',
    'packages.growth_web': 'Growth Web+',
    'packages.growth_web_subtitle': 'Conversion-focused, data-driven site',
    'packages.growth_web_desc': 'Custom design, speed optimization, blog/product structure • A/B testing, content pipeline, advanced analytics',
    'packages.growth_web_price': 'Starting: 3,500–6,500 EUR',
    'packages.ai_automation': 'AI Automation',
    'packages.ai_automation_subtitle': 'Process automation and integration',
    'packages.ai_automation_desc': 'Data collection/sync, content automation, agent/tool orchestration • Management panel and reporting',
    'packages.ai_automation_price': 'Starting: 2,500–8,000 EUR',
    'packages.social_media_pro': 'Social Media Pro',
    'packages.social_media_pro_subtitle': 'Strategy + production + advertising',
    'packages.social_media_pro_desc': 'Monthly content plan (TR/EN/DE/RU), production and publication • Performance reporting, optimization',
    'packages.social_media_pro_price': 'Monthly: 900–2,400 EUR (+ad budget)',
    'packages.translation': 'Translation & Localization',
    'packages.translation_subtitle': 'Sworn/certified translation',
    'packages.translation_desc': 'Sworn/certified translation, technical/academic quality assurance',
    'packages.translation_price': 'Fee: Variable per page/language',
    
    // Projects
    'projects.title': 'Projects',
    'projects.subtitle': 'Case brief summaries',
    'projects.visit': 'View All',
    'projects.cta': 'Let\'s Talk',
    
    // Why Fures
    'why_fures.title': 'Why Fures Tech?',
    'why_fures.description': 'Designer sensitivity + Engineer mind + AI reflex. We build the right systems, not just current tools: sustainable, measurable, and transferable.',
    
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
    'contact.headquarters_location': 'Famagusta, TRNC',
    'contact.second_location': 'Second Location',
    'contact.second_location_place': 'Istanbul, Turkey',
    'contact.phone': 'Phone',
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
    'nav.about': 'О нас',
    'nav.services': 'Услуги',
    'nav.projects': 'Проекты',
    'nav.contact': 'Контакты',
    'nav.more': 'Больше',
    'nav.lets_talk': 'Давайте поговорим',
    
    // Hero
    'hero.title': 'Цифровое Агентство',
    'hero.subtitle': 'За Пределами Границ.',
    'hero.ai_powered': 'Дизайн, Код и Рост на основе ИИ.',
    'hero.description': 'Умная автоматизация, впечатляющий веб-опыт и маркетинг на основе данных для вашего бренда. Быстро, измеримо, масштабируемо.',
    'hero.cta_discover': 'Узнать Больше',
    'hero.cta_pricing': 'Посмотреть Цены',
    'hero.cta_talk': 'Давайте Поговорим',
    
    // Why Us
    'why_us.title': 'ИИ-нативный подх��д. Реальные результаты.',
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
    'services.web_design': 'Веб-Дизайн',
    'services.web_design_desc': 'Мы проектируем и разрабатываем современные высокопроизводительные веб-сайты, которые улучшают пользовательский опыт и способствуют росту бизнеса',
    'services.ai_automation': 'Умная Автоматизация',
    'services.ai_automation_desc': 'Мы предоставляем решения для автоматизации на основе ИИ для оптимизации операций, снижения затрат и повышения эффективности.',
    'services.social_media': 'Управление Социальными Сетями',
    'services.social_media_desc': 'Мы создаем стратегии социальных сетей на основе данных и управляем вашим онлайн-присутствием для максимизации вовлеченности и узнаваемости бренда.',
    'services.data_analytics': 'Данные и Аналитика',
    'services.data_analytics_desc': 'GTM/GA4, тепловые карты, дашборды, отслеживание ROI, дизайн экспериментов.',
    'services.cloud_integration': 'Облако и Интеграция',
    'services.cloud_integration_desc': 'Интеграции API (например, бронирование/оплата), структурированные данные и настройка инфраструктуры.',
    'services.certified_translation': 'Сертифицированные Услуги Перевода',
    'services.certified_translation_desc': 'Мы предоставляем присяжные и сертифицированные услуги перевода для юридических, академических и коммерческих документов, обеспечивая соответствие международным стандартам и точность.',
    'services.ad_targeting': 'Таргетинг Рекламы (ИИ)',
    'services.ad_targeting_desc': 'Моделирование аудитории, креативные вариации, многоканальная оптимизация.',
    'services.ai_content': 'Контент и Социальная Стратегия на основе ИИ',
    'services.ai_content_desc': 'Генерация текста–изображения–видео; согласованное с брендом, последовательное производство.',
    
    // Service Packages
    'packages.title': 'Подробные Пакеты Услуг',
    'packages.subtitle': 'Модульные и масштабируемые пакеты',
    'packages.note': 'Пакеты гибкие по масштабу; настроены в соответствии с требованиями проекта и отрасли.',
    'packages.launch_web': 'Launch Web',
    'packages.launch_web_subtitle': 'Быстрая настройка для малого/среднего бизнеса',
    'packages.launch_web_desc': 'Информационная архитектура, многоязычный шаблон, основа SEO, 5–7 страниц • Интеграции: формы, карты, базовая аналитика',
    'packages.launch_web_price': 'От: 1,200–2,500 EUR',
    'packages.growth_web': 'Growth Web+',
    'packages.growth_web_subtitle': 'Ориентированный на конверсию сайт на основе данных',
    'packages.growth_web_desc': 'Индивидуальный дизайн, оптимизация скорости, структура блога/продукта • A/B тестирование, конвейер контента, расширенная аналитика',
    'packages.growth_web_price': 'От: 3,500–6,500 EUR',
    'packages.ai_automation': 'AI Automation',
    'packages.ai_automation_subtitle': 'Автоматизация процессов и интеграция',
    'packages.ai_automation_desc': 'Сбор/синхронизация данных, автоматизация контента, оркестрация агентов/инструментов • Панель управления и отчетность',
    'packages.ai_automation_price': 'От: 2,500–8,000 EUR',
    'packages.social_media_pro': 'Social Media Pro',
    'packages.social_media_pro_subtitle': 'Стратегия + производство + реклама',
    'packages.social_media_pro_desc': 'Ежемесячный план контента (TR/EN/DE/RU), производство и публикация • Отчетность о производительности, оптимизация',
    'packages.social_media_pro_price': 'Ежемесячно: 900–2,400 EUR (+рекламный бюджет)',
    'packages.translation': 'Перевод и Локализация',
    'packages.translation_subtitle': 'Присяжный/сертифицированный перевод',
    'packages.translation_desc': 'Присяжный/сертифицированный перевод, техническое/академическое обеспечение качества',
    'packages.translation_price': 'Плата: Переменная за страницу/язык',
    
    // Projects
    'projects.title': 'Проекты',
    'projects.subtitle': 'Краткие описания кейсов',
    'projects.visit': 'Посмотреть Все',
    'projects.cta': 'Давайте Поговорим',
    
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
    // Header
    'nav.about': 'Über uns',
    'nav.services': 'Dienstleistungen',
    'nav.projects': 'Projekte',
    'nav.contact': 'Kontakt',
    'nav.more': 'Mehr',
    'nav.lets_talk': 'Lass uns reden',
    
    // Hero
    'hero.title': 'Digitale Agentur',
    'hero.subtitle': 'Jenseits von Grenzen.',
    'hero.ai_powered': 'KI-gestütztes Design, Code & Wachstum.',
    'hero.description': 'Intelligente Automatisierung, eindrucksvolle Web-Erlebnisse und datengestütztes Marketing für Ihre Marke. Schnell, messbar, skalierbar.',
    'hero.cta_discover': 'Mehr Erfahren',
    'hero.cta_pricing': 'Preise Ansehen',
    'hero.cta_talk': 'Lass uns reden',
    
    // Why Us
    'why_us.title': 'KI-nativer Ansatz. Echte Ergebnisse.',
    'why_us.subtitle': 'Warum Wir',
    'why_us.operational': 'Operative Effizienz',
    'why_us.operational_desc': 'Automatisiert sich wiederholende Aufgaben, senkt Kosten, gewinnt Zeit zurück.',
    'why_us.design_engineering': 'Design + Engineering',
    'why_us.design_engineering_desc': 'Wir vereinen Ästhetik mit Leistung.',
    'why_us.data_driven': 'Datengestützte Entscheidungen',
    'why_us.data_driven_desc': 'Dashboards, Berichte, A/B-Tests, um zu verstehen, was funktioniert.',
    'why_us.industry_depth': 'Branchentiefe',
    'why_us.industry_depth_desc': 'Tourismus-Gastgewerbe, E-Commerce/Produktkataloge (Dermokosmetik & Veterinärmedizin), Erlebnis- und Eventverkauf.',
    
    // Benefits
    'benefits.title': 'Was Wir Liefern',
    'benefits.customer_experience': 'Verbesserte Kundenerfahrung',
    'benefits.customer_experience_desc': 'Erhöhtes Engagement und Zufriedenheit',
    'benefits.efficiency': 'Effizienzsteigerung',
    'benefits.efficiency_desc': 'Intelligente Automatisierung von Prozessen',
    'benefits.better_decisions': 'Bessere Entscheidungen',
    'benefits.better_decisions_desc': 'Transparenter Daten- und Einblick-Fluss',
    
    // Mission
    'mission.title': 'Unsere Mission',
    'mission.description': 'Unternehmen durch umfassende KI-Automatisierung und zeitloses Design an die Spitze ihres Bereichs zu heben.',
    'mission.priority': 'Unsere Priorität: Klarheit, Geschwindigkeit und dauerhafte Ästhetik.',
    'mission.cta': 'Termin Vereinbaren',
    
    // Services
    'services.title': 'Dienstleistungen',
    'services.web_design': 'Webdesign',
    'services.web_design_desc': 'Wir entwerfen und entwickeln moderne, hochleistungsfähige Websites, die die Benutzererfahrung verbessern und das Geschäftswachstum fördern',
    'services.ai_automation': 'Intelligente Automatisierung',
    'services.ai_automation_desc': 'Wir bieten KI-gestützte Automatisierungslösungen zur Rationalisierung von Abläufen, Kostensenkung und Effizienzsteigerung.',
    'services.social_media': 'Social Media Management',
    'services.social_media_desc': 'Wir erstellen datengestützte Social-Media-Strategien und verwalten Ihre Online-Präsenz, um Engagement und Markenbekanntheit zu maximieren.',
    'services.data_analytics': 'Daten & Analytik',
    'services.data_analytics_desc': 'GTM/GA4, Heatmaps, Dashboards, ROI-Tracking, Experimentdesign.',
    'services.cloud_integration': 'Cloud & Integration',
    'services.cloud_integration_desc': 'API-Integrationen (z.B. Buchung/Zahlung), strukturierte Daten und Infrastruktur-Setup.',
    'services.certified_translation': 'Zertifizierte Übersetzungsdienste',
    'services.certified_translation_desc': 'Wir bieten beglaubigte und zertifizierte Übersetzungsdienste für juristische, akademische und kommerzielle Dokumente und gewährleisten die Einhaltung internationaler Standards und Genauigkeit.',
    'services.ad_targeting': 'Anzeigen-Targeting (KI)',
    'services.ad_targeting_desc': 'Zielgruppenmodellierung, kreative Variationen, Mehrkanaloptimierung.',
    'services.ai_content': 'KI-gestützter Inhalt & Social-Strategie',
    'services.ai_content_desc': 'Text–Bild–Video-Generierung; markenkonform, konsistente Produktion.',
    
    // Service Packages
    'packages.title': 'Detaillierte Service-Pakete',
    'packages.subtitle': 'Modulare und skalierbare Pakete',
    'packages.note': 'Pakete sind im Umfang flexibel; konfiguriert nach Projekt- und Branchenanforderungen.',
    'packages.launch_web': 'Launch Web',
    'packages.launch_web_subtitle': 'Schnelle Einrichtung für kleine/mittlere Marken',
    'packages.launch_web_desc': 'Informationsarchitektur, mehrsprachige Vorlage, SEO-Grundlage, 5–7 Seiten • Integrationen: Formulare, Karten, Basis-Analytik',
    'packages.launch_web_price': 'Ab: 1.200–2.500 EUR',
    'packages.growth_web': 'Growth Web+',
    'packages.growth_web_subtitle': 'Conversion-fokussierte, datengesteuerte Website',
    'packages.growth_web_desc': 'Individuelles Design, Geschwindigkeitsoptimierung, Blog/Produktstruktur • A/B-Testing, Content-Pipeline, erweiterte Analytik',
    'packages.growth_web_price': 'Ab: 3.500–6.500 EUR',
    'packages.ai_automation': 'AI Automation',
    'packages.ai_automation_subtitle': 'Prozessautomatisierung und Integration',
    'packages.ai_automation_desc': 'Datenerfassung/-synchronisation, Content-Automatisierung, Agenten-/Tool-Orchestrierung • Management-Panel und Berichterstattung',
    'packages.ai_automation_price': 'Ab: 2.500–8.000 EUR',
    'packages.social_media_pro': 'Social Media Pro',
    'packages.social_media_pro_subtitle': 'Strategie + Produktion + Werbung',
    'packages.social_media_pro_desc': 'Monatlicher Content-Plan (TR/EN/DE/RU), Produktion und Veröffentlichung • Leistungsberichterstattung, Optimierung',
    'packages.social_media_pro_price': 'Monatlich: 900–2.400 EUR (+Werbebudget)',
    'packages.translation': 'Übersetzung & Lokalisierung',
    'packages.translation_subtitle': 'Beglaubigte/zertifizierte Übersetzung',
    'packages.translation_desc': 'Beglaubigte/zertifizierte Übersetzung, technische/akademische Qualitätssicherung',
    'packages.translation_price': 'Gebühr: Variabel pro Seite/Sprache',
    
    // Projects
    'projects.title': 'Projekte',
    'projects.subtitle': 'Kurze Fallzusammenfassungen',
    'projects.visit': 'Alle Anzeigen',
    'projects.cta': 'Lass uns reden',
    
    // Why Fures
    'why_fures.title': 'Warum Fures Tech?',
    'why_fures.description': 'Designer-Sensibilität + Ingenieur-Verstand + KI-Reflex. Wir bauen die richtigen Systeme, nicht nur aktuelle Tools: nachhaltig, messbar und übertragbar.',
    
    // Team
    'team.badge': 'Unser Team',
    'team.title': 'Team',
    'team.gulben.name': 'Gülben Eser',
    'team.gulben.role': 'Gründer',
    'team.gulben.description': 'Design, Inhalt, Qualität und Projektmanagement',
    'team.furkan.name': 'Furkan Yonat',
    'team.furkan.role': 'Mitgründer',
    'team.furkan.description': 'Systemarchitektur, Automatisierung, Integration und Wachstum',
    
    // Pricing
    'pricing.title': 'Preise',
    'pricing.subtitle': 'Transparent und modular',
    'pricing.description': 'Pakete können nach Bedarf kombiniert werden; wir gehen mit festem Umfang + Sprint-Ansatz vor.',
    'pricing.cta': 'Angebot Einholen',
    'pricing.cta_desc': 'Zusammenfassende Lösung und geschätztes Budget innerhalb von 48 Stunden.',
    
    // FAQ
    'faq.title': 'Häufig Gestellte Fragen',
    'faq.q1': 'Wie sind die Zeitpläne?',
    'faq.a1': 'Launch Web 2–4 Wochen, Growth Web+ 4–8 Wochen; Automatisierung und Integrationen variieren je nach Umfang.',
    'faq.q2': 'Support/Garantie?',
    'faq.a2': '30-tägige Stabilisierung nach Go-Live; optionaler monatlicher Wartungs-/Verbesserungsplan.',
    'faq.q3': 'Datensicherheit?',
    'faq.a3': 'Rollen, Zugriffsebenen und Protokollierung sind Standard. Wir wenden Best Practices mit Drittanbieterdiensten an.',
    'faq.q4': 'Welche Sprachen?',
    'faq.a4': 'Hauptsächlich TR/EN/DE/RU, erweiterbar auf Anfrage.',
    
    // Contact
    'contact.title': 'Kontakt',
    'contact.subtitle': 'Wir sind hier, um zu helfen.',
    'contact.description': 'Lassen Sie uns schnell von der Idee zur Umsetzung mit unserem Expertenteam übergehen.',
    'contact.email': 'E-Mail',
    'contact.headquarters': 'Hauptsitz',
    'contact.headquarters_location': 'Famagusta, TRNC',
    'contact.second_location': 'Zweiter Standort',
    'contact.second_location_place': 'Istanbul, Türkei',
    'contact.phone': 'Telefon',
    'contact.send_message': 'Nachricht Senden',
    'contact.schedule_meeting': 'Termin Vereinbaren',
    
    // Footer
    'footer.copyright': '© 2025 Fures Tech — fures.at · Alle Rechte vorbehalten.',
    'footer.privacy': 'Datenschutz',
    'footer.cookies': 'Cookies',
    'footer.kvkk': 'DSGVO/Offenlegung',
    
    // Form
    'form.title': 'Lassen Sie uns Ihr Projekt zünden.',
    'form.name': 'Vollständiger Name',
    'form.email': 'E-Mail',
    'form.company': 'Firma',
    'form.needs': 'Bedarf(e)',
    'form.budget': 'Budgetbereich',
    'form.date': 'Datum',
    'form.submit': 'Angebot Vorbereiten',
    'form.success': 'Danke! Wir melden uns innerhalb von 1 Werktag bei Ihnen.',
    'form.error': 'Etwas ist schief gelaufen. Bitte überprüfen Sie die Felder.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('tr');

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
