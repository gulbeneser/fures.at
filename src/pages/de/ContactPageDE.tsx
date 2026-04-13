import { useMemo } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSEO } from "../../hooks/useSEO";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";

const CARD_FADE = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

export function ContactPageDE() {
  const { t, language } = useLanguage();

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "@id": "https://fures.at/de/kontakt#webpage",
        name: t("seo.contact.title"),
        description: t("seo.contact.description"),
        url: "https://fures.at/de/kontakt",
        inLanguage: "de-AT",
      },
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://fures.at/de#localbusiness",
        name: "Fures Tech",
        description: t("seo.organization.description"),
        url: "https://fures.at/de",
        telephone: "+4366499735268",
        email: "info@fures.at",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Maria Alm",
          addressLocality: "Maria Alm",
          addressRegion: "Salzburg",
          postalCode: "5761",
          addressCountry: "AT",
        },
        areaServed: ["AT", "DE", "CH"],
      },
    ],
    [language, t]
  );

  useSEO({
    title: t("seo.contact.title"),
    description: t("seo.contact.description"),
    canonicalPath: "/de/kontakt",
    language: "de",
    alternates: [
      { hrefLang: "de-AT", path: "/de/kontakt" },
      { hrefLang: "tr", path: "/tr/iletisim" },
      { hrefLang: "x-default", path: "/de/kontakt" },
    ],
    openGraph: {
      title: t("seo.contact.title"),
      description: t("seo.contact.description"),
      siteName: t("seo.site_name"),
    },
    structuredData,
  });

  return (
    <div className="pt-24 min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Title section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-orange-500 text-sm font-semibold tracking-widest uppercase mb-4 block">
            {t("contact.title")}
          </span>
          <h1
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            {t("contact.subtitle")}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t("contact.description")}
          </p>
        </motion.div>

        {/* Contact cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Email card */}
          <motion.a
            href="mailto:info@fures.at"
            variants={CARD_FADE}
            initial="hidden"
            animate="visible"
            custom={0.08}
            className="group block p-8 rounded-3xl border border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200 shrink-0">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {t("contact.email")}
                </p>
                <p className="text-gray-900 font-medium">info@fures.at</p>
              </div>
            </div>
          </motion.a>

          {/* Phone card */}
          <motion.a
            href="tel:+4366499735268"
            variants={CARD_FADE}
            initial="hidden"
            animate="visible"
            custom={0.14}
            className="group block p-8 rounded-3xl border border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200 shrink-0">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {t("contact.phone")}
                </p>
                <p className="text-gray-900 font-medium">+43 664 99735268</p>
              </div>
            </div>
          </motion.a>

          {/* Address card */}
          <motion.div
            variants={CARD_FADE}
            initial="hidden"
            animate="visible"
            custom={0.20}
            className="p-8 rounded-3xl border border-gray-100 bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {t("contact.headquarters")}
                </p>
                <p className="text-gray-900 font-medium">
                  {t("contact.headquarters_location")}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Maria Alm, Salzburgerland, Österreich
                </p>
              </div>
            </div>
          </motion.div>

          {/* Meeting card */}
          <motion.a
            href="https://calendly.com/fures"
            target="_blank"
            rel="noopener noreferrer"
            variants={CARD_FADE}
            initial="hidden"
            animate="visible"
            custom={0.26}
            className="group block p-8 rounded-3xl border border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200 shrink-0">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {t("contact.schedule_meeting")}
                </p>
                <p className="text-gray-900 font-medium">Termin buchen</p>
              </div>
            </div>
          </motion.a>
        </div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.34 }}
          className="text-center"
        >
          <a href="mailto:info@fures.at">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors duration-200 shadow-lg shadow-orange-200"
            >
              <Mail className="w-5 h-5" />
              {t("contact.send_message")}
            </motion.button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
