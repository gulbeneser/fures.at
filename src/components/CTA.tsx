import { Button } from "./ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export function CTA() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-black">
      {/* Animated Gradient Waves */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-purple-600/5 to-orange-500/10"></div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm max-w-4xl mx-auto glow-gradient">
            <div className="aspect-video">
              <iframe
                src="https://player.vimeo.com/video/1054771811?autoplay=1&loop=1&autopause=0&muted=1&playsinline=1"
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                title="Contact Fures Tech"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-wider text-orange-400 mb-4 font-medium">
            {t('contact.title')}
          </h2>
          
          <h3 className="text-4xl sm:text-5xl lg:text-6xl mb-6 font-bold">
            <span className="gradient-flow bg-clip-text text-transparent">
              {t('contact.subtitle')}
            </span>
          </h3>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            {t('contact.description')}
          </p>

          {/* CTA Buttons with Micro-Motion */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <a href="mailto:info@fures.at">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  className="group bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-10 py-6 rounded-full transition-all duration-300 hover:shadow-2xl glow-gradient text-lg"
                >
                  <Send className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  {t('contact.send_message')}
                </Button>
              </motion.div>
            </a>
            
            <a href="https://calendly.com/fures" target="_blank" rel="noopener noreferrer">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  variant="outline"
                  className="px-10 py-6 rounded-full text-lg border-white/20 hover:border-orange-500/50 hover:bg-white/5 transition-all duration-300"
                >
                  {t('contact.schedule_meeting')}
                </Button>
              </motion.div>
            </a>
          </div>
        </motion.div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Mail,
              title: t('contact.email'),
              content: "info@fures.at",
              href: "mailto:info@fures.at"
            },
            {
              icon: Phone,
              title: t('contact.phone'),
              content: "+90 (548) 876 68 19",
              href: "tel:+905488766819"
            },
            {
              icon: MapPin,
              title: t('contact.headquarters'),
              content: t('contact.headquarters_location'),
              href: null
            },
            {
              icon: MapPin,
              title: t('contact.second_location'),
              content: t('contact.second_location_place'),
              href: null
            }
          ].map((item, index) => {
            const Component = item.href ? 'a' : 'div';
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <Component
                  {...(item.href && { href: item.href })}
                  className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:transform hover:scale-105 backdrop-blur-sm block"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-purple-600/0 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:from-orange-500/10 group-hover:to-purple-600/5 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 6 }}
                      className="w-12 h-12 bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg glow-gradient"
                    >
                      <item.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <h4 className="text-sm text-gray-400 mb-2 font-medium">{item.title}</h4>
                    <p className="text-white group-hover:text-orange-400 transition-colors">
                      {item.content}
                    </p>
                  </div>
                </Component>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
