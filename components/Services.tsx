import { useLanguage } from "../contexts/LanguageContext";
import { Globe, Bot, Share2, BarChart2, Cloud, FileText, Target, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useInView } from "motion/react";
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
      gradient: 'from-orange-500 to-orange-600',
      video: 'https://player.vimeo.com/video/1054822414?autoplay=1&loop=1&autopause=0&muted=1&background=1'
    },
    {
      icon: Bot,
      title: t('services.ai_automation'),
      description: t('services.ai_automation_desc'),
      gradient: 'from-purple-500 to-purple-600',
      video: 'https://player.vimeo.com/video/1054811832?autoplay=1&loop=1&autopause=0&muted=1&background=1'
    },
    {
      icon: Share2,
      title: t('services.social_media'),
      description: t('services.social_media_desc'),
      gradient: 'from-orange-400 to-purple-500',
      video: 'https://player.vimeo.com/video/1054807979?autoplay=1&loop=1&autopause=0&muted=1&background=1'
    },
    {
      icon: BarChart2,
      title: t('services.data_analytics'),
      description: t('services.data_analytics_desc'),
      gradient: 'from-purple-400 to-orange-500',
      video: 'https://player.vimeo.com/video/1054819424?autoplay=1&loop=1&autopause=0&muted=1&background=1'
    },
    {
      icon: Cloud,
      title: t('services.cloud_integration'),
      description: t('services.cloud_integration_desc'),
      gradient: 'from-orange-500 to-purple-500',
      video: 'https://player.vimeo.com/video/1054819061?autoplay=1&loop=1&autopause=0&muted=1&background=1'
    },
    {
      icon: FileText,
      title: t('services.certified_translation'),
      description: t('services.certified_translation_desc'),
      gradient: 'from-purple-500 to-orange-400',
      video: 'https://player.vimeo.com/video/1054814291?autoplay=1&loop=1&autopause=0&muted=1&background=1'
    },
    {
      icon: Target,
      title: t('services.ad_targeting'),
      description: t('services.ad_targeting_desc'),
      gradient: 'from-orange-400 to-orange-600',
      video: null
    },
    {
      icon: Sparkles,
      title: t('services.ai_content'),
      description: t('services.ai_content_desc'),
      gradient: 'from-purple-600 to-purple-400',
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
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:transform hover:scale-105 overflow-hidden"
            >
              {/* Video Background */}
              {service.video && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700">
                  <iframe
                    src={service.video}
                    className="w-full h-full object-cover scale-150"
                    frameBorder="0"
                    allow="autoplay"
                    title={service.title}
                  />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-purple-600/0 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:from-orange-500/10 group-hover:to-purple-600/10 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 6 }}
                  className={`w-12 h-12 bg-gradient-to-r ${service.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg glow-gradient`}
                >
                  <service.icon className="h-6 w-6 text-white" />
                </motion.div>
                
                <h3 className="text-lg text-white mb-3 font-medium">{service.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
