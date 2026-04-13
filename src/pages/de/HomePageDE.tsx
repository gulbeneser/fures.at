import { useMemo } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { HeroDE } from "../../components/HeroDE";
import { WhyUs } from "../../components/WhyUs";
import { Services } from "../../components/Services";
import { CTA } from "../../components/CTA";
import {
  useSEO,
  createOrganizationSchema,
} from "../../hooks/useSEO";

export function HomePageDE() {
  const { language, t } = useLanguage();

  const structuredData = useMemo(
    () => [
      createOrganizationSchema(t("seo.organization.description")),
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
        geo: {
          "@type": "GeoCoordinates",
          latitude: 47.3833,
          longitude: 12.8833,
        },
        areaServed: ["AT", "DE", "CH"],
        serviceType: [
          "Hotel Website Design",
          "Local SEO",
          "Social Media Management",
          "Hotel PMS Integration",
        ],
        inLanguage: ["de-AT", "en"],
      },
    ],
    [language, t]
  );

  useSEO({
    title: t("seo.home.title"),
    description: t("seo.home.description"),
    keywords: t("seo.home.keywords")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    canonicalPath: "/de",
    language: "de",
    alternates: [
      { hrefLang: "de-AT", path: "/de" },
      { hrefLang: "tr", path: "/tr" },
      { hrefLang: "x-default", path: "/de" },
    ],
    openGraph: {
      title: t("seo.home.title"),
      description: t("seo.home.description"),
      siteName: t("seo.site_name"),
    },
    twitter: {
      title: t("seo.home.title"),
      description: t("seo.home.description"),
    },
    structuredData,
  });

  return (
    <>
      <HeroDE />
      <WhyUs />
      <Services />
      <CTA />
    </>
  );
}
