import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

const FALLBACK_QUOTES = [
  "Teknolojiyle değil, zekâyla ölçekleniyoruz.",
  "Fures = Akıllı sistem tasarımı",
  "Estetik ≠ lüks, işlevdir",
  "Yapay zekâ = yaratıcı hız"
];

export function Quote() {
  const { t, language } = useLanguage();
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = useMemo(() => {
    const raw = t("quotes.items");
    const items = raw
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);

    if (raw === "quotes.items" || items.length === 0) {
      return FALLBACK_QUOTES;
    }

    return items;
  }, [t, language]);

  useEffect(() => {
    if (quotes.length <= 1) {
      setCurrentQuote(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes]);

  useEffect(() => {
    setCurrentQuote(0);
  }, [quotes]);

  return (
    <section className="py-20 relative overflow-hidden bg-black">
      {/* Center Blur Light Ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-gradient-radial from-orange-500/20 via-purple-600/10 to-transparent rounded-full blur-3xl animate-glow-pulse"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-flow bg-clip-text text-transparent italic">
                "{quotes[currentQuote]}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quote Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {quotes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuote(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentQuote
                  ? 'bg-gradient-to-r from-orange-500 to-purple-600 w-8'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
