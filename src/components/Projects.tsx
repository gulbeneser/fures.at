import { useId, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  ExternalLink,
  Cpu,
  Globe,
  Hotel,
  Users,
  Camera,
  ChefHat,
  BarChart3,
  Briefcase,
  Mail,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export const PROJECTS = [
  {
    name: 'Fures Kariyer Koçu',
    description:
      'AI destekli kariyer koçunuz: CV hazırlama, ön yazı, mülakat pratiği ve dil geliştirme için uçtan uca destek sunar.',
    link: '/kariyer.html',
    icon: Briefcase
  },
  {
    name: 'AI-Powered Cyprus Vacation Planner',
    description: 'An intelligent application that creates multilingual, personalized travel plans based on user preferences and weather conditions.',
    link: '/projeler/aboutcyprus',
    icon: Globe
  },
  {
    name: 'AI-Powered Serakıncı Product Platform',
    description: 'An automated, multilingual, SEO-driven catalog with AI-generated descriptions and scraping pipelines.',
    link: '/projeler/serakinci',
    icon: Cpu
  },
  {
    name: 'Hotel & Agency Integration',
    description: 'Integrated 6 hotels with agency operations; optimized processes, reduced costs, and unified data flows.',
    link: '/projeler/hotel',
    icon: Hotel
  },
  {
    name: 'ICALT 2024 Congress Management',
    description: 'Planning and coordination of an international conference in collaboration with Dorana Tourism.',
    link: '/projeler/icalt',
    icon: Users
  },
  {
    name: 'PixShop',
    description: 'AI-powered photo editing, simplified. Retouch photos, apply creative filters, or make professional adjustments with simple text instructions. No complex tools required.',
    link: 'https://pixshop-720548631405.us-west1.run.app/',
    icon: Camera
  },
  {
    name: 'Pantry Chef AI',
    description: 'What\'s in your pantry? Enter your ingredients and let our AI chef whip up something delicious for you.',
    link: 'https://ai-recipe-generator-720548631405.us-west1.run.app/',
    icon: ChefHat
  },
  {
    name: 'ODYSSEUS',
    description: 'Future-Ready Business Intelligence. To get started, select one of the defined hotels below or paste the content of your own website.',
    link: 'https://project-odysseus-720548631405.us-west1.run.app/',
    icon: BarChart3
  }
] as const;

export function Projects() {
  const { t } = useLanguage();
  const [showContactOptions, setShowContactOptions] = useState(false);
  const dialogTitleId = useId();

  const contactOptions = [
    {
      href: "mailto:info@fures.at",
      icon: Mail,
      title: t("projects.contact_option_email"),
      description: "info@fures.at",
      external: false,
    },
    {
      href: "https://wa.me/905488766819",
      icon: MessageCircle,
      title: t("projects.contact_option_whatsapp"),
      description: "+90 (548) 876 68 19",
      external: true,
    },
    {
      href: "tel:+905488766819",
      icon: Phone,
      title: t("projects.contact_option_phone"),
      description: "+90 (548) 876 68 19",
      external: false,
    },
  ] as const;

  const closeContactOptions = () => setShowContactOptions(false);

  return (
    <section id="projeler" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">
            {t('projects.title')}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Yapay zeka teknolojileriyle geliştirdiğimiz yenilikçi çözümler ve başarı hikayelerimiz.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, index) => {
            const Icon = project.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-80"></div>

                <CardHeader className="relative">
                  <div className="liquid-icon mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative">
                  <CardDescription className="text-gray-400 mb-6 line-clamp-3">
                    {project.description}
                  </CardDescription>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-center text-sm"
                    onClick={() => window.open(project.link, '_blank')}
                  >
                    {t('projects.visit_project')}
                    <ExternalLink className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-500/15 via-transparent to-purple-600/15 blur-3xl"></div>
            <div className="liquid-glass relative rounded-[2.5rem] border border-white/15 p-12 text-white">
              <h3 className="text-3xl lg:text-4xl mb-6 bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">
                Kendi Projenizi Başlatın
              </h3>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
                AI destekli çözümlerle hayalinizdeki projeyi gerçeğe dönüştürmeye hazır mısınız?
                Deneyimli ekibimizle birlikte dijital dönüşüm yolculuğunuza başlayın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="gradient"
                  className="text-lg"
                  onClick={() => setShowContactOptions(true)}
                >
                  Projemi Başlat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showContactOptions && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          onClick={closeContactOptions}
        >
          <div
            className="liquid-glass relative w-full max-w-xl rounded-[2.5rem] border border-white/15 p-8 text-white shadow-[0_45px_140px_-60px_rgba(10,14,38,0.85)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full p-2 text-white/60 transition hover:text-white"
              onClick={closeContactOptions}
              aria-label={t("projects.contact_option_close")}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 flex flex-col gap-3 text-center">
              <h4 id={dialogTitleId} className="text-2xl font-semibold">
                {t("projects.contact_option_title")}
              </h4>
              <p className="text-base text-white/70">
                {t("projects.contact_option_description")}
              </p>
            </div>

            <div className="space-y-4">
              {contactOptions.map(({ href, icon: Icon, title, description, external }) => (
                <a
                  key={href}
                  href={href}
                  onClick={closeContactOptions}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="liquid-glass group relative flex items-center justify-between gap-4 overflow-hidden rounded-[1.75rem] border border-white/15 px-5 py-4 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="liquid-icon flex h-12 w-12 items-center justify-center rounded-2xl">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-medium text-white">{title}</p>
                      <p className="text-sm text-white/70">{description}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-white/60 transition group-hover:translate-x-1 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
