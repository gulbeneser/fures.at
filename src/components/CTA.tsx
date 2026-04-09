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
            scale: [1, 1.06, 1],
            opacity: [0.25, 0.40, 0.25]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.20, 0.35, 0.20]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl"
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
          <div className="liquid-glass relative max-w-5xl mx-auto overflow-hidden rounded-[2.5rem] border border-white/15">
            <iframe
              src="https://player.vimeo.com/video/1054771811?autoplay=1&loop=1&autopause=0&muted=1&playsinline=1&background=1&controls=0"
              className="aspect-video w-full"
              frameBorder="0"
              allow="autoplay; fullscreen"
              title="Contact Fures Tech"
            />
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-20">
            <a href="mailto:info@fures.at">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button size="lg" variant="gradient" className="group">
                  <Send className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  {t('contact.send_message')}
                </Button>
              </motion.div>
            </a>

            <a href="https://calendly.com/fures" target="_blank" rel="noopener noreferrer">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button size="lg" variant="outline">
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
                  className="liquid-glass group relative block overflow-hidden rounded-[1.75rem] border border-white/15 p-6 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-orange-500/0 to-purple-600/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:from-orange-500/10 group-hover:to-purple-600/10"></div>

                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 6 }}
                      className="liquid-icon mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
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
