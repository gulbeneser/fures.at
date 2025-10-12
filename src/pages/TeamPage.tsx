import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Team } from "../components/Team";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useSEO,
  buildLanguageAlternates,
  canonicalPathForLanguage,
  createBreadcrumbSchema,
  createOrganizationSchema,
  createTeamSchema
} from "../hooks/useSEO";

export function TeamPage() {
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
      `${t("seo.common.keywords")}, ${t("seo.team.keywords")}`
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0),
    [language, t]
  );

  const teamMembers = useMemo(
    () => [
      {
        name: t("team.gulben.name"),
        role: t("team.gulben.role"),
        description: t("team.gulben.description")
      },
      {
        name: t("team.furkan.name"),
        role: t("team.furkan.role"),
        description: t("team.furkan.description")
      }
    ],
    [language, t]
  );

  const structuredData = useMemo(
    () => [
      createOrganizationSchema(t("seo.organization.description")),
      createTeamSchema(teamMembers),
      createBreadcrumbSchema([
        { name: t("nav.home"), path: canonicalPathForLanguage("/", language) },
        { name: t("team.title"), path: canonicalPath }
      ])
    ],
    [language, t, canonicalPath, teamMembers]
  );

  useSEO({
    title: t("seo.team.title"),
    description: t("seo.team.description"),
    keywords,
    canonicalPath,
    alternates,
    language,
    openGraph: {
      title: t("seo.team.title"),
      description: t("seo.team.description"),
      siteName: t("seo.site_name")
    },
    twitter: {
      title: t("seo.team.title"),
      description: t("seo.team.description")
    },
    structuredData
  });

  return (
    <div className="pt-16">
      <Team />
    </div>
  );
}
