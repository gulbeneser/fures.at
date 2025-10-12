import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { CTA } from "../components/CTA";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useSEO,
  buildLanguageAlternates,
  canonicalPathForLanguage,
  createBreadcrumbSchema,
  createOrganizationSchema
} from "../hooks/useSEO";

export function ContactPage() {
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
      `${t("seo.common.keywords")}, ${t("seo.contact.keywords")}`
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
        { name: t("nav.contact"), path: canonicalPath }
      ])
    ],
    [language, t, canonicalPath]
  );

  useSEO({
    title: t("seo.contact.title"),
    description: t("seo.contact.description"),
    keywords,
    canonicalPath,
    alternates,
    language,
    openGraph: {
      title: t("seo.contact.title"),
      description: t("seo.contact.description"),
      siteName: t("seo.site_name")
    },
    twitter: {
      title: t("seo.contact.title"),
      description: t("seo.contact.description")
    },
    structuredData
  });

  return (
    <div className="pt-16">
      <CTA />
    </div>
  );
}
