const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const GLOB_DIR = path.join(process.cwd(), "kampanyalar", "tr");
const SITE_BASE_URL = "https://fures.at";
const MAX_ITEMS = 20;

const IMAGE_MIME = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

function walkMarkdown(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdown(filePath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(filePath);
    }
  }
  return files;
}

function toIsoDate(value) {
  if (!value) {
    return new Date().toISOString();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

function buildAbsoluteUrl(relative) {
  if (!relative || typeof relative !== "string") {
    return undefined;
  }
  if (/^https?:\/\//i.test(relative)) {
    return relative;
  }
  if (!relative.startsWith("/")) {
    return `${SITE_BASE_URL}/${relative}`;
  }
  return `${SITE_BASE_URL}${relative}`;
}

function inferImage(pathValue) {
  if (!pathValue || typeof pathValue !== "string") {
    return undefined;
  }
  const ext = path.extname(pathValue).toLowerCase();
  return IMAGE_MIME.get(ext);
}

function parseCampaign(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const slug = typeof data.slug === "string" && data.slug.trim().length > 0
    ? data.slug.trim()
    : path.basename(filePath, ".md");

  const dateIso = toIsoDate(data.date);
  const summary = typeof data.summary === "string" ? data.summary.trim() : "";
  const ogImage = typeof data.ogImage === "string" ? data.ogImage.trim() : "/fures-og.jpg";
  const ogImageAbsolute = buildAbsoluteUrl(ogImage);
  const ogImageMime = inferImage(ogImage);
  let ogImageSize;
  if (ogImageAbsolute === undefined && ogImage && ogImage.startsWith("/")) {
    const absPath = path.join(process.cwd(), ogImage.slice(1));
    if (fs.existsSync(absPath)) {
      try {
        const stats = fs.statSync(absPath);
        if (stats.isFile()) {
          ogImageSize = stats.size;
        }
      } catch (error) {
        console.warn("[campaignPosts] Görsel boyutu okunamadı", error);
      }
    }
  }

  const instagramCaption = typeof data.instagramCaption === "string" ? data.instagramCaption.trim() : "";
  const instagramHashtags = Array.isArray(data.instagramHashtags) ? data.instagramHashtags : [];
  const linkedinPost = typeof data.linkedinPost === "string" ? data.linkedinPost.trim() : "";
  const linkedinHashtags = Array.isArray(data.linkedinHashtags) ? data.linkedinHashtags : [];
  const packages = Array.isArray(data.packages) ? data.packages : [];

  return {
    title: typeof data.title === "string" ? data.title.trim() : slug,
    date: dateIso,
    slug,
    summary,
    ogImage,
    ogImageAbsolute,
    imageAbsolute: ogImageAbsolute,
    imageAlt: typeof data.imageAlt === "string" ? data.imageAlt.trim() : "",
    description: typeof data.description === "string" ? data.description.trim() : summary,
    instagramCaption,
    instagramHashtags,
    linkedinPost,
    linkedinHashtags,
    packages,
    utm: typeof data.utm === "string" ? data.utm.trim() : "",
    content: content.trim(),
    url: `/kampanyalar/${slug}`,
    imageMime: ogImageMime,
    imageSize: ogImageSize,
  };
}

module.exports = () => {
  const files = walkMarkdown(GLOB_DIR);
  const posts = files.map(parseCampaign);

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  return {
    all: posts.slice(0, MAX_ITEMS),
    turkish: posts.slice(0, MAX_ITEMS),
  };
};
