import { parse as parseYaml } from "yaml";
import { SUPPORTED_LANGUAGES } from "../contexts/LanguageContext";
import type { Language } from "../contexts/LanguageContext";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  image?: string;
  lang: Language;
  excerpt: string;
  content: string;
  sourcePath: string;
  sources: BlogSourceLink[];
}

export interface BlogSourceLink {
  title: string;
  url: string;
}

interface FrontMatterResult {
  data: Record<string, unknown>;
  content: string;
}

const FRONT_MATTER_REGEX = /^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*[\r\n]*/;

const markdownModules = import.meta.glob<string>("../../blog/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const posts: BlogPost[] = [];

for (const [path, rawContent] of Object.entries(markdownModules)) {
  const slug = path.split("/").pop()?.replace(/\.md$/, "");

  if (!slug) {
    continue;
  }

  const { data, content } = parseFrontMatter(rawContent ?? "");

  const langValue = typeof data.lang === "string" ? (data.lang.toLowerCase() as Language) : undefined;
  const lang: Language = langValue && SUPPORTED_LANGUAGES.includes(langValue)
    ? langValue
    : "tr";
  const title = typeof data.title === "string" ? data.title : slug;
  const date = typeof data.date === "string" ? data.date : new Date().toISOString();
  const image = typeof data.image === "string" ? data.image : undefined;

  const excerpt = getExcerpt(data.excerpt, content);

  const sources = Array.isArray(data.sources)
    ? (data.sources as unknown[])
        .map((source) => {
          if (!source || typeof source !== "object") {
            return null;
          }

          const entry = source as Record<string, unknown>;
          const sourceTitle = typeof entry.title === "string" ? entry.title.trim() : "";
          const url = typeof entry.url === "string" ? entry.url.trim() : "";

          if (!url) {
            return null;
          }

          return {
            title: sourceTitle || url,
            url,
          };
        })
        .filter((value): value is BlogSourceLink => Boolean(value))
    : [];

  posts.push({
    slug,
    title,
    date,
    image,
    lang,
    excerpt,
    content: content.trim(),
    sourcePath: path,
    sources,
  });
}

posts.sort((a, b) => {
  const dateA = Date.parse(a.date);
  const dateB = Date.parse(b.date);

  if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
    return a.slug.localeCompare(b.slug);
  }

  return dateB - dateA;
});

const postsBySlug = new Map(posts.map((post) => [post.slug, post]));

function getExcerpt(frontMatterExcerpt: unknown, markdownContent: string) {
  if (typeof frontMatterExcerpt === "string" && frontMatterExcerpt.trim().length > 0) {
    return frontMatterExcerpt.trim();
  }

  const cleaned = markdownContent
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith("#"));

  if (!cleaned) {
    return "";
  }

  const plain = cleaned
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();

  if (plain.length <= 220) {
    return plain;
  }

  return `${plain.slice(0, 217)}...`;
}

export function getAllBlogPosts() {
  return posts.slice();
}

export function getPostsByLanguage(language: Language) {
  return posts.filter((post) => post.lang === language);
}

export function getBlogPostBySlug(slug: string) {
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
      console.warn("Failed to parse front matter for", { raw: frontMatter, error });
    }
  }

  return {
    data: parsedData,
    content,
  };
}
