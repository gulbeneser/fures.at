const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // /static ve Vite çıktısı → üretim çıktısına aynen kopyala
  eleventyConfig.addPassthroughCopy({ "static": "static" });
  eleventyConfig.addPassthroughCopy({ "dist": "." });
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

  eleventyConfig.addFilter("readableDate", readableDate);
  eleventyConfig.addNunjucksFilter("readableDate", readableDate);
  eleventyConfig.addFilter("rssDate", rssDate);
  eleventyConfig.addNunjucksFilter("rssDate", rssDate);
  eleventyConfig.addFilter("markdown", markdownFilter);
  eleventyConfig.addNunjucksFilter("markdown", markdownFilter);

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
