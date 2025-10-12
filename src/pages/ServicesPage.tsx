import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Services } from "../components/Services";
import { ServicePackages } from "../components/ServicePackages";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useSEO,
  buildLanguageAlternates,
  canonicalPathForLanguage,
  createBreadcrumbSchema,
  createOrganizationSchema,
  createServiceItemList
} from "../hooks/useSEO";

export function ServicesPage() {
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
      `${t("seo.common.keywords")}, ${t("seo.services.keywords")}`
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0),
    [language, t]
  );

  const serviceItems = useMemo(
    () => [
      { name: t("services.web_design"), description: t("services.web_design_desc") },
      { name: t("services.ai_automation"), description: t("services.ai_automation_desc") },
      { name: t("services.social_media"), description: t("services.social_media_desc") },
      { name: t("services.data_analytics"), description: t("services.data_analytics_desc") },
      { name: t("services.cloud_integration"), description: t("services.cloud_integration_desc") },
      { name: t("services.certified_translation"), description: t("services.certified_translation_desc") },
      { name: t("services.ad_targeting"), description: t("services.ad_targeting_desc") },
      { name: t("services.ai_content"), description: t("services.ai_content_desc") }
    ],
    [language, t]
  );

  const structuredData = useMemo(
    () => [
      createOrganizationSchema(t("seo.organization.description")),
      createServiceItemList(t("seo.services.title"), t("seo.services.description"), serviceItems),
      createBreadcrumbSchema([
        { name: t("nav.home"), path: canonicalPathForLanguage("/", language) },
        { name: t("nav.services"), path: canonicalPath }
      ])
    ],
    [language, t, canonicalPath, serviceItems]
  );

  useSEO({
    title: t("seo.services.title"),
    description: t("seo.services.description"),
    keywords,
    canonicalPath,
    alternates,
    language,
    openGraph: {
      title: t("seo.services.title"),
      description: t("seo.services.description"),
      siteName: t("seo.site_name")
    },
    twitter: {
      title: t("seo.services.title"),
      description: t("seo.services.description")
    },
    structuredData
  });

  return (
    <div className="pt-16">
      <Services />
      <ServicePackages />
    </div>
  );
}
