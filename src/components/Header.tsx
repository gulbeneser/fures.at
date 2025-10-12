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
    `liquid-pill group relative flex min-w-[92px] flex-col items-center justify-center gap-1 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-500 ${
      isActive(path)
        ? "is-active text-white"
        : "text-slate-200/75 hover:text-white"
    }`;

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center justify-between sm:w-auto sm:flex-none">
          <Link to="/" className="group relative flex items-center">
            <span className="absolute inset-0 -z-20 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),rgba(9,9,11,0))] opacity-45 blur-xl transition duration-300 group-hover:opacity-70" />
            <span className="relative flex items-center rounded-full border border-white/12 bg-black/25 px-4 py-2 backdrop-blur-2xl">
              <img
                src={logoSrc}
                alt="Fures"
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageSelector />
          </div>
        </div>

        <div className="order-last sm:order-none sm:flex-1">
          <div className="group relative">
            <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),rgba(9,9,11,0))] opacity-65 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
            <nav className="liquid-glass group flex items-center gap-3 overflow-x-auto rounded-full px-4 py-3 shadow-[0_26px_72px_-46px_rgba(10,12,35,0.85)] transition-all duration-300 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                          ? "text-white drop-shadow-[0_10px_22px_rgba(15,23,42,0.4)]"
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
                    className="liquid-pill group relative flex min-w-[92px] flex-col items-center justify-center gap-1 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-200/75 transition-all duration-300 hover:text-white focus-visible:outline-none"
                  >
                    <MoreHorizontal className="relative z-10 h-5 w-5 text-white/80 transition-all duration-300 group-hover:text-white" />
                    <span className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.24em]">
                      {t("nav.more")}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="liquid-glass mt-3 w-72 rounded-3xl border border-white/12 bg-white/4 p-3 text-white">
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
                            className={`liquid-glass relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/12 px-4 py-3 text-sm transition-all duration-500 ${
                              active
                                ? "is-active text-white"
                                : "text-slate-200/75 hover:text-white"
                            }`}
                            data-active={active || undefined}
                          >
                            <span className="flex items-center gap-3">
                              <span className="flex size-8 items-center justify-center rounded-full bg-black/40">
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

        <div className="hidden items-center gap-3 sm:flex">
          <LanguageSelector />
          <Link to="/iletisim">
            <Button variant="gradient" size="sm" className="group">
              <span className="relative z-10">{t("nav.lets_talk")}</span>
              <span className="relative z-10">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
