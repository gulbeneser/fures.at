import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FAQ } from "../components/FAQ";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useSEO,
  buildLanguageAlternates,
  canonicalPathForLanguage,
  createBreadcrumbSchema,
  createFAQSchema,
  createOrganizationSchema
} from "../hooks/useSEO";

export function FAQPage() {
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
      `${t("seo.common.keywords")}, ${t("seo.faq.keywords")}`
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0),
    [language, t]
  );

  const faqs = useMemo(
    () => [
      { question: t("faq.q1"), answer: t("faq.a1") },
      { question: t("faq.q2"), answer: t("faq.a2") },
      { question: t("faq.q3"), answer: t("faq.a3") },
      { question: t("faq.q4"), answer: t("faq.a4") }
    ],
    [language, t]
  );

  const structuredData = useMemo(
    () => [
      createOrganizationSchema(t("seo.organization.description")),
      createFAQSchema(faqs),
      createBreadcrumbSchema([
        { name: t("nav.home"), path: canonicalPathForLanguage("/", language) },
        { name: t("faq.title"), path: canonicalPath }
      ])
    ],
    [language, t, canonicalPath, faqs]
  );

  useSEO({
    title: t("seo.faq.title"),
    description: t("seo.faq.description"),
    keywords,
    canonicalPath,
    alternates,
    language,
    openGraph: {
      title: t("seo.faq.title"),
      description: t("seo.faq.description"),
      siteName: t("seo.site_name")
    },
    twitter: {
      title: t("seo.faq.title"),
      description: t("seo.faq.description")
    },
    structuredData
  });

  return (
    <div className="pt-16">
      <FAQ />
    </div>
  );
}
