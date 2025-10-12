import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const rotatingTexts = [
  "Dijital Ajans",
  "Akıllı Sistem",
  "Yaratıcı Otomasyon",
  "Fures Tech"
];

export function Hero() {
  const { t } = useLanguage();
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-16">
      {/* Background Video - Full Screen with Proper Aspect Ratio */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0" style={{ width: '100%', height: '100%', padding: '56.25% 0 0 0', position: 'relative' }}>
          <iframe
            src="https://player.vimeo.com/video/1054768432?autoplay=1&loop=1&autopause=0&muted=1&background=1&controls=0&playsinline=1&quality=auto"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '177.78vh',
              height: '100vw',
              minWidth: '100%',
              minHeight: '100%',
              transform: 'translate(-50%, -50%)',
            }}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            title="Hero Background Video"
          />
        </div>
        {/* Dark overlay with radial gradient */}
        <div className="absolute inset-0 bg-black/70 blur-gradient-inward"></div>
      </div>

      {/* Animated Background Effects with Glow */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/20 rounded-full animate-glow-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full animate-glow-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating particles */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400/50 rounded-full"
          animate={{
            y: [0, -30, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-400/50 rounded-full"
          animate={{
            y: [0, 40, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-orange-300/40 rounded-full"
          animate={{
            y: [0, -25, 0],
            opacity: [0.4, 0.9, 0.4]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Fixed Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-purple-600/10 border border-orange-500/20 mb-8 backdrop-blur-sm glow-gradient"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-300">AI-Native Digital Agency</span>
          </motion.div>

          {/* Rotating Title with Gradient Flow */}
          <motion.h1
            key={textIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-5xl sm:text-6xl lg:text-8xl mb-6"
          >
            <span className="block text-white font-bold">
              {rotatingTexts[textIndex]}
            </span>
            <span className="block mt-2 bg-gradient-to-r from-orange-400 via-orange-500 to-purple-600 bg-clip-text text-transparent font-bold">
              {t('hero.subtitle')}
            </span>
          </motion.h1>

          {/* AI Powered */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl sm:text-3xl lg:text-4xl text-white/90 mb-8 font-medium"
          >
            {t('hero.ai_powered')}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed backdrop-blur-sm"
          >
            {t('hero.description')}
          </motion.p>

          {/* CTAs with Micro-Motion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/hizmetler">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="gradient"
                  className="group text-lg"
                >
                  {t('hero.cta_discover')}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>

            <Link to="/iletisim">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg"
                >
                  Projenizi Anlatalım →
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  );
}
