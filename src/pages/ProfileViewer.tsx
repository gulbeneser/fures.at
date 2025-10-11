import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

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
  return (
    <section className="pt-28 pb-16 min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="surface-card p-6 sm:p-8 md:p-10 mb-10">
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
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Ana Sayfa
              </Link>
              <a
                href={profile.entryPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-transform duration-300 hover:scale-105"
              >
                Yeni Sekmede Aç
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="surface-card p-2 sm:p-3">
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
