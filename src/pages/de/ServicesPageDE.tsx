import { useLanguage } from "../../contexts/LanguageContext";
import { useSEO } from "../../hooks/useSEO";
import { Services } from "../../components/Services";

export function ServicesPageDE() {
  const { t, language } = useLanguage();

  useSEO({
    title: t("seo.services.title"),
    description: t("seo.services.description"),
    canonicalPath: "/de/leistungen",
    language: "de",
    alternates: [
      { hrefLang: "de-AT", path: "/de/leistungen" },
      { hrefLang: "tr", path: "/tr/hizmetler" },
      { hrefLang: "x-default", path: "/de/leistungen" },
    ],
    openGraph: {
      title: t("seo.services.title"),
      description: t("seo.services.description"),
      siteName: t("seo.site_name"),
    },
  });

  return (
    <div className="pt-20">
      <Services />
    </div>
  );
}
