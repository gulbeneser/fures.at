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
    { path: "/furkanyonat", label: "Furkan Yonat", icon: UserRound, external: true },
    { path: "/gulbeneser", label: "Gülben Eser", icon: Users2, external: true },
    { path: "/kariyer", label: "Kariyer Asistanı", icon: Sparkles, external: true },
  ];

  const navItemClasses = (path: string) =>
    `group relative isolate flex min-w-[82px] flex-col items-center justify-center gap-1 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
      isActive(path)
        ? "text-white"
        : "text-slate-200/80 hover:text-white"
    }`;

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center justify-between sm:w-auto sm:flex-none">
          <Link to="/" className="group relative flex items-center">
            <span className="absolute inset-0 -z-10 rounded-full bg-white/5 blur-md transition duration-300 group-hover:blur-lg" />
            <span className="absolute inset-0 -z-20 rounded-full bg-[linear-gradient(120deg,rgba(96,165,250,0.35),rgba(192,132,252,0.25),rgba(251,191,36,0.25))] blur-2xl opacity-70" />
            <span className="relative flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-2xl">
              <img
                src={logoSrc}
                alt="Fures Tech"
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70 sm:inline hidden">
                Fures
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageSelector />
          </div>
        </div>

        <div className="order-last sm:order-none sm:flex-1">
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),rgba(9,9,11,0))] opacity-70 blur-2xl" />
            <nav className="relative flex items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-2xl shadow-[0_28px_80px_-40px_rgba(15,23,42,0.95)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link key={item.path} to={item.path} className={navItemClasses(item.path)}>
                    <span
                      className={`absolute inset-0 rounded-full border transition-all duration-300 ${
                        active
                          ? "border-white/50 bg-[linear-gradient(135deg,rgba(93,123,255,0.78),rgba(146,90,255,0.75),rgba(255,122,73,0.75))] shadow-[0_22px_45px_-22px_rgba(98,130,255,0.9)]"
                          : "border-white/10 bg-white/5 group-hover:border-white/20 group-hover:bg-white/10"
                      }`}
                    />
                    <Icon
                      className={`relative z-10 h-5 w-5 transition-all duration-300 ${
                        active ? "text-white drop-shadow-[0_10px_25px_rgba(94,125,255,0.8)]" : "text-white/80 group-hover:text-white"
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
                  <button type="button" className="group relative isolate flex min-w-[82px] flex-col items-center justify-center gap-1 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200/80 transition-all duration-300 hover:text-white focus-visible:outline-none">
                    <span className="absolute inset-0 rounded-full border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10" />
                    <MoreHorizontal className="relative z-10 h-5 w-5 text-white/80 transition-all duration-300 group-hover:text-white" />
                    <span className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.24em]">
                      {t("nav.more")}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-3 w-72 rounded-3xl border border-white/10 bg-[#07060b]/95 p-3 backdrop-blur-2xl shadow-[0_30px_90px_-35px_rgba(10,10,20,0.95)]">
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
                            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-all duration-300 ${
                              active
                                ? "bg-[linear-gradient(135deg,rgba(93,123,255,0.78),rgba(146,90,255,0.75),rgba(255,122,73,0.75))] text-white shadow-[0_18px_38px_-20px_rgba(98,130,255,0.9)]"
                                : "bg-white/5 text-slate-200/85 hover:bg-white/10 hover:text-white"
                            }`}
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
            <Button className="group relative overflow-hidden rounded-full border border-white/20 bg-[linear-gradient(120deg,rgba(93,123,255,0.85),rgba(146,90,255,0.8),rgba(255,122,73,0.85))] px-6 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-[0_30px_60px_-35px_rgba(96,125,255,0.8)] transition duration-300 hover:scale-[1.02]">
              <span className="relative z-10">{t("nav.lets_talk")}</span>
              <span className="relative z-10">→</span>
              <span className="absolute inset-0 -z-10 rounded-full bg-white/25 opacity-0 transition duration-300 group-hover:opacity-10" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
