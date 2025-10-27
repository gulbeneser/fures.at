const fs = require("fs");
const path = require("path");
const { DateTime } = require("luxon");
const { parse } = require("yaml");

const FRONT_MATTER_REGEX = /^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*/;
const SUPPORTED_LANGS = new Set(["tr", "en", "de", "ru"]);
const SITE_URL = "https://fures.at";
const CAMPAIGN_URL = `${SITE_URL}/kampanyalar`;
const MAX_ITEMS = 50;
const REPO_ROOT = path.resolve(__dirname, "..", "..");

const IMAGE_MIME_TYPES = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

function buildAbsoluteImageUrl(imagePath) {
  if (typeof imagePath !== "string" || imagePath.trim().length === 0) {
    return undefined;
  }

  const trimmed = imagePath.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${SITE_URL}${trimmed}`;
  }

  return `${SITE_URL}/${trimmed}`;
}

function inferMimeType(imagePath) {
  if (typeof imagePath !== "string") {
    return undefined;
  }

  const extension = path.extname(imagePath).toLowerCase();
  return IMAGE_MIME_TYPES.get(extension);
}

function resolveImageOnDisk(imagePath) {
  if (typeof imagePath !== "string" || imagePath.trim().length === 0) {
    return undefined;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return undefined;
  }

  const relativePath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  const diskPath = path.resolve(REPO_ROOT, relativePath);

  if (!diskPath.startsWith(REPO_ROOT)) {
    return undefined;
  }

  if (!fs.existsSync(diskPath)) {
    return undefined;
  }

  const stats = fs.statSync(diskPath);
  if (!stats.isFile()) {
    return undefined;
  }

  return { size: stats.size };
}

function parseFrontMatter(raw) {
  const match = raw.match(FRONT_MATTER_REGEX);

  if (!match) {
    return { data: {}, content: raw.trim() };
  }

  let data = {};

  try {
    data = parse(match[1]) || {};
  } catch (error) {
    console.warn("[rss2] Front matter parse error", error);
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

function parseCampaign(filePath) {
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

  const description = typeof data.description === "string" && data.description.trim().length > 0
    ? data.description.trim()
    : "Fures Tech kampanya özeti";

  const image = typeof data.image === "string" && data.image.trim().length > 0 ? data.image.trim() : undefined;
  const imageAbsolute = image ? buildAbsoluteImageUrl(image) : undefined;
  const imageMime = image ? inferMimeType(image) : undefined;
  const imageStats = image ? resolveImageOnDisk(image) : undefined;

  const dateTime = normaliseDate(data.date, stats.mtime);

  return {
    slug,
    title,
    lang,
    description,
    content: content.trim(),
    date: dateTime.toISO(),
    timestamp: dateTime.toMillis(),
    url: `${CAMPAIGN_URL}/${slug}`,
    image,
    imageAbsolute,
    imageMime,
    imageSize: imageStats?.size,
  };
}

module.exports = () => {
  const campaignDir = path.resolve(__dirname, "..", "..", "kampanyalar");

  if (!fs.existsSync(campaignDir)) {
    return {
      all: [],
      turkish: [],
    };
  }

  const files = discoverMarkdownFiles(campaignDir);
  const posts = files.map(parseCampaign);

  posts.sort((a, b) => b.timestamp - a.timestamp);

  const turkishPosts = posts.filter((post) => post.lang === "tr").slice(0, MAX_ITEMS);
  const allPosts = posts.slice(0, MAX_ITEMS);

  return {
    all: allPosts,
    turkish: turkishPosts,
  };
};
