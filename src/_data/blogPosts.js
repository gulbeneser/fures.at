const fs = require("fs");
const path = require("path");
const { DateTime } = require("luxon");
const { parse } = require("yaml");

const FRONT_MATTER_REGEX = /^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*/;
const SUPPORTED_LANGS = new Set(["tr", "en", "de", "ru"]);
const SITE_URL = "https://fures.at";
const BLOG_URL = `${SITE_URL}/blog`;
const MAX_ITEMS = 50;

function parseFrontMatter(raw) {
  const match = raw.match(FRONT_MATTER_REGEX);

  if (!match) {
    return { data: {}, content: raw.trim() };
  }

  let data = {};

  try {
    data = parse(match[1]) || {};
  } catch (error) {
    console.warn("[rss] Front matter parse error", error);
  }

  const content = raw.slice(match[0].length).trimStart();

  return { data, content };
}

function discoverMarkdownFiles(startDir) {
  const entries = fs.readdirSync(startDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(startDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...discoverMarkdownFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(entryPath);
    }
  }

  return files;
}

function normaliseDate(value, fallbackDate) {
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = DateTime.fromISO(value, { zone: "utc" });

    if (parsed.isValid) {
      return parsed.toUTC();
    }

    const jsParsed = DateTime.fromJSDate(new Date(value));

    if (jsParsed.isValid) {
      return jsParsed.toUTC();
    }
  }

  if (fallbackDate) {
    const fallback = DateTime.fromJSDate(fallbackDate);

    if (fallback.isValid) {
      return fallback.toUTC();
    }
  }

  return DateTime.utc();
}

function buildExcerpt(sourceExcerpt, content) {
  if (typeof sourceExcerpt === "string" && sourceExcerpt.trim().length > 0) {
    return sourceExcerpt.trim();
  }

  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0 && !block.startsWith("#"));

  if (blocks.length === 0) {
    return "";
  }

  const plain = blocks[0]
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/^\d+\.\s*/gm, "")
    .replace(/^[-*+]\s*/gm, "")
    .trim();

  if (plain.length <= 240) {
    return plain;
  }

  return `${plain.slice(0, 237)}...`;
}

function parsePost(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = parseFrontMatter(raw);
  const slug = path.basename(filePath, ".md");
  const stats = fs.statSync(filePath);

  const lang = typeof data.lang === "string" && SUPPORTED_LANGS.has(data.lang.toLowerCase())
    ? data.lang.toLowerCase()
    : "tr";

  const title = typeof data.title === "string" && data.title.trim().length > 0
    ? data.title.trim()
    : slug;

  const excerpt = buildExcerpt(data.excerpt, content);
  const dateTime = normaliseDate(data.date, stats.mtime);

  return {
    slug,
    title,
    lang,
    excerpt,
    content: content.trim(),
    date: dateTime.toISO(),
    timestamp: dateTime.toMillis(),
    url: `${BLOG_URL}/${slug}`,
    image: typeof data.image === "string" ? data.image : undefined,
  };
}

module.exports = () => {
  const blogDir = path.resolve(__dirname, "..", "..", "blog");

  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = discoverMarkdownFiles(blogDir);
  const posts = files.map(parsePost);

  posts.sort((a, b) => b.timestamp - a.timestamp);

  return posts.slice(0, MAX_ITEMS);
};
