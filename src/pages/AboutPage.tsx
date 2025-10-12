import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { About } from "../components/About";
import { Mission } from "../components/Mission";
import { WhyUs } from "../components/WhyUs";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useSEO,
  buildLanguageAlternates,
  canonicalPathForLanguage,
  createBreadcrumbSchema,
  createOrganizationSchema
} from "../hooks/useSEO";

export function AboutPage() {
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
      `${t("seo.common.keywords")}, ${t("seo.about.keywords")}`
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0),
    [language, t]
  );

  const structuredData = useMemo(
    () => [
      createOrganizationSchema(t("seo.organization.description")),
      createBreadcrumbSchema([
        { name: t("nav.home"), path: canonicalPathForLanguage("/", language) },
        { name: t("nav.about"), path: canonicalPath }
      ])
    ],
    [language, t, canonicalPath]
  );

  useSEO({
    title: t("seo.about.title"),
    description: t("seo.about.description"),
    keywords,
    canonicalPath,
    alternates,
    language,
    openGraph: {
      title: t("seo.about.title"),
      description: t("seo.about.description"),
      siteName: t("seo.site_name")
    },
    twitter: {
      title: t("seo.about.title"),
      description: t("seo.about.description")
    },
    structuredData
  });

  return (
    <div className="pt-16">
      <About />
      <Mission />
      <WhyUs />
    </div>
  );
}
