import { parse as parseYaml } from "yaml";
import { SUPPORTED_LANGUAGES } from "../contexts/LanguageContext";
import type { Language } from "../contexts/LanguageContext";

export interface CampaignPackage {
  name: string;
  desc: string;
  cta: string;
}

export interface CampaignPost {
  slug: string;
  title: string;
  date: string;
  summary: string;
  ogImage: string;
  image: string;
  imageAlt?: string;
  lang: Language;
  description: string;
  content: string;
  instagramCaption: string;
  instagramHashtags: string[];
  linkedinPost: string;
  linkedinHashtags: string[];
  packages: CampaignPackage[];
  utm: string;
  sourcePath: string;
}

interface FrontMatterResult {
  data: Record<string, unknown>;
  content: string;
}

const FRONT_MATTER_REGEX = /^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*[\r\n]*/;

const markdownModules = import.meta.glob<string>("../../kampanyalar/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const campaignPosts: CampaignPost[] = [];

for (const [path, rawContent] of Object.entries(markdownModules)) {
  const slug = path.split("/").pop()?.replace(/\.md$/, "");

  if (!slug) {
    continue;
  }

  const { data, content } = parseFrontMatter(rawContent ?? "");

  const langValue = typeof data.lang === "string" ? (data.lang.toLowerCase() as Language) : undefined;
  const lang: Language = langValue && SUPPORTED_LANGUAGES.includes(langValue) ? langValue : "tr";
  const title = typeof data.title === "string" ? data.title : slug;
  const date = typeof data.date === "string" ? data.date : new Date().toISOString();
  const summary = typeof data.summary === "string" ? data.summary : "";
  const ogImage = typeof data.ogImage === "string" ? data.ogImage : "/fures-og.jpg";
  const imageAlt = typeof data.imageAlt === "string" ? data.imageAlt : undefined;
  const description = typeof data.description === "string" ? data.description : summary;
  const instagramCaption = typeof data.instagramCaption === "string" ? data.instagramCaption : "";
  const instagramHashtags = Array.isArray(data.instagramHashtags)
    ? (data.instagramHashtags as unknown[]).filter((item): item is string => typeof item === "string")
    : [];
  const linkedinPost = typeof data.linkedinPost === "string" ? data.linkedinPost : "";
  const linkedinHashtags = Array.isArray(data.linkedinHashtags)
    ? (data.linkedinHashtags as unknown[]).filter((item): item is string => typeof item === "string")
    : [];
  const packages = Array.isArray(data.packages)
    ? (data.packages as unknown[])
        .filter((item): item is CampaignPackage =>
          !!item
          && typeof item === "object"
          && typeof (item as Record<string, unknown>).name === "string"
          && typeof (item as Record<string, unknown>).desc === "string"
          && typeof (item as Record<string, unknown>).cta === "string",
        )
        .map((item) => ({
          name: item.name,
          desc: item.desc,
          cta: item.cta,
        }))
    : [];
  const utm = typeof data.utm === "string" ? data.utm : "";

  campaignPosts.push({
    slug,
    title,
    date,
    summary,
    ogImage,
    image: ogImage,
    imageAlt,
    lang,
    description,
    content: content.trim(),
    instagramCaption,
    instagramHashtags,
    linkedinPost,
    linkedinHashtags,
    packages,
    utm,
    sourcePath: path,
  });
}

campaignPosts.sort((a, b) => {
  const dateA = Date.parse(a.date);
  const dateB = Date.parse(b.date);

  if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
    return a.slug.localeCompare(b.slug);
  }

  return dateB - dateA;
});

const postsBySlug = new Map(campaignPosts.map((post) => [post.slug, post]));

export function getAllCampaignPosts() {
  return campaignPosts.slice();
}

export function getCampaignPostsByLanguage(language: Language) {
  return campaignPosts.filter((post) => post.lang === language);
}

export function getCampaignPostBySlug(slug: string) {
  return postsBySlug.get(slug);
}

function parseFrontMatter(raw: string): FrontMatterResult {
  const match = raw.match(FRONT_MATTER_REGEX);

  if (!match) {
    return { data: {}, content: raw };
  }

  const frontMatter = match[1];
  const content = raw.slice(match[0].length).replace(/^\s+/, "");
  let parsedData: Record<string, unknown> = {};

  try {
    const yamlResult = parseYaml(frontMatter.trim());

    if (yamlResult && typeof yamlResult === "object") {
      parsedData = yamlResult as Record<string, unknown>;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Failed to parse campaign front matter", { raw: frontMatter, error });
    }
  }

  return {
    data: parsedData,
    content,
  };
}
