import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { Target } from "lucide-react";

export function Mission() {
  const { t } = useLanguage();

  return (
    <section className="py-32 relative overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-orange-900/20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full mb-8 shadow-2xl shadow-orange-500/25">
          <Target className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-8">
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {t('mission.title')}
          </span>
        </h2>

        {/* Description */}
        <p className="text-xl sm:text-2xl text-gray-300 mb-6 leading-relaxed">
          {t('mission.description')}
        </p>

        {/* Priority */}
        <p className="text-lg text-gray-400 mb-12">
          {t('mission.priority')}
        </p>

        {/* CTA */}
        <Link to="/iletisim">
          <Button size="lg" variant="gradient" className="text-lg">
            {t('mission.cta')} →
          </Button>
        </Link>
      </div>
    </section>
  );
}
