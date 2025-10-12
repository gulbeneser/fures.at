import matter from "gray-matter";
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
}

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

  const { data, content } = matter(rawContent ?? "");

  const langValue = typeof data.lang === "string" ? (data.lang.toLowerCase() as Language) : undefined;
  const lang: Language = langValue && SUPPORTED_LANGUAGES.includes(langValue)
    ? langValue
    : "tr";
  const title = typeof data.title === "string" ? data.title : slug;
  const date = typeof data.date === "string" ? data.date : new Date().toISOString();
  const image = typeof data.image === "string" ? data.image : undefined;

  const excerpt = getExcerpt(data.excerpt, content);

  posts.push({
    slug,
    title,
    date,
    image,
    lang,
    excerpt,
    content: content.trim(),
    sourcePath: path,
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
