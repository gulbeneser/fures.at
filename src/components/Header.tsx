import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Info,
  Briefcase,
  Rocket,
  Users2,
  MessageCircle,
  MoreHorizontal,
  HelpCircle,
  ExternalLink,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

type MoreLink = {
  path: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
};

export function Header() {
  const { t } = useLanguage();
  const location = useLocation();
  const logoSrc = "/images/fures.png";

  const normalizePath = (path: string) => {
    if (path === "/") {
      return "/";
    }
    return path.replace(/\/+$/, "");
  };

  const isActive = (path: string) => normalizePath(location.pathname) === normalizePath(path);

  const navItems: NavItem[] = [
    { path: "/hakkimizda", label: t("nav.about"), icon: Info },
    { path: "/hizmetler", label: t("nav.services"), icon: Briefcase },
    { path: "/projeler", label: t("nav.projects"), icon: Rocket },
    { path: "/ekip", label: "Ekip", icon: Users2 },
    { path: "/iletisim", label: t("nav.contact"), icon: MessageCircle },
  ];

  const moreLinks: MoreLink[] = [
    { path: "/sss", label: "SSS", icon: HelpCircle },
    { path: "/gulbeneser", label: "Gülben Eser", icon: Users2, external: true },
    { path: "/furkanyonat", label: "Furkan Yonat", icon: UserRound, external: true },
    { path: "/kariyer", label: "Kariyer Asistanı", icon: Sparkles, external: true },
  ];

  const navItemClasses = (path: string) =>
    `liquid-pill ios-nav-item group relative flex min-w-[92px] flex-col items-center justify-center gap-1 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-500 ${
      isActive(path)
        ? "is-active text-white"
        : "text-slate-200/75 hover:text-white"
    }`;

  const navGlassStyle = {
    "--glass-surface-bg": "rgba(16, 24, 48, 0.28)",
    "--glass-surface-border": "rgba(255, 255, 255, 0.28)",
    "--glass-surface-highlight": "rgba(255, 255, 255, 0.55)",
    "--glass-surface-reflection": "rgba(140, 200, 255, 0.32)",
    "--glass-highlight-height": "14%",
    "--glass-reflection-height": "52%",
  } as CSSProperties;

  const dropdownGlassStyle = {
    "--glass-surface-bg": "rgba(12, 20, 42, 0.42)",
    "--glass-surface-border": "rgba(255, 255, 255, 0.24)",
    "--glass-surface-highlight": "rgba(255, 255, 255, 0.48)",
    "--glass-surface-reflection": "rgba(140, 200, 255, 0.32)",
    "--glass-highlight-height": "12%",
    "--glass-reflection-height": "45%",
  } as CSSProperties;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-5 sm:px-6">
      <div className="relative w-full max-w-6xl">
        <div className="pointer-events-none absolute inset-0 -z-20 flex flex-col items-center">
          <div className="absolute inset-x-[-180px] top-[-160px] h-[360px] rounded-full bg-[radial-gradient(circle_at_top,rgba(111,136,255,0.28),rgba(14,15,26,0))] opacity-60 blur-3xl" />
          <div className="absolute inset-x-[-120px] bottom-[-220px] h-[380px] rounded-full bg-[radial-gradient(circle_at_bottom,rgba(255,122,41,0.24),rgba(13,14,24,0))] opacity-40 blur-[140px]" />
        </div>

        <div className="relative isolate overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.04] px-5 pb-6 pt-5 shadow-[0_50px_140px_-80px_rgba(8,14,36,0.96)] backdrop-blur-[38px] backdrop-saturate-[1.9]">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(10,12,30,0))] opacity-70" />
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-[#6c4cff33] via-[#48cfff33] to-[#ff7a2933]" />
            <div className="absolute inset-x-16 top-4 h-32 rounded-full border border-white/10" />
          </div>

          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-between gap-4">
                <Link to="/" className="group relative flex items-center gap-4">
                  <span className="absolute -inset-4 -z-10 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),rgba(9,9,18,0))] opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-70" />
                  <span className="liquid-pill relative flex items-center gap-3 border-white/16 px-4 py-2" style={navGlassStyle}>
                    <span className="relative flex size-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10">
                      <img
                        src={logoSrc}
                        alt="Fures"
                        className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">Fures</span>
                      <span className="text-[11px] font-medium text-white/40">Liquid Experience Studio</span>
                    </span>
                  </span>
                </Link>

                <div className="flex items-center gap-2 sm:hidden">
                  <LanguageSelector />
                  <Link to="/iletisim">
                    <Button variant="gradient" size="sm" className="px-4 text-[11px] uppercase tracking-[0.22em]">
                      {t("nav.lets_talk")}
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <LanguageSelector />
                <Link to="/iletisim">
                  <Button
                    variant="gradient"
                    size="sm"
                    className="group px-5 text-[11px] uppercase tracking-[0.24em]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span>{t("nav.lets_talk")}</span>
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-xs">
                        →
                      </span>
                    </span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-[1px] rounded-full border border-white/12" />
                <div className="absolute inset-x-10 bottom-[-42px] h-24 bg-gradient-to-r from-[#6c4cff26] via-[#48cfff26] to-[#ff7a2926] blur-3xl" />
              </div>

              <nav
                className="liquid-glass group flex items-center gap-3 overflow-x-auto rounded-full px-5 py-3 backdrop-blur-[45px] backdrop-saturate-[1.75] shadow-[0_36px_110px_-60px_rgba(8,14,36,0.95)] transition-all duration-500 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={navGlassStyle}
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={navItemClasses(item.path)}
                      data-active={active || undefined}
                    >
                      <Icon
                        className={`relative z-10 h-5 w-5 transition-all duration-300 ${
                          active
                            ? "text-white drop-shadow-[0_10px_22px_rgba(15,23,42,0.45)]"
                            : "text-white/80 group-hover:text-white"
                        }`}
                      />
                      <span className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.24em]">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="liquid-pill ios-nav-item group relative flex min-w-[92px] flex-col items-center justify-center gap-1 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/75 transition-all duration-300 hover:text-white focus-visible:outline-none"
                      style={navGlassStyle}
                    >
                      <MoreHorizontal className="relative z-10 h-5 w-5 text-white/80 transition-all duration-300 group-hover:text-white" />
                      <span className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.24em]">
                        {t("nav.more")}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="liquid-glass mt-3 w-72 rounded-3xl border border-white/12 p-3 text-white backdrop-blur-[42px] backdrop-saturate-[1.85]"
                    style={dropdownGlassStyle}
                  >
                    <div className="space-y-2">
                      {moreLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.path);

                        return (
                          <DropdownMenuItem
                            key={link.path}
                            asChild
                            className="rounded-2xl p-0 focus:bg-transparent focus:text-white"
                          >
                            <Link
                              to={link.path}
                              className={`liquid-glass ios-nav-menu-item relative flex items-center justify-between overflow-hidden rounded-2xl px-4 py-3 text-sm transition-all duration-500 ${
                                active
                                  ? "is-active text-white"
                                  : "text-slate-200/75 hover:text-white"
                              }`}
                              data-active={active || undefined}
                              style={dropdownGlassStyle}
                            >
                              <span className="flex items-center gap-3">
                                <span className="relative flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white">
                                  <Icon className="h-4 w-4 text-white" />
                                </span>
                                {link.label}
                              </span>
                              {link.external && <ExternalLink className="h-4 w-4 text-white/80" />}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
