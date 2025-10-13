import { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DateTime } from "luxon";
import { LANGUAGE_META, useLanguage } from "../contexts/LanguageContext";
import { getPostsByLanguage } from "../utils/blog";
import { renderMarkdown } from "../utils/markdown";

function formatDate(dateIso: string, language: keyof typeof LANGUAGE_META) {
  const locale = LANGUAGE_META[language].locale.replace("_", "-");
  const parsed = DateTime.fromISO(dateIso, { zone: "utc" });

  if (!parsed.isValid) {
    return dateIso;
  }

  return parsed.setLocale(locale).toLocaleString(DateTime.DATE_FULL);
}

export function BlogListPage() {
  const { language, t } = useLanguage();
  const posts = getPostsByLanguage(language);
  const renderedPosts = useMemo(
    () => posts.map((post) => ({ ...post, html: renderMarkdown(post.content) })),
    [posts],
  );
  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const fallbackSrc = "/blog_images/default.png";

    if (event.currentTarget.src.endsWith(fallbackSrc)) {
      return;
    }

    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackSrc;
  }, []);
  return (
    <section className="relative min-h-screen bg-black py-32 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,122,41,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(143,91,255,0.14),transparent_60%)]" />
      <div className="mx-auto w-full max-w-6xl px-4">
        <header className="mb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/70">
            {t("nav.blog")}
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t("blog.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
            {t("blog.subtitle")}
          </p>
        </header>

        {renderedPosts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-slate-300">
            {t("blog.no_posts")}
          </div>
        ) : (
          <div className="space-y-10">
            {renderedPosts.map((post) => (
              <article
                key={post.slug}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_72px_-42px_rgba(255,122,41,0.75)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.35em] text-orange-300/80">
                  <span>{formatDate(post.date, language)}</span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.7rem] tracking-[0.4em] text-white/80">
                    {post.lang.toUpperCase()}
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-6">
                  <h2 className="text-3xl font-semibold text-white transition-colors duration-300 group-hover:text-orange-300">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  {post.image && (
                    <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-3xl">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-auto w-full rounded-3xl border border-white/10 object-cover object-center shadow-[0_24px_60px_-38px_rgba(255,122,41,0.5)] transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </Link>
                  )}

                  <div className="space-y-5">
                    {post.excerpt && (
                      <p className="text-base leading-7 text-slate-300">{post.excerpt}</p>
                    )}

                    <div
                      className="blog-content"
                      dangerouslySetInnerHTML={{ __html: post.html }}
                    />
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-medium tracking-[0.25em] text-white transition-colors duration-300 hover:border-orange-400/80 hover:bg-orange-500/10 hover:text-orange-200"
                  >
                    {t("blog.read_more")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <span className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    /blog/{post.slug}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
