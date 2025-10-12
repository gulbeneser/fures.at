import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const navRef = useRef<HTMLElement | null>(null);
  const activeItemRef = useRef<HTMLElement | null>(null);
  const moreTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [highlightBoxStyle, setHighlightBoxStyle] = useState<CSSProperties | null>(
    null,
  );

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

  const moreMenuActive = moreLinks.some((link) => isActive(link.path));

  const navBaseClasses =
    "ios-nav-item group relative z-10 flex min-w-[92px] flex-col items-center justify-center gap-1 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-500 focus-visible:outline-none";

  const updateHighlightPosition = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) {
      setHighlightBoxStyle(null);
      return;
    }

    const targetEl =
      activeItemRef.current ?? (moreMenuActive ? moreTriggerRef.current : null);

    if (!targetEl) {
      setHighlightBoxStyle(null);
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const paddingX = 14;
    const paddingY = 8;

    setHighlightBoxStyle({
      width: `${targetRect.width + paddingX * 2}px`,
      height: `${targetRect.height + paddingY * 2}px`,
      transform: `translate3d(${targetRect.left - navRect.left - paddingX}px, ${targetRect.top - navRect.top - paddingY}px, 0)`,
      opacity: 1,
    });
  }, [moreMenuActive]);

  const setActiveItemRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      activeItemRef.current = node;

      if (node) {
        requestAnimationFrame(() => {
          updateHighlightPosition();
        });
      } else {
        setHighlightBoxStyle(null);
      }
    },
    [updateHighlightPosition],
  );

  useEffect(() => {
    updateHighlightPosition();
  }, [location.pathname, updateHighlightPosition]);

  useEffect(() => {
    const handleResize = () => {
      updateHighlightPosition();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateHighlightPosition]);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) {
      return;
    }

    const handleScroll = () => {
      updateHighlightPosition();
    };

    navEl.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      navEl.removeEventListener("scroll", handleScroll);
    };
  }, [updateHighlightPosition]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const navEl = navRef.current;
    if (!navEl) {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateHighlightPosition();
    });

    observer.observe(navEl);

    return () => {
      observer.disconnect();
    };
  }, [updateHighlightPosition]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const targetEl =
      activeItemRef.current ?? (moreMenuActive ? moreTriggerRef.current : null);

    if (!targetEl) {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateHighlightPosition();
    });

    observer.observe(targetEl);

    return () => {
      observer.disconnect();
    };
  }, [location.pathname, moreMenuActive, updateHighlightPosition]);

  const navItemClasses = (path: string) =>
    `${navBaseClasses} ${
      isActive(path)
        ? "liquid-pill is-active text-white"
        : "rounded-full border border-white/10 bg-white/5 text-slate-200/75 hover:border-white/20 hover:bg-white/10 hover:text-white"
    }`;

  const navGlassStyle = {
    "--glass-surface-bg": "rgba(6, 12, 30, 0.08)",
    "--glass-surface-border": "rgba(255, 255, 255, 0.18)",
    "--glass-surface-highlight": "rgba(255, 255, 255, 0.35)",
    "--glass-surface-reflection": "rgba(210, 230, 255, 0.22)",
    "--glass-highlight-height": "9%",
    "--glass-reflection-height": "42%",
  } as CSSProperties;

  const dropdownGlassStyle = {
    "--glass-surface-bg": "rgba(8, 14, 28, 0.12)",
    "--glass-surface-border": "rgba(255, 255, 255, 0.18)",
    "--glass-surface-highlight": "rgba(255, 255, 255, 0.32)",
    "--glass-surface-reflection": "rgba(210, 230, 255, 0.24)",
    "--glass-highlight-height": "10%",
    "--glass-reflection-height": "40%",
  } as CSSProperties;

  const highlightGlassStyle = {
    "--glass-surface-bg": "rgba(12, 20, 42, 0.32)",
    "--glass-surface-border": "rgba(255, 255, 255, 0.32)",
    "--glass-surface-highlight": "rgba(255, 255, 255, 0.55)",
    "--glass-surface-reflection": "rgba(210, 230, 255, 0.36)",
    "--glass-highlight-height": "16%",
    "--glass-reflection-height": "58%",
  } as CSSProperties;

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center justify-between sm:w-auto sm:flex-none">
          <Link to="/" className="group relative flex items-center">
            <span className="absolute inset-0 -z-20 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),rgba(9,9,11,0))] opacity-45 blur-xl transition duration-300 group-hover:opacity-70" />
            <span className="relative flex items-center rounded-full border border-white/10 bg-black/10 px-4 py-2 backdrop-blur-3xl">
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
            <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),rgba(9,9,11,0))] opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
            <nav
              ref={navRef}
              className="liquid-glass group relative flex items-center gap-3 overflow-x-auto rounded-full px-4 py-3 backdrop-blur-[42px] backdrop-saturate-[1.65] shadow-[0_32px_90px_-58px_rgba(12,16,40,0.9)] transition-all duration-500 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={navGlassStyle}
              >
                {highlightBoxStyle && (
                  <span
                    aria-hidden="true"
                    className="glass-spotlight"
                    style={{
                      ...highlightGlassStyle,
                      ...highlightBoxStyle,
                    }}
                  />
                )}
                {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={navItemClasses(item.path)}
                    data-active={active || undefined}
                    ref={active ? setActiveItemRef : undefined}
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
                    className={`${navBaseClasses} rounded-full border border-white/10 bg-white/5 text-slate-200/75 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none ${moreMenuActive ? "text-white" : ""}`}
                    data-active={moreMenuActive || undefined}
                    ref={moreTriggerRef}
                  >
                    <MoreHorizontal
                      className={`relative z-10 h-5 w-5 transition-all duration-300 ${
                        moreMenuActive
                          ? "text-white drop-shadow-[0_10px_22px_rgba(15,23,42,0.4)]"
                          : "text-white/80 group-hover:text-white"
                      }`}
                    />
                    <span className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.24em]">
                      {t("nav.more")}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="liquid-glass mt-3 w-72 rounded-3xl p-3 text-white backdrop-blur-[42px] backdrop-saturate-[1.75]"
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
                              <span className="relative flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
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
