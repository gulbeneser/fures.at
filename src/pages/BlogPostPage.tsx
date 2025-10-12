import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DateTime } from "luxon";
import { LANGUAGE_META, useLanguage } from "../contexts/LanguageContext";
import { getBlogPostBySlug } from "../utils/blog";
import { renderMarkdown } from "../utils/markdown";

function formatDate(dateIso: string, language: keyof typeof LANGUAGE_META) {
  const locale = LANGUAGE_META[language].locale.replace("_", "-");
  const parsed = DateTime.fromISO(dateIso, { zone: "utc" });

  if (!parsed.isValid) {
    return dateIso;
  }

  return parsed.setLocale(locale).toLocaleString(DateTime.DATE_FULL);
}

export function BlogPostPage() {
  const { slug } = useParams();
  const post = slug ? getBlogPostBySlug(slug) : undefined;
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (post && language !== post.lang) {
      setLanguage(post.lang);
    }
  }, [language, post, setLanguage]);

  const renderedContent = useMemo(() => {
    if (!post) {
      return "";
    }

    return renderMarkdown(post.content);
  }, [post]);

  if (!post) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black px-4 py-32 text-white">
        <div className="max-w-xl text-center">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">{t("blog.not_found")}</h1>
          <p className="mt-4 text-base text-slate-300">{t("blog.not_found_description")}</p>
          <Link
            to="/blog"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-3 text-sm font-medium uppercase tracking-[0.32em] text-white transition-colors duration-300 hover:border-orange-500/80 hover:bg-orange-500/10 hover:text-orange-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("blog.back_to_list")}
          </Link>
        </div>
      </section>
    );
  }

  const formattedDate = formatDate(post.date, post.lang);

  return (
    <article className="relative min-h-screen bg-black py-32 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,122,41,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(143,91,255,0.14),transparent_60%)]" />
      <div className="mx-auto w-full max-w-3xl px-4">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-medium uppercase tracking-[0.32em] text-white transition-colors duration-300 hover:border-orange-500/80 hover:bg-orange-500/10 hover:text-orange-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("blog.back_to_list")}
        </Link>

        <header className="mt-10">
          <div className="text-xs uppercase tracking-[0.35em] text-orange-300/80">
            {formattedDate}
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-1 uppercase tracking-[0.4em] text-white/80">
              {post.lang.toUpperCase()}
            </span>
          </div>
        </header>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="mt-12 h-auto w-full rounded-3xl border border-white/10 object-cover object-center shadow-[0_28px_68px_-42px_rgba(255,122,41,0.55)]"
          />
        )}

        <div
          className="blog-content mt-12"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </div>
    </article>
  );
}
