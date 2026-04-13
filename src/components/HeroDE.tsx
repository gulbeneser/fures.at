import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { MapPin, TrendingUp, Hotel, ArrowRight } from "lucide-react";

const ROTATING_WORDS = [
  "Direktbuchungen",
  "Sichtbarkeit",
  "Gästeerlebnisse",
  "Umsatz",
];

const FADE_IN = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

const STATS = [
  {
    icon: Hotel,
    value: "50+",
    label: "DACH Hotels betreut",
  },
  {
    icon: TrendingUp,
    value: "Ø +34 %",
    label: "mehr Direktbuchungen",
  },
  {
    icon: MapPin,
    value: "8+",
    label: "Jahre Erfahrung",
  },
];

export function HeroDE() {
  const { t } = useLanguage();
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 320);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden pt-16">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 via-white to-purple-50/30 pointer-events-none" />

      {/* Decorative blobs — very faint */}
      <div
        className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full bg-orange-100/30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-100/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        {/* Trust badge */}
        <motion.div
          variants={FADE_IN}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-medium"
        >
          <MapPin className="w-4 h-4 shrink-0" />
          Büro in Maria Alm, Salzburgerland · DACH-Markt
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={FADE_IN}
          initial="hidden"
          animate="visible"
          custom={0.08}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4"
          style={{ letterSpacing: "-0.03em" }}
        >
          Mehr{" "}
          <span
            className="inline-block transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, #FF7A29 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(6px)",
            }}
          >
            {ROTATING_WORDS[wordIndex]}
          </span>{" "}
          <br className="hidden sm:block" />
          für Ihr Hotel
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={FADE_IN}
          initial="hidden"
          animate="visible"
          custom={0.16}
          className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Professionelle Digitalstrategien für Hotels im DACH-Raum — von der
          Website über SEO bis zur Social-Media-Betreuung. Alles aus einer Hand.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={FADE_IN}
          initial="hidden"
          animate="visible"
          custom={0.22}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            to="/de/leistungen"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-full transition-all duration-200 shadow-md shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-px active:translate-y-0"
          >
            Leistungen entdecken
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/de/kontakt"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-full transition-all duration-200 hover:-translate-y-px active:translate-y-0"
          >
            Jetzt Beratung anfragen
          </Link>
        </motion.div>

        {/* Trust stats */}
        <motion.div
          variants={FADE_IN}
          initial="hidden"
          animate="visible"
          custom={0.32}
          className="mt-20 w-full grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.38 + i * 0.08,
                }}
                className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-orange-100">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
                <p
                  className="text-2xl font-bold text-gray-900"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 text-center">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
