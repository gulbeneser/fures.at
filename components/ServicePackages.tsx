import { useLanguage } from "../contexts/LanguageContext";
import { Rocket, TrendingUp, Bot, Megaphone, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export function ServicePackages() {
  const { t } = useLanguage();

  const packages = [
    {
      icon: Rocket,
      name: t('packages.launch_web'),
      subtitle: t('packages.launch_web_subtitle'),
      description: t('packages.launch_web_desc'),
      price: t('packages.launch_web_price'),
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      icon: TrendingUp,
      name: t('packages.growth_web'),
      subtitle: t('packages.growth_web_subtitle'),
      description: t('packages.growth_web_desc'),
      price: t('packages.growth_web_price'),
      gradient: 'from-purple-500 to-purple-600',
      featured: true
    },
    {
      icon: Bot,
      name: t('packages.ai_automation'),
      subtitle: t('packages.ai_automation_subtitle'),
      description: t('packages.ai_automation_desc'),
      price: t('packages.ai_automation_price'),
      gradient: 'from-orange-400 to-purple-500'
    },
    {
      icon: Megaphone,
      name: t('packages.social_media_pro'),
      subtitle: t('packages.social_media_pro_subtitle'),
      description: t('packages.social_media_pro_desc'),
      price: t('packages.social_media_pro_price'),
      gradient: 'from-purple-400 to-orange-500'
    },
    {
      icon: Languages,
      name: t('packages.translation'),
      subtitle: t('packages.translation_subtitle'),
      description: t('packages.translation_desc'),
      price: t('packages.translation_price'),
      gradient: 'from-orange-500 to-purple-500'
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black"></div>
        <div className="absolute top-1/3 left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('packages.title')}
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            {t('packages.subtitle')}
          </p>
          <p className="text-sm text-gray-400 max-w-3xl mx-auto">
            {t('packages.note')}
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border transition-all duration-500 hover:transform hover:scale-105 ${
                pkg.featured
                  ? 'border-orange-500/50 lg:col-span-1 lg:row-span-2'
                  : 'border-white/10 hover:border-orange-500/50'
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full text-xs text-white shadow-lg">
                  Popüler
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-purple-600/0 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:from-orange-500/10 group-hover:to-purple-600/5 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className={`w-14 h-14 bg-gradient-to-r ${pkg.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
                  <pkg.icon className="h-7 w-7 text-white" />
                </div>
                
                <h3 className="text-2xl text-white mb-2">{pkg.name}</h3>
                <p className="text-sm text-orange-400 mb-4">{pkg.subtitle}</p>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">{pkg.description}</p>
                
                <div className="pt-6 border-t border-white/10">
                  <p className="text-lg text-white">{pkg.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/iletisim">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-10 py-6 rounded-full transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 text-lg"
            >
              {t('pricing.cta')} →
            </Button>
          </Link>
          <p className="text-sm text-gray-400 mt-4">{t('pricing.cta_desc')}</p>
        </div>
      </div>
    </section>
  );
}
