import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useSEO,
  buildLanguageAlternates,
  canonicalPathForLanguage,
  createBreadcrumbSchema,
  createOrganizationSchema,
  createPersonSchema,
  createSoftwareApplicationSchema
} from "../hooks/useSEO";

export type ProfileSlug = "furkanyonat" | "gulbeneser" | "kariyer";

export interface ProfileConfig {
  slug: ProfileSlug;
  title: string;
  description: string;
  entryPath: string;
}

export const PROFILE_CONFIG: Record<ProfileSlug, ProfileConfig> = {
  furkanyonat: {
    slug: "furkanyonat",
    title: "Furkan Yonat Dijital CV",
    description:
      "Furkan Yonat'ın yapay zekâ destekli kariyer sunumu, projeler, sertifikalar ve interaktif sohbet asistanı ile birlikte bu sayfada yer alır.",
    entryPath: "/furkanyonat/index.html"
  },
  gulbeneser: {
    slug: "gulbeneser",
    title: "Gülben Eser Portfolyo",
    description:
      "Gülben Eser'in deneyimleri, projeleri ve generatif yapay zekâ araçları ile hazırlanan başvuru içeriklerini bu profilde inceleyebilirsiniz.",
    entryPath: "/gulbeneser/index.html"
  },
  kariyer: {
    slug: "kariyer",
    title: "Fures Kariyer Merkezi",
    description:
      "İşe alım süreçleri için tasarlanan, aday değerlendirme simülatörleri ve yapay zekâ destekli iş ilanı üreticisi bu uygulamada yer alıyor.",
    entryPath: "/kariyer/index.html"
  }
};

interface ProfileViewerProps {
  profile: ProfileConfig;
}

export function ProfileViewer({ profile }: ProfileViewerProps) {
  const { language, t } = useLanguage();
  const location = useLocation();

  const canonicalPath = useMemo(
    () => canonicalPathForLanguage(location.pathname, language),
    [location.pathname, language]
  );

  const alternates = useMemo(
    () => buildLanguageAlternates(location.pathname),
    [location.pathname]
  );

  const keywords = useMemo(
    () =>
      `${t("seo.common.keywords")}, ${t(`seo.profile.${profile.slug}.keywords`)}`
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0),
    [language, profile.slug, t]
  );

  const profileStructuredEntity = useMemo(() => {
    if (profile.slug === "kariyer") {
      return createSoftwareApplicationSchema({
        name: t("seo.profile.kariyer.title"),
        description: t("seo.profile.kariyer.description"),
        url: canonicalPath
      });
    }

    const nameKey = profile.slug === "furkanyonat" ? "team.furkan.name" : "team.gulben.name";
    const roleKey = profile.slug === "furkanyonat" ? "team.furkan.role" : "team.gulben.role";

    return createPersonSchema({
      name: t(nameKey),
      jobTitle: t(roleKey),
      description: t(`seo.profile.${profile.slug}.description`),
      url: canonicalPath
    });
  }, [canonicalPath, language, profile.slug, t]);

  const structuredData = useMemo(
    () => [
      createOrganizationSchema(t("seo.organization.description")),
      profileStructuredEntity,
      createBreadcrumbSchema([
        { name: t("nav.home"), path: canonicalPathForLanguage("/", language) },
        { name: t(`seo.profile.${profile.slug}.title`), path: canonicalPath }
      ])
    ],
    [canonicalPath, language, profile.slug, profileStructuredEntity, t]
  );

  useSEO({
    title: t(`seo.profile.${profile.slug}.title`),
    description: t(`seo.profile.${profile.slug}.description`),
    keywords,
    canonicalPath,
    alternates,
    language,
    openGraph: {
      title: t(`seo.profile.${profile.slug}.title`),
      description: t(`seo.profile.${profile.slug}.description`),
      siteName: t("seo.site_name")
    },
    twitter: {
      title: t(`seo.profile.${profile.slug}.title`),
      description: t(`seo.profile.${profile.slug}.description`)
    },
    structuredData
  });

  return (
    <section className="pt-28 pb-16 min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="liquid-glass mb-10 p-6 sm:p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300/80 mb-3">
                Dijital Profil
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-4">{profile.title}</h1>
              <p className="text-sm sm:text-base text-gray-300/85 max-w-2xl leading-relaxed">
                {profile.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  Ana Sayfa
                </Link>
              </Button>
              <Button asChild variant="gradient" size="sm" className="gap-2">
                <a href={profile.entryPath} target="_blank" rel="noopener noreferrer">
                  Yeni Sekmede Aç
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="liquid-glass p-2 sm:p-3">
          <iframe
            key={profile.slug}
            src={profile.entryPath}
            title={profile.title}
            loading="lazy"
            className="w-full min-h-[70vh] rounded-[1.5rem] border border-white/10 bg-black"
            allow="fullscreen"
          />
        </div>
      </div>
    </section>
  );
}
