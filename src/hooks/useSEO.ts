import { useEffect } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_META,
  SUPPORTED_LANGUAGES,
  type Language
} from "../contexts/LanguageContext";
import {
  DEFAULT_OG_IMAGE,
  buildAbsoluteUrl,
  buildLanguageAlternates,
  canonicalPathForLanguage,
  createBreadcrumbSchema,
  createFAQSchema,
  createOrganizationSchema,
  createPersonSchema,
  createProjectsSchema,
  createServiceItemList,
  createSoftwareApplicationSchema,
  createTeamSchema,
  createWebsiteSchema,
  normalizePath
} from "../utils/seo";

interface AlternateLink {
  hrefLang: string;
  path: string;
}

interface OpenGraphConfig {
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  url?: string;
  siteName?: string;
}

interface TwitterConfig {
  card?: string;
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  robots?: string;
  canonicalPath?: string;
  alternates?: AlternateLink[];
  openGraph?: OpenGraphConfig;
  twitter?: TwitterConfig;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  language?: Language;
}

type MetaAttribute = "name" | "property";

const DEFAULT_ROBOTS = "index, follow";

const upsertMetaTag = (attribute: MetaAttribute, key: string, value?: string) => {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (value === undefined || value === "") {
    if (element && element.dataset.managed === "seo") {
      element.remove();
    }
    return;
  }

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", value);
  element.dataset.managed = "seo";
};

const upsertCanonicalLink = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>("link[rel='canonical']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
  link.dataset.managed = "seo";
};

const resetManagedAlternates = () => {
  const managed = document.head.querySelectorAll<HTMLLinkElement>("link[rel='alternate'][data-managed='seo']");
  managed.forEach((link) => link.remove());
};

const appendAlternateLink = (hrefLang: string, href: string) => {
  const link = document.createElement("link");
  link.rel = "alternate";
  link.setAttribute("hreflang", hrefLang);
  link.setAttribute("href", href);
  link.dataset.managed = "seo";
  document.head.appendChild(link);
};

const resetStructuredData = () => {
  const scripts = document.head.querySelectorAll<HTMLScriptElement>("script[type='application/ld+json'][data-managed='seo']");
  scripts.forEach((script) => script.remove());
};

const appendStructuredData = (data: Record<string, unknown> | Array<Record<string, unknown>>) => {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.managed = "seo";
  script.textContent = JSON.stringify(data, null, 2);
  document.head.appendChild(script);
};

const toAbsoluteKeywords = (keywords?: string[]) =>
  keywords?.map((keyword) => keyword.trim()).filter((keyword) => keyword.length > 0);

export function useSEO({
  title,
  description,
  keywords,
  robots = DEFAULT_ROBOTS,
  canonicalPath = "/",
  alternates,
  openGraph,
  twitter,
  structuredData,
  language = DEFAULT_LANGUAGE
}: SEOConfig) {
  useEffect(() => {
    document.title = title;

    upsertMetaTag("name", "description", description);

    const keywordList = toAbsoluteKeywords(keywords);
    upsertMetaTag("name", "keywords", keywordList?.join(", "));
    upsertMetaTag("name", "robots", robots);

    const canonicalUrl = buildAbsoluteUrl(canonicalPath);
    upsertCanonicalLink(canonicalUrl);

    const alternatesToRender = alternates ?? buildLanguageAlternates(canonicalPath);
    resetManagedAlternates();
    alternatesToRender.forEach((alternate) => {
      appendAlternateLink(alternate.hrefLang, buildAbsoluteUrl(alternate.path));
    });

    const defaultHrefLang = LANGUAGE_META[DEFAULT_LANGUAGE].hrefLang;
    const defaultAlternate = alternatesToRender.find((alt) => alt.hrefLang === defaultHrefLang);
    appendAlternateLink(
      "x-default",
      buildAbsoluteUrl(
        defaultAlternate
          ? defaultAlternate.path
          : canonicalPathForLanguage(normalizePath(canonicalPath), DEFAULT_LANGUAGE)
      )
    );

    const ogImage = openGraph?.image ? buildAbsoluteUrl(openGraph.image) : buildAbsoluteUrl(DEFAULT_OG_IMAGE);
    const ogTitle = openGraph?.title ?? title;
    const ogDescription = openGraph?.description ?? description;
    const ogType = openGraph?.type ?? "website";
    const ogUrl = openGraph?.url ? buildAbsoluteUrl(openGraph.url) : canonicalUrl;
    const siteName = openGraph?.siteName;

    upsertMetaTag("property", "og:title", ogTitle);
    upsertMetaTag("property", "og:description", ogDescription);
    upsertMetaTag("property", "og:type", ogType);
    upsertMetaTag("property", "og:url", ogUrl);
    upsertMetaTag("property", "og:image", ogImage);
    if (siteName) {
      upsertMetaTag("property", "og:site_name", siteName);
    }

    const locale = LANGUAGE_META[language]?.locale ?? LANGUAGE_META[DEFAULT_LANGUAGE].locale;
    upsertMetaTag("property", "og:locale", locale);

    const alternateLocales = SUPPORTED_LANGUAGES.filter((lang) => lang !== language).map(
      (lang) => LANGUAGE_META[lang].locale
    );
    document.head
      .querySelectorAll<HTMLMetaElement>("meta[property='og:locale:alternate'][data-managed='seo']")
      .forEach((meta) => meta.remove());
    alternateLocales.forEach((altLocale) => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:locale:alternate");
      meta.setAttribute("content", altLocale);
      meta.dataset.managed = "seo";
      document.head.appendChild(meta);
    });

    const twitterImage = twitter?.image ? buildAbsoluteUrl(twitter.image) : ogImage;
    upsertMetaTag("name", "twitter:card", twitter?.card ?? "summary_large_image");
    upsertMetaTag("name", "twitter:title", twitter?.title ?? title);
    upsertMetaTag("name", "twitter:description", twitter?.description ?? description);
    upsertMetaTag("name", "twitter:image", twitterImage);
    if (twitter?.site) {
      upsertMetaTag("name", "twitter:site", twitter.site);
    }
    if (twitter?.creator) {
      upsertMetaTag("name", "twitter:creator", twitter.creator);
    }

    resetStructuredData();
    if (structuredData) {
      appendStructuredData(structuredData instanceof Array ? structuredData : [structuredData]);
    }
  }, [
    title,
    description,
    JSON.stringify(toAbsoluteKeywords(keywords)),
    robots,
    canonicalPath,
    JSON.stringify(alternates),
    JSON.stringify(openGraph),
    JSON.stringify(twitter),
    JSON.stringify(structuredData),
    language
  ]);
}

export {
  buildLanguageAlternates,
  canonicalPathForLanguage,
  createBreadcrumbSchema,
  createFAQSchema,
  createOrganizationSchema,
  createPersonSchema,
  createProjectsSchema,
  createServiceItemList,
  createSoftwareApplicationSchema,
  createTeamSchema,
  createWebsiteSchema
};
