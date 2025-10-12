const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  // /static ve Vite çıktısı → üretim çıktısına aynen kopyala
  eleventyConfig.addPassthroughCopy({ "static": "static" });
  eleventyConfig.addPassthroughCopy({ "dist": "." });

  // TR tarih formatı
  const readableDate = (dateObj) => {
    try {
      return DateTime.fromISO(dateObj).setZone("Europe/Istanbul").toFormat("dd LLL yyyy");
    } catch {
      return dateObj;
    }
  };

  eleventyConfig.addFilter("readableDate", readableDate);
  eleventyConfig.addNunjucksFilter("readableDate", readableDate);

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
