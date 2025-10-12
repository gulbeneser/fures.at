import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ExternalLink, Cpu, Globe, Hotel, Users, Camera, ChefHat, BarChart3, Briefcase } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const projects = [
  {
    name: 'Fures Kariyer Koçu',
    description:
      'AI destekli kariyer koçunuz: CV hazırlama, ön yazı, mülakat pratiği ve dil geliştirme için uçtan uca destek sunar.',
    link: '/kariyer.html',
    icon: Briefcase,
    color: 'from-rose-500 to-pink-500'
  },
  {
    name: 'AI-Powered Cyprus Vacation Planner',
    description: 'An intelligent application that creates multilingual, personalized travel plans based on user preferences and weather conditions.',
    link: '/projeler/aboutcyprus',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'AI-Powered Serakıncı Product Platform',
    description: 'An automated, multilingual, SEO-driven catalog with AI-generated descriptions and scraping pipelines.',
    link: '/projeler/serakinci',
    icon: Cpu,
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Hotel & Agency Integration',
    description: 'Integrated 6 hotels with agency operations; optimized processes, reduced costs, and unified data flows.',
    link: '/projeler/hotel',
    icon: Hotel,
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'ICALT 2024 Congress Management',
    description: 'Planning and coordination of an international conference in collaboration with Dorana Tourism.',
    link: '/projeler/icalt',
    icon: Users,
    color: 'from-orange-500 to-red-500'
  },
  {
    name: 'PixShop',
    description: 'AI-powered photo editing, simplified. Retouch photos, apply creative filters, or make professional adjustments with simple text instructions. No complex tools required.',
    link: 'https://pixshop-720548631405.us-west1.run.app/',
    icon: Camera,
    color: 'from-violet-500 to-purple-500'
  },
  {
    name: 'Pantry Chef AI',
    description: 'What\'s in your pantry? Enter your ingredients and let our AI chef whip up something delicious for you.',
    link: 'https://ai-recipe-generator-720548631405.us-west1.run.app/',
    icon: ChefHat,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    name: 'ODYSSEUS',
    description: 'Future-Ready Business Intelligence. To get started, select one of the defined hotels below or paste the content of your own website.',
    link: 'https://project-odysseus-720548631405.us-west1.run.app/',
    icon: BarChart3,
    color: 'from-indigo-500 to-blue-500'
  }
];

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
            Yapay zeka teknolojileriyle geliştirdiğimiz yenilikçi çözümler ve başarı hikayelerimiz.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const Icon = project.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.02]"
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-25`}></div>

                <CardHeader className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${project.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
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
                <Button size="lg" variant="gradient" className="text-lg">
                  Projemi Başlat
                </Button>
                <Button variant="outline" size="lg" className="text-lg">
                  Daha Fazla Proje Gör
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}