import { useLanguage } from "../contexts/LanguageContext";
import { Globe, Bot, Share2, BarChart2, Cloud, FileText, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export function Services() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    {
      icon: Globe,
      title: t('services.web_design'),
      description: t('services.web_design_desc'),
      video: 'https://player.vimeo.com/video/1054822414?autoplay=1&loop=1&autopause=0&muted=1'
    },
    {
      icon: Bot,
      title: t('services.ai_automation'),
      description: t('services.ai_automation_desc'),
      video: 'https://player.vimeo.com/video/1054811832?autoplay=1&loop=1&autopause=0&muted=1'
    },
    {
      icon: Share2,
      title: t('services.social_media'),
      description: t('services.social_media_desc'),
      video: 'https://player.vimeo.com/video/1054807979?autoplay=1&loop=1&autopause=0&muted=1'
    },
    {
      icon: BarChart2,
      title: t('services.data_analytics'),
      description: t('services.data_analytics_desc'),
      video: 'https://player.vimeo.com/video/1054819424?autoplay=1&loop=1&autopause=0&muted=1'
    },
    {
      icon: Cloud,
      title: t('services.cloud_integration'),
      description: t('services.cloud_integration_desc'),
      video: 'https://player.vimeo.com/video/1054819061?autoplay=1&loop=1&autopause=0&muted=1'
    },
    {
      icon: FileText,
      title: t('services.certified_translation'),
      description: t('services.certified_translation_desc'),
      video: 'https://player.vimeo.com/video/1054814291?autoplay=1&loop=1&autopause=0&muted=1'
    },
    {
      icon: Target,
      title: t('services.ad_targeting'),
      description: t('services.ad_targeting_desc'),
      video: null
    },
    {
      icon: Sparkles,
      title: t('services.ai_content'),
      description: t('services.ai_content_desc'),
      video: null
    }
  ];

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-black">
      {/* Background with center glow */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/30 to-black"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-orange-500/20 via-purple-600/10 to-transparent rounded-full blur-3xl animate-glow-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            <span className="gradient-flow bg-clip-text text-transparent font-bold">
              {t('services.title')}
            </span>
          </h2>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group liquid-glass p-8 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Video Background */}
              {service.video && (
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-40">
                  <iframe
                    src={`${service.video}&controls=0&background=1`}
                    className="h-full w-full scale-150 object-cover"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    title={service.title}
                  />
                </div>
              )}

              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-500/0 to-purple-600/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:from-orange-500/15 group-hover:to-purple-600/10"></div>

              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 6 }}
                  className="liquid-icon mb-6 flex h-12 w-12 items-center justify-center rounded-2xl"
                >
                  <service.icon className="h-6 w-6 text-white" />
                </motion.div>

                <h3 className="text-xl text-white mb-3 font-semibold tracking-tight">{service.title}</h3>
                <p className="text-sm text-gray-300/80 leading-relaxed">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
