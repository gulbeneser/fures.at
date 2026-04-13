import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function HeaderDE() {
  const { t } = useLanguage();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const normalizePath = (path: string) => {
    if (path === "/") return "/";
    return path.replace(/\/+$/, "");
  };

  const isActive = (path: string) => {
    const current = normalizePath(location.pathname);
    const target = normalizePath(path);
    if (target === "/de") return current === "/de";
    return current === target || current.startsWith(`${target}/`);
  };

  const navItems = [
    { path: "/de/ueber-uns", label: t("nav.about") },
    { path: "/de/leistungen", label: t("nav.services") },
    { path: "/de/kontakt", label: t("nav.contact") },
    { path: "/de/blog", label: t("nav.blog") },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/de"
            className="flex items-center shrink-0 group"
            aria-label="Fures Tech — Startseite"
          >
            <img
              src="/images/fures.png"
              alt="Fures Tech"
              className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Hauptnavigation">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    active
                      ? "text-orange-500"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-orange-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <Link
              to="/de/kontakt"
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-full transition-all duration-200 shadow-sm shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-px active:translate-y-0"
            >
              Beratung anfragen
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav
          className="bg-white border-t border-gray-100 px-4 pt-2 pb-4 flex flex-col gap-1"
          aria-label="Mobile Navigation"
        >
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-colors duration-200 ${
                  active
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 mt-1 border-t border-gray-100">
            <Link
              to="/de/kontakt"
              className="flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl transition-colors duration-200"
            >
              Beratung anfragen
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
