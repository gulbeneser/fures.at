import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "../components/Hero";
import { WhyUs } from "../components/WhyUs";
import { Mission } from "../components/Mission";
import { Services } from "../components/Services";
import { ServicePackages } from "../components/ServicePackages";
import { Quote } from "../components/Quote";
import { About } from "../components/About";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useSEO,
  buildLanguageAlternates,
  canonicalPathForLanguage,
  createOrganizationSchema,
  createWebsiteSchema
} from "../hooks/useSEO";

export function HomePage() {
  const { language, t } = useLanguage();
  const location = useLocation();

  const canonicalPath = useMemo(
    () => canonicalPathForLanguage(location.pathname, language),
    [location.pathname, language]
  );

  const alternates = useMemo(
    () => buildLanguageAlternates(location.pathname),
    [location.pathname]
  );

  const keywords = useMemo(
    () =>
      `${t("seo.common.keywords")}, ${t("seo.home.keywords")}`
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0),
    [language, t]
  );

  const structuredData = useMemo(
    () => [
      createOrganizationSchema(t("seo.organization.description")),
      createWebsiteSchema(t("seo.tagline"))
    ],
    [language, t]
  );

  useSEO({
    title: t("seo.home.title"),
    description: t("seo.home.description"),
    keywords,
    canonicalPath,
    alternates,
    language,
    openGraph: {
      title: t("seo.home.title"),
      description: t("seo.home.description"),
      siteName: t("seo.site_name")
    },
    twitter: {
      title: t("seo.home.title"),
      description: t("seo.home.description")
    },
    structuredData
  });

  return (
    <>
      <Hero />
      <WhyUs />
      <Mission />
      <Services />
      <ServicePackages />
      <Quote />
      <About />
    </>
  );
}
