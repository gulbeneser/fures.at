import { useLanguage } from "../contexts/LanguageContext";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export function About() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-black">
      {/* Background with center glow */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-black to-purple-900/10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-orange-500/15 via-purple-600/10 to-transparent rounded-full blur-3xl animate-glow-pulse"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center gap-6"
        >
          <div className="liquid-icon w-20 h-20">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
            <span className="gradient-flow bg-clip-text text-transparent">
              {t('why_fures.title')}
            </span>
          </h2>
          <p className="max-w-3xl text-lg sm:text-xl text-gray-300/85">
            {t('why_fures.description')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.8, 0.35, 1] }}
          className="liquid-glass relative mt-12 h-[60vh] w-full overflow-hidden rounded-[3rem] border border-white/15 shadow-[0_48px_120px_-60px_rgba(10,12,30,0.95)]"
        >
          <iframe
            src="https://player.vimeo.com/video/1054772121?autoplay=1&loop=1&autopause=0&muted=1&playsinline=1&background=1&controls=0"
            className="absolute inset-0 h-full w-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="About Fures Tech"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>
        </motion.div>
      </div>
    </section>
  );
}
