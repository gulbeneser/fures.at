import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ExternalLink, Cpu, Globe, Hotel, Users, Camera, ChefHat, BarChart3, Briefcase, Plane, ShieldCheck, Shirt } from "lucide-react";
import { useLanguage, type Language } from "../contexts/LanguageContext";
import { Link } from "react-router-dom";

type ProjectTranslations = Record<Language, { name: string; description: string }>;

type ProjectConfig = {
  id: string;
  link: string;
  icon: LucideIcon;
  translations: ProjectTranslations;
};

export const FALLBACK_LANGUAGE: Language = 'en';

export const PROJECTS: readonly ProjectConfig[] = [
  {
    id: 'serakinci-platform',
    link: '/projeler/serakinci',
    icon: Cpu,
    translations: {
      tr: {
        name: 'Serakıncı AI Ürün Platformu',
        description:
          'Serakıncı için otomatik, çok dilli, SEO odaklı ürün kataloğu; AI içerik üretimi ve scraping hatlarıyla beslenir.',
      },
      en: {
        name: 'AI-Powered Serakıncı Product Platform',
        description:
          'Automated, multilingual, SEO-driven product catalog for Serakıncı with AI-authored descriptions and scraping pipelines.',
      },
      de: {
        name: 'KI-gestützte Serakıncı-Produktplattform',
        description:
          'Automatisierter, mehrsprachiger und SEO-starker Produktkatalog für Serakıncı mit KI-Beschreibungen und Scraping-Pipelines.',
      },
      ru: {
        name: 'Платформа продуктов Serakıncı на базе ИИ',
        description:
          'Автоматизированный многоязычный SEO-каталог Serakıncı с генерацией описаний ИИ и пайплайнами для сбора данных.',
      },
    },
  },
  {
    id: 'zuzumood',
    link: 'https://www.zuzumood.com',
    icon: Shirt,
    translations: {
      tr: {
        name: 'ZuzuMood Butik E-Ticaret Deneyimi',
        description:
          'Texas merkezli ZuzuMood için Etsy fulfillment odaklı butik mağaza; kategori mimarisi, günlük blog ve koleksiyon akışlarıyla ölçeklendi.',
      },
      en: {
        name: 'ZuzuMood Boutique E-Commerce Experience',
        description:
          'Conversion-focused boutique storefront for Texas-based ZuzuMood with Etsy-first fulfillment, category architecture, and daily blog cadence.',
      },
      de: {
        name: 'ZuzuMood Boutique-E-Commerce-Erlebnis',
        description:
          'Conversion-orientierter Boutique-Store für ZuzuMood (Texas) mit Etsy-zentrierter Fulfillment-Logik, Kategoriestruktur und täglichem Blog-Flow.',
      },
      ru: {
        name: 'Бутик e-commerce проект ZuzuMood',
        description:
          'Бутик-витрина для ZuzuMood (Техас) с Etsy-first исполнением заказов, архитектурой категорий и ежедневным контент-потоком блога.',
      },
    },
  },
  {
    id: 'fures-career-coach',
    link: '/kariyer.html',
    icon: Briefcase,
    translations: {
      tr: {
        name: 'Fures Kariyer Koçu',
        description:
          'AI destekli kariyer koçunuz: CV hazırlama, ön yazı, mülakat pratiği ve dil geliştirme için uçtan uca destek sunar.',
      },
      en: {
        name: 'Fures Career Coach',
        description:
          'Your AI-powered career coach delivering end-to-end support for CVs, cover letters, interview practice, and language growth.',
      },
      de: {
        name: 'Fures Karriere-Coach',
        description:
          'KI-gestützter Karrierecoach mit ganzheitlicher Unterstützung für Lebenslauf, Anschreiben, Interviewtraining und Sprachentwicklung.',
      },
      ru: {
        name: 'Fures карьерный коуч',
        description:
          'Карьерный коуч на базе ИИ: комплексная помощь с резюме, сопроводительными письмами, собеседованиями и развитием языка.',
      },
    },
  },
  {
    id: 'ai-detector',
    link: '/ai-content-detector/',
    icon: ShieldCheck,
    translations: {
      tr: {
        name: 'AI-Detector',
        description:
          'Metin ve görsellerdeki yapay zekâ izlerini saniyeler içinde analiz eden, kanıtlı raporlar ve tek tıkla insanileştirme sunan hepsi bir arada çözüm.',
      },
      en: {
        name: 'AI-Detector',
        description:
          'All-in-one platform that inspects text and visuals for AI signals in seconds, delivers evidence-backed reports, and humanizes content with one click.',
      },
      de: {
        name: 'AI-Detector',
        description:
          'All-in-One-Plattform, die Texte und Bilder in Sekunden auf KI-Spuren prüft, belegte Reports liefert und Inhalte per Klick humanisiert.',
      },
      ru: {
        name: 'AI-Detector',
        description:
          'Единая платформа: за секунды анализирует тексты и изображения на следы ИИ, выдаёт доказательные отчёты и гуманизирует контент одним кликом.',
      },
    },
  },
  {
    id: 'cyprus-vacation-planner',
    link: '/projeler/aboutcyprus',
    icon: Globe,
    translations: {
      tr: {
        name: 'AI Destekli Kıbrıs Tatil Planlayıcı',
        description:
          'Kullanıcı tercihleri ve hava durumuna göre çok dilli, kişiselleştirilmiş Kıbrıs tatil planları oluşturan akıllı uygulama.',
      },
      en: {
        name: 'AI-Powered Cyprus Vacation Planner',
        description:
          'Intelligent planner that builds multilingual, personalised Cyprus itineraries around traveller preferences and live weather.',
      },
      de: {
        name: 'KI-gestützter Zypern-Reiseplaner',
        description:
          'Intelligenter Planer, der mehrsprachige, personalisierte Zypern-Reisepläne anhand von Vorlieben und Wetterdaten erstellt.',
      },
      ru: {
        name: 'AI-планировщик отпуска на Кипре',
        description:
          'Умное приложение формирует многоязычные и персонализированные маршруты по Кипру с учётом предпочтений и погоды.',
      },
    },
  },
  {
    id: 'travel-ai-companion',
    link: '/projeler/travel',
    icon: Plane,
    translations: {
      tr: {
        name: 'Fures Travel AI Companion',
        description:
          'Gemini Live destekli 3D seyahat asistanı; rotaları gerçekçi Google Maps deneyimi üzerinde anlık olarak sunar.',
      },
      en: {
        name: 'Fures Travel AI Companion',
        description:
          'Gemini Live-powered conversational 3D travel companion that streams itineraries onto a photorealistic Google Maps canvas.',
      },
      de: {
        name: 'Fures Travel AI Companion',
        description:
          'Gesprächiger 3D-Reisebegleiter mit Gemini Live, der Routen live in einer fotorealistischen Google-Maps-Ansicht darstellt.',
      },
      ru: {
        name: 'Fures Travel AI Companion',
        description:
          'Разговорный 3D-помощник путешествий на базе Gemini Live, показывающий маршруты на фотореалистичных картах Google.',
      },
    },
  },
  {
    id: 'hotel-agency-integration',
    link: '/projeler/hotel',
    icon: Hotel,
    translations: {
      tr: {
        name: 'Otel & Acenta Entegrasyonu',
        description:
          'Altı oteli acente operasyonlarına entegre ederek süreçleri optimize ettik, maliyetleri düşürdük ve veri akışını birleştirdik.',
      },
      en: {
        name: 'Hotel & Agency Integration',
        description:
          'Integrated six hotels with agency operations, streamlining processes, reducing costs, and unifying data flows.',
      },
      de: {
        name: 'Hotel- & Agentur-Integration',
        description:
          'Integration von sechs Hotels in Agenturprozesse: optimierte Abläufe, geringere Kosten und gebündelte Datenströme.',
      },
      ru: {
        name: 'Интеграция отелей и агентства',
        description:
          'Интегрировали шесть отелей с агентскими процессами, оптимизировали операции, снизили расходы и объединили потоки данных.',
      },
    },
  },
  {
    id: 'icalt-2024',
    link: '/projeler/icalt',
    icon: Users,
    translations: {
      tr: {
        name: 'ICALT 2024 Kongre Yönetimi',
        description:
          'Dorana Tourism iş birliğiyle uluslararası kongre için baştan sona planlama ve koordinasyon hizmeti.',
      },
      en: {
        name: 'ICALT 2024 Congress Management',
        description:
          'End-to-end planning and coordination of the international ICALT 2024 congress alongside Dorana Tourism.',
      },
      de: {
        name: 'ICALT 2024 Kongressmanagement',
        description:
          'Ganzheitliche Planung und Koordination des internationalen ICALT-2024-Kongresses in Zusammenarbeit mit Dorana Tourism.',
      },
      ru: {
        name: 'Управление конгрессом ICALT 2024',
        description:
          'Полное планирование и координация международного конгресса ICALT 2024 совместно с Dorana Tourism.',
      },
    },
  },
  {
    id: 'pixshop',
    link: 'https://pixshop-720548631405.us-west1.run.app/',
    icon: Camera,
    translations: {
      tr: {
        name: 'PixShop',
        description:
          'Yapay zekâ destekli fotoğraf düzenleme: tek tıkla rötuş, yaratıcı filtreler ve profesyonel ayarlamalar.',
      },
      en: {
        name: 'PixShop',
        description:
          'AI-powered photo editing made simple: retouch, apply creative filters, or make professional adjustments in one click.',
      },
      de: {
        name: 'PixShop',
        description:
          'KI-gestütztes Foto-Editing leicht gemacht: Retusche, kreative Filter und professionelle Anpassungen mit nur einem Klick.',
      },
      ru: {
        name: 'PixShop',
        description:
          'Простое редактирование фото на базе ИИ: ретушь, творческие фильтры и профессиональные настройки в один клик.',
      },
    },
  },
  {
    id: 'pantry-chef',
    link: 'https://ai-recipe-generator-720548631405.us-west1.run.app/',
    icon: ChefHat,
    translations: {
      tr: {
        name: 'Pantry Chef AI',
        description:
          'Dolabınızdaki malzemeleri girin; yapay zekâ şefimiz size anında yaratıcı tarifler önersin.',
      },
      en: {
        name: 'Pantry Chef AI',
        description:
          'Enter the ingredients in your pantry and let our AI chef instantly suggest creative recipes.',
      },
      de: {
        name: 'Pantry Chef KI',
        description:
          'Einfach vorhandene Zutaten eingeben und der KI-Koch schlägt sofort kreative Rezepte vor.',
      },
      ru: {
        name: 'Pantry Chef AI',
        description:
          'Введи продукты из кладовой — ИИ-шеф мгновенно предложит креативные рецепты.',
      },
    },
  },
  {
    id: 'odysseus',
    link: 'https://project-odysseus-720548631405.us-west1.run.app/',
    icon: BarChart3,
    translations: {
      tr: {
        name: 'ODYSSEUS',
        description:
          'Geleceğe hazır iş zekâsı platformu; tanımlı otelleri seçin veya kendi web sitenizi analiz edin.',
      },
      en: {
        name: 'ODYSSEUS',
        description:
          'Future-ready business intelligence platform—select a featured hotel or analyse your own website content.',
      },
      de: {
        name: 'ODYSSEUS',
        description:
          'Zukunftsfähige Business-Intelligence-Plattform: Wähle ein Hotel oder analysiere deine eigene Website.',
      },
      ru: {
        name: 'ODYSSEUS',
        description:
          'Бизнес-аналитика нового поколения: выберите один из отелей или проанализируйте свой сайт.',
      },
    },
  }
] as const;

export function Projects() {
  const { language, t } = useLanguage();

  return (
    <section id="projeler" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.32em] text-orange-400 mb-4">
            {t('projects.subtitle')}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">
            {t('projects.title')}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('projects.description')}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project) => {
            const Icon = project.icon;
            const translation = project.translations[language] ?? project.translations[FALLBACK_LANGUAGE];
            return (
              <Card
                key={project.id}
                className="group relative overflow-hidden border-white/12 bg-white/[0.03] [--glass-highlight-height:14%] [--glass-reflection-height:46%] [--glass-saturate-scale:0.94] [--glass-surface-bg:rgba(8,12,24,0.84)] [--glass-surface-border:rgba(255,255,255,0.14)] [--glass-surface-highlight:rgba(216,229,255,0.3)] [--glass-surface-reflection:rgba(160,188,255,0.18)] shadow-[0_28px_80px_-58px_rgba(8,12,30,0.95)] transition-all duration-500 hover:-translate-y-0.5 hover:border-white/20 hover:[--glass-saturate-scale:1.04] hover:shadow-[0_30px_90px_-56px_rgba(14,20,44,0.9)]"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(120%_72%_at_50%_-16%,rgba(255,255,255,0.14),transparent_74%)] opacity-58 transition-opacity duration-500 group-hover:opacity-95"></div>

                <CardHeader className="relative px-7 pt-7">
                  <div className="liquid-icon mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-white/18 bg-white/[0.04] [--glass-highlight-height:15%] [--glass-reflection-height:42%] [--glass-saturate-scale:0.9] transition-transform duration-300 group-hover:scale-[1.03]">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-[1.55rem] leading-tight text-white/95 transition-colors duration-300 group-hover:text-white line-clamp-2">
                    {translation.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative px-7 pb-7 pt-0">
                  <CardDescription className="mb-7 line-clamp-3 text-[1.03rem] leading-8 text-white/72">
                    {translation.description}
                  </CardDescription>
                  
                  <Button
                    variant="outline"
                    className="h-11 w-full justify-center border-white/16 bg-white/[0.06] text-[11px] tracking-[0.2em] text-white/82 hover:border-white/28 hover:bg-white/[0.09] hover:text-white"
                    asChild
                  >
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      {t('projects.visit_project')}
                      <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-500/12 via-transparent to-purple-600/12 blur-2xl"></div>
            <div className="liquid-glass relative rounded-[2.5rem] border border-white/18 bg-white/[0.04] [--glass-highlight-height:13%] [--glass-reflection-height:44%] p-12 text-white">
              <h3 className="text-3xl lg:text-4xl mb-6 bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">
                {t('projects.start_heading')}
              </h3>
              <p className="text-gray-400 mb-10 max-w-2xl mx-auto text-lg">
                {t('projects.start_body')}
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" variant="gradient" className="text-lg">
                  <Link to="/iletisim">{t('projects.start_primary_cta')}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg">
                  <Link to="/projeler">{t('projects.start_secondary_cta')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
