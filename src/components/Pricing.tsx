import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { DollarSign, Zap } from "lucide-react";

export function Pricing() {
  const { t } = useLanguage();

  return (
    <section className="py-32 relative overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-black to-purple-600/10"></div>
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full mb-8 shadow-2xl shadow-orange-500/25">
            <DollarSign className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('pricing.title')}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl text-orange-400 mb-4">
            {t('pricing.subtitle')}
          </p>

          {/* Description */}
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            {t('pricing.description')}
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="liquid-glass p-6 text-white/85">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg text-white">Modüler</h3>
              </div>
              <p className="text-sm text-gray-400">İhtiyaca göre birleştirilebilir</p>
            </div>

            <div className="liquid-glass p-6 text-white/85">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg text-white">Şeffaf</h3>
              </div>
              <p className="text-sm text-gray-400">Sabit kapsam + sprint</p>
            </div>

            <div className="liquid-glass p-6 text-white/85">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg text-white">Hızlı</h3>
              </div>
              <p className="text-sm text-gray-400">48 saat içinde teklif</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <Link to="/iletisim">
              <Button size="lg" variant="gradient" className="text-lg">
                {t('pricing.cta')} →
              </Button>
            </Link>
            <p className="text-sm text-gray-400">{t('pricing.cta_desc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
