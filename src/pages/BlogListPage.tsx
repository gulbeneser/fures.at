import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DateTime } from "luxon";
import { LANGUAGE_META, useLanguage } from "../contexts/LanguageContext";
import { getPostsByLanguage } from "../utils/blog";

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

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-slate-300">
            {t("blog.no_posts")}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_65px_-45px_rgba(255,122,41,0.7)]"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-orange-300/80">
                  <span>{formatDate(post.date, language)}</span>
                  <span>{post.lang.toUpperCase()}</span>
                </div>

                <h2 className="mt-6 text-2xl font-semibold text-white transition-colors duration-300 group-hover:text-orange-300">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-300">
                  {post.excerpt}
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-medium tracking-[0.25em] text-white transition-colors duration-300 hover:border-orange-400/80 hover:bg-orange-500/10 hover:text-orange-200"
                  >
                    {t("blog.read_more")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {post.image && (
                    <img
                      src={post.image}
                      alt=""
                      className="h-12 w-12 rounded-full border border-white/10 object-cover object-center"
                      loading="lazy"
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
