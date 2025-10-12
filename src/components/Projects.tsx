import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { ExternalLink, Cpu, Globe, Hotel, Users, Camera, ChefHat, BarChart3, Briefcase, Mail, Phone, MessageCircle } from "lucide-react";
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

  return (
    <section id="projeler" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">
            {t('projects.title')}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('projects.description')}
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
                {t('projects.start.title')}
              </h3>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
                {t('projects.start.description')}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" variant="gradient" className="text-lg">
                    {t('projects.start.cta')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="liquid-glass mt-3 w-[320px] rounded-3xl border border-white/15 bg-black/70 p-3 text-white backdrop-blur-[36px] backdrop-saturate-[1.6]">
                  {[
                    {
                      key: 'email',
                      label: t('projects.start.email'),
                      description: t('projects.start.email_desc'),
                      href: 'mailto:info@fures.at',
                      icon: Mail,
                      newTab: false
                    },
                    {
                      key: 'whatsapp',
                      label: t('projects.start.whatsapp'),
                      description: t('projects.start.whatsapp_desc'),
                      href: 'https://wa.me/905488766819?text=Merhaba%20Fures%20Tech%20ekibi%2C%20yeni%20projem%20i%C3%A7in%20ileti%C5%9Fime%20ge%C3%A7mek%20isterim.',
                      icon: MessageCircle,
                      newTab: true
                    },
                    {
                      key: 'phone',
                      label: t('projects.start.phone'),
                      description: t('projects.start.phone_desc'),
                      href: 'tel:+905488766819',
                      icon: Phone,
                      newTab: false
                    }
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <DropdownMenuItem
                        key={option.key}
                        className="liquid-glass group mb-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left last:mb-0 transition-colors hover:border-white/30 hover:bg-white/10"
                        onSelect={(event) => {
                          event.preventDefault();
                          if (option.newTab) {
                            window.open(option.href, '_blank', 'noopener,noreferrer');
                          } else {
                            window.location.href = option.href;
                          }
                        }}
                      >
                        <span className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-sm font-semibold text-white">{option.label}</span>
                          <span className="text-xs text-gray-300">{option.description}</span>
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}