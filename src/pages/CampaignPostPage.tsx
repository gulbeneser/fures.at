import { useEffect, useMemo, useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DateTime } from "luxon";
import { LANGUAGE_META, useLanguage } from "../contexts/LanguageContext";
import { getCampaignPostBySlug } from "../utils/campaigns";
import { renderMarkdown } from "../utils/markdown";
import { useSEO } from "../hooks/useSEO";

const SITE_BASE_URL = "https://fures.at";

function formatDate(dateIso: string, language: keyof typeof LANGUAGE_META) {
  const locale = LANGUAGE_META[language].locale.replace("_", "-");
  const parsed = DateTime.fromISO(dateIso, { zone: "utc" });

  if (!parsed.isValid) {
    return dateIso;
  }

  return parsed.setLocale(locale).toLocaleString(DateTime.DATE_FULL);
}

function formatInstagramPost(post: ReturnType<typeof getCampaignPostBySlug>) {
  if (!post) {
    return "";
  }
  const hashtags = post.instagramHashtags.length > 0 ? post.instagramHashtags.join(" ") : "";
  return [post.instagramCaption, hashtags].filter(Boolean).join("\n\n").trim();
}

function formatLinkedInPost(post: ReturnType<typeof getCampaignPostBySlug>) {
  if (!post) {
    return "";
  }
  const hashtags = post.linkedinHashtags.length > 0 ? post.linkedinHashtags.join(" ") : "";
  return [post.linkedinPost, hashtags].filter(Boolean).join("\n\n").trim();
}

export function CampaignPostPage() {
  const { slug } = useParams();
  const post = slug ? getCampaignPostBySlug(slug) : undefined;
  const { language, setLanguage, t } = useLanguage();

  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const fallbackSrc = "/images/fures.png";

    if (event.currentTarget.src.endsWith(fallbackSrc)) {
      return;
    }

    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackSrc;
  }, []);

  useEffect(() => {
    if (post && language !== post.lang) {
      setLanguage(post.lang);
    }
  }, [language, post, setLanguage]);

  const renderedContent = useMemo(() => (post ? renderMarkdown(post.content) : ""), [post]);

  const instagramText = useMemo(() => formatInstagramPost(post), [post]);
  const linkedinText = useMemo(() => formatLinkedInPost(post), [post]);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedKey) {
      return;
    }
    const timeout = window.setTimeout(() => setCopiedKey(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [copiedKey]);

  const copyText = useCallback(async (text: string) => {
    if (!text) {
      return false;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.warn("Clipboard write failed", error);
      }
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch (error) {
      console.warn("Clipboard fallback failed", error);
      return false;
    }
  }, []);

  const handleCopy = useCallback(
    async (network: "instagram" | "linkedin", text: string) => {
      const ok = await copyText(text);
      if (ok && post) {
        setCopiedKey(`${post.slug}:${network}`);
      }
    },
    [copyText, post],
  );

  const jsonLd = useMemo(() => {
    if (!post) {
      return null;
    }
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.summary || post.description,
      datePublished: post.date,
      image: post.ogImage,
      author: {
        "@type": "Organization",
        name: "Fures Tech",
        url: SITE_BASE_URL,
      },
      inLanguage: post.lang,
      mainEntityOfPage: `${SITE_BASE_URL}/kampanyalar/${post.slug}`,
    };
  }, [post]);

  useSEO({
    title: post ? `${post.title} | ${t("seo.campaigns.title")}` : t("campaigns.not_found"),
    description: post?.summary ?? post?.description ?? t("seo.campaigns.description"),
    keywords: t("seo.campaigns.keywords").split(", "),
    canonicalPath: post ? `/kampanyalar/${post.slug}` : "/kampanyalar",
    language: post?.lang ?? language,
  });

  if (!post) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black px-4 py-32 text-white">
        <div className="max-w-xl text-center">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">{t("campaigns.not_found")}</h1>
          <p className="mt-4 text-base text-slate-300">{t("campaigns.not_found_description")}</p>
          <Link
            to="/kampanyalar"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-3 text-sm font-medium uppercase tracking-[0.32em] text-white transition-colors duration-300 hover:border-orange-500/80 hover:bg-orange-500/10 hover:text-orange-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("campaigns.back_to_list")}
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
          to="/kampanyalar"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-medium uppercase tracking-[0.32em] text-white transition-colors duration-300 hover:border-orange-500/80 hover:bg-orange-500/10 hover:text-orange-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("campaigns.back_to_list")}
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

        {post.ogImage && (
          <img
            src={post.ogImage}
            alt={post.imageAlt ?? post.title}
            className="mt-12 h-auto w-full rounded-3xl border border-white/10 object-cover object-center shadow-[0_28px_68px_-42px_rgba(255,122,41,0.55)]"
            onError={handleImageError}
          />
        )}

        {post.summary && (
          <p className="mt-8 text-lg leading-8 text-slate-200">{post.summary}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {post.instagramHashtags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleCopy("instagram", instagramText)}
            className="inline-flex items-center gap-2 rounded-full border border-orange-400/50 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-200 transition-colors duration-300 hover:border-orange-300 hover:bg-orange-500/20"
            disabled={!instagramText}
          >
            {copiedKey === `${post.slug}:instagram` ? t("campaigns.copied_instagram") : t("campaigns.copy_instagram")}
          </button>
          <button
            type="button"
            onClick={() => handleCopy("linkedin", linkedinText)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-400/40 bg-slate-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200 transition-colors duration-300 hover:border-slate-200 hover:bg-slate-500/20"
            disabled={!linkedinText}
          >
            {copiedKey === `${post.slug}:linkedin` ? t("campaigns.copied_linkedin") : t("campaigns.copy_linkedin")}
          </button>
        </div>

        {post.packages.length > 0 && (
          <section className="mt-10 space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white">{t("campaigns.packages_title")}</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {post.packages.map((pkg) => (
                <article key={pkg.name} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-200 shadow-[0_20px_48px_-36px_rgba(255,122,41,0.4)]">
                  <h3 className="text-xl font-semibold text-white">{pkg.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{pkg.desc}</p>
                  <Link
                    to={pkg.cta}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-200 hover:text-orange-100"
                  >
                    {pkg.cta}
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        <div
          className="blog-content mt-12"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        )}
      </div>
    </article>
  );
}
