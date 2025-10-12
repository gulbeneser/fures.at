import type { CSSProperties } from "react";
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
      price: t('packages.launch_web_price')
    },
    {
      icon: TrendingUp,
      name: t('packages.growth_web'),
      subtitle: t('packages.growth_web_subtitle'),
      description: t('packages.growth_web_desc'),
      price: t('packages.growth_web_price'),
      featured: true
    },
    {
      icon: Bot,
      name: t('packages.ai_automation'),
      subtitle: t('packages.ai_automation_subtitle'),
      description: t('packages.ai_automation_desc'),
      price: t('packages.ai_automation_price')
    },
    {
      icon: Megaphone,
      name: t('packages.social_media_pro'),
      subtitle: t('packages.social_media_pro_subtitle'),
      description: t('packages.social_media_pro_desc'),
      price: t('packages.social_media_pro_price')
    },
    {
      icon: Languages,
      name: t('packages.translation'),
      subtitle: t('packages.translation_subtitle'),
      description: t('packages.translation_desc'),
      price: t('packages.translation_price')
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
              className={`group liquid-glass p-9 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_80px_-60px_rgba(12,18,40,0.8)] ${
                pkg.featured ? 'lg:col-span-1 lg:row-span-2 is-active' : ''
              }`}
              style={{
                '--glass-surface-bg': 'rgba(8, 14, 28, 0.08)',
                '--glass-surface-border': 'rgba(255, 255, 255, 0.14)',
                '--glass-highlight-height': '8%',
              } as CSSProperties}
            >
              {pkg.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 rounded-full bg-[linear-gradient(135deg,rgba(91,143,255,0.85),rgba(136,90,255,0.85))] px-4 py-1 text-xs font-semibold text-white shadow-lg">
                  {t('packages.featured_label')}
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-500/0 to-purple-600/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:from-orange-500/15 group-hover:to-purple-600/10"></div>

              <div className="relative z-10">
                <div className="liquid-icon mb-6 flex h-14 w-14 items-center justify-center rounded-2xl group-hover:-rotate-3 transition-transform duration-300">
                  <pkg.icon className="h-7 w-7 text-white" />
                </div>

                <h3 className="text-2xl text-white mb-2 font-semibold tracking-tight">{pkg.name}</h3>
                <p className="text-sm text-orange-300 mb-4 uppercase tracking-[0.15em]">{pkg.subtitle}</p>
                <p className="text-sm text-gray-300/80 leading-relaxed mb-6">{pkg.description}</p>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-sm text-gray-300/90">{pkg.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/iletisim">
            <Button size="lg" variant="gradient" className="text-lg">
              {t('pricing.cta')} →
            </Button>
          </Link>
          <p className="text-sm text-gray-400 mt-4">{t('pricing.cta_desc')}</p>
        </div>
      </div>
    </section>
  );
}
