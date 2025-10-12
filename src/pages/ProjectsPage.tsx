import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Projects, PROJECTS } from "../components/Projects";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useSEO,
  buildLanguageAlternates,
  canonicalPathForLanguage,
  createBreadcrumbSchema,
  createOrganizationSchema,
  createProjectsSchema
} from "../hooks/useSEO";

export function ProjectsPage() {
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
      `${t("seo.common.keywords")}, ${t("seo.projects.keywords")}`
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0),
    [language, t]
  );

  const projectItems = useMemo(
    () => PROJECTS.map((project) => ({
      name: project.name,
      description: project.description,
      url: project.link
    })),
    []
  );

  const structuredData = useMemo(
    () => [
      createOrganizationSchema(t("seo.organization.description")),
      createProjectsSchema(projectItems, t("seo.projects.title"), t("seo.projects.description")),
      createBreadcrumbSchema([
        { name: t("nav.home"), path: canonicalPathForLanguage("/", language) },
        { name: t("nav.projects"), path: canonicalPath }
      ])
    ],
    [language, t, canonicalPath, projectItems]
  );

  useSEO({
    title: t("seo.projects.title"),
    description: t("seo.projects.description"),
    keywords,
    canonicalPath,
    alternates,
    language,
    openGraph: {
      title: t("seo.projects.title"),
      description: t("seo.projects.description"),
      siteName: t("seo.site_name")
    },
    twitter: {
      title: t("seo.projects.title"),
      description: t("seo.projects.description")
    },
    structuredData
  });

  return (
    <div className="pt-16">
      <Projects />
    </div>
  );
}
