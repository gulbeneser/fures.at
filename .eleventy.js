const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // /static ve Vite çıktısı → üretim çıktısına aynen kopyala
  eleventyConfig.addPassthroughCopy({ "static": "static" });
  eleventyConfig.addPassthroughCopy({ "dist": "." });
  eleventyConfig.addPassthroughCopy({ "aboutcyprus": "aboutcyprus" });
  eleventyConfig.ignores.add("static/images/ai-daily/.gitkeep");
  eleventyConfig.ignores.add("dist/static/images/ai-daily/.gitkeep");

  // TR tarih formatı
  const readableDate = (dateObj) => {
    try {
      return DateTime.fromISO(dateObj).setZone("Europe/Istanbul").toFormat("dd LLL yyyy");
    } catch {
      return dateObj;
    }
  };

  const rssDate = (dateObj) => {
    if (!dateObj) {
      return "";
    }

    try {
      return DateTime.fromISO(dateObj, { zone: "utc" }).toUTC().toHTTP();
    } catch {
      try {
        return DateTime.fromJSDate(new Date(dateObj)).toUTC().toHTTP();
      } catch {
        return dateObj;
      }
    }
  };

  const markdownRenderer = markdownIt({ html: true, linkify: true, typographer: true });
  eleventyConfig.setLibrary("md", markdownRenderer);

  const markdownFilter = (content) => (content ? markdownRenderer.render(String(content)) : "");

  const toPlainText = (value) => {
    if (value === undefined || value === null) {
      return "";
    }

    const rendered = markdownFilter(value);

    if (!rendered) {
      return "";
    }

    const normalised = rendered
      .replace(/\r\n/g, "\n")
      .replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|blockquote)\s*>/gi, "\n\n")
      .replace(/<\/(tr|table|thead|tbody)\s*>/gi, "\n")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(/<\/(li)\s*>/gi, "\n")
      .replace(/<\/(ul|ol)\s*>/gi, "\n\n");

    const withoutTags = normalised.replace(/<[^>]+>/g, "");

    const collapsed = withoutTags
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ");

    const trimmed = collapsed.trim();

    return trimmed ? markdownRenderer.utils.unescapeAll(trimmed) : "";
  };

  eleventyConfig.addFilter("readableDate", readableDate);
  eleventyConfig.addNunjucksFilter("readableDate", readableDate);
  eleventyConfig.addFilter("rssDate", rssDate);
  eleventyConfig.addNunjucksFilter("rssDate", rssDate);
  eleventyConfig.addFilter("markdown", markdownFilter);
  eleventyConfig.addNunjucksFilter("markdown", markdownFilter);
  eleventyConfig.addFilter("plainText", toPlainText);
  eleventyConfig.addNunjucksFilter("plainText", toPlainText);

  // Koleksiyonlar (dil bazlı)
  eleventyConfig.addCollection("posts", (c) =>
    c.getFilteredByGlob("content/posts/**/**/*.md")
  );
  eleventyConfig.addCollection("posts_tr", (c) =>
    c.getFilteredByGlob("content/posts/tr/**/*.md")
  );
  eleventyConfig.addCollection("posts_en", (c) =>
    c.getFilteredByGlob("content/posts/en/**/*.md")
  );
  eleventyConfig.addCollection("posts_ru", (c) =>
    c.getFilteredByGlob("content/posts/ru/**/*.md")
  );
  eleventyConfig.addCollection("posts_de", (c) =>
    c.getFilteredByGlob("content/posts/de/**/*.md")
  );

  return {
    dir: {
      input: ".",
      output: "public",
      includes: "src/_includes",
      data: "src/_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"]
  };
};
