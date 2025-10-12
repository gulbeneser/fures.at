import { DEFAULT_LANGUAGE, LANGUAGE_META, SUPPORTED_LANGUAGES, type Language } from "../contexts/LanguageContext";

const ENV_SITE_URL = (import.meta.env?.VITE_SITE_URL ?? "").trim();
const FALLBACK_SITE_URL = (ENV_SITE_URL || "https://fures.at").replace(/\/$/, "");

export const DEFAULT_OG_IMAGE = "/images/fures.png";
export const SERVICE_AREA = ["Cyprus", "Northern Cyprus", "Turkey"] as const;

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export function resolveBaseUrl(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(origin)) {
      return FALLBACK_SITE_URL;
    }
    return origin;
  }

  return FALLBACK_SITE_URL;
}

export function buildAbsoluteUrl(path: string): string {
  if (!path) {
    return resolveBaseUrl();
  }

  if (ABSOLUTE_URL_REGEX.test(path)) {
    return path;
  }

  return new URL(path, `${resolveBaseUrl()}/`).toString();
}

export function normalizePath(path: string): string {
  if (!path) {
    return "/";
  }

  let workingPath = path;

  if (ABSOLUTE_URL_REGEX.test(workingPath)) {
    try {
      const url = new URL(workingPath);
      workingPath = url.pathname;
    } catch {
      workingPath = "/";
    }
  }

  const [pathname] = workingPath.split("?");
  let cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (cleanPath !== "/" && cleanPath.endsWith("/")) {
    cleanPath = cleanPath.slice(0, -1);
  }

  return cleanPath || "/";
}

export function canonicalPathForLanguage(path: string, language: Language): string {
  const cleanPath = normalizePath(path);
  return language === DEFAULT_LANGUAGE ? cleanPath : `${cleanPath}?lang=${language}`;
}

export function buildLanguageAlternates(path: string): { hrefLang: string; path: string }[] {
  const cleanPath = normalizePath(path);
  return SUPPORTED_LANGUAGES.map((lang) => ({
    hrefLang: LANGUAGE_META[lang].hrefLang,
    path: canonicalPathForLanguage(cleanPath, lang)
  }));
}

export function createBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path)
    }))
  };
}

export function createOrganizationSchema(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${buildAbsoluteUrl("/")}#organization`,
    name: "Fures Tech",
    legalName: "Fures Tech",
    url: buildAbsoluteUrl("/"),
    logo: buildAbsoluteUrl(DEFAULT_OG_IMAGE),
    description,
    areaServed: [...SERVICE_AREA],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gazimağusa",
      addressRegion: "North Cyprus",
      addressCountry: "CY"
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+90-548-876-6819",
        email: "info@fures.at",
        availableLanguage: ["Turkish", "English", "German", "Russian"]
      }
    ]
  };
}

export function createWebsiteSchema(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${buildAbsoluteUrl("/")}#website`,
    url: buildAbsoluteUrl("/"),
    name: "Fures Tech",
    description,
    inLanguage: SUPPORTED_LANGUAGES.map((lang) => LANGUAGE_META[lang].locale),
    publisher: { "@id": `${buildAbsoluteUrl("/")}#organization` },
    potentialAction: {
      "@type": "ContactAction",
      target: buildAbsoluteUrl("/iletisim"),
      name: "Contact Fures Tech"
    }
  };
}

export function createServiceItemList(
  name: string,
  description: string,
  services: { name: string; description: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        provider: { "@id": `${buildAbsoluteUrl("/")}#organization` },
        areaServed: [...SERVICE_AREA]
      }
    }))
  };
}

export function createFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function createTeamSchema(team: { name: string; role: string; description: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Fures Tech Team",
    itemListElement: team.map((member, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: member.name,
        jobTitle: member.role,
        description: member.description,
        worksFor: { "@id": `${buildAbsoluteUrl("/")}#organization` }
      }
    }))
  };
}

export function createProjectsSchema(
  projects: { name: string; description: string; url: string }[],
  name: string,
  description: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.name,
        description: project.description,
        url: buildAbsoluteUrl(project.url)
      }
    }))
  };
}

export function createPersonSchema({
  name,
  jobTitle,
  description,
  url
}: {
  name: string;
  jobTitle: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle,
    description,
    url: buildAbsoluteUrl(url),
    worksFor: { "@id": `${buildAbsoluteUrl("/")}#organization` }
  };
}

export function createSoftwareApplicationSchema({
  name,
  description,
  url
}: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    publisher: { "@id": `${buildAbsoluteUrl("/")}#organization` },
    url: buildAbsoluteUrl(url)
  };
}

export { FALLBACK_SITE_URL as SITE_URL };
