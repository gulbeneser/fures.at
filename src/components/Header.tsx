import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, ChevronDown, ExternalLink } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  const logoSrc = "/images/fures.png";

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClasses = (path: string) =>
    `relative flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
      isActive(path)
        ? "text-white bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600 shadow-[0_18px_40px_-20px_rgba(255,122,41,0.95)]"
        : "text-gray-300 hover:text-white hover:bg-white/5"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050507]/85 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" onClick={closeMenu}>
              <img src={logoSrc} alt="Fures Tech" className="h-8 w-auto transition-transform hover:scale-110 duration-300" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-2 px-2 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_12px_45px_-30px_rgba(0,0,0,0.9)]">
            <Link to="/hakkimizda" className={navLinkClasses('/hakkimizda')}>
              {t('nav.about')}
            </Link>
            <Link to="/hizmetler" className={navLinkClasses('/hizmetler')}>
              {t('nav.services')}
            </Link>
            <Link to="/projeler" className={navLinkClasses('/projeler')}>
              {t('nav.projects')}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
                {t('nav.more')}
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-3 w-64 rounded-2xl border border-white/10 bg-[#07060b]/95 backdrop-blur-xl p-2">
                <DropdownMenuItem asChild className="rounded-xl text-gray-300 hover:text-white hover:bg-white/5">
                  <Link to="/ekip" className="flex w-full items-center justify-between px-3 py-2" onClick={closeMenu}>
                    Ekip
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl text-gray-300 hover:text-white hover:bg-white/5">
                  <Link to="/sss" className="flex w-full items-center justify-between px-3 py-2" onClick={closeMenu}>
                    SSS
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl text-gray-300 hover:text-white hover:bg-white/5">
                  <Link to="/iletisim" className="flex w-full items-center justify-between px-3 py-2" onClick={closeMenu}>
                    {t('nav.contact')}
                  </Link>
                </DropdownMenuItem>
                <div className="my-2 h-px bg-white/10" />
                <DropdownMenuItem asChild className="rounded-xl text-gray-300 hover:text-white hover:bg-white/5">
                  <Link to="/furkanyonat" className="flex w-full items-center justify-between px-3 py-2" onClick={closeMenu}>
                    Furkan Yonat
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl text-gray-300 hover:text-white hover:bg-white/5">
                  <Link to="/gulbeneser" className="flex w-full items-center justify-between px-3 py-2" onClick={closeMenu}>
                    Gülben Eser
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl text-gray-300 hover:text-white hover:bg-white/5">
                  <Link to="/kariyer" className="flex w-full items-center justify-between px-3 py-2" onClick={closeMenu}>
                    Kariyer Asistanı
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            <Link to="/iletisim">
              <Button
                className="bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600 hover:from-orange-500 hover:via-orange-500 hover:to-purple-700 text-white px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg glow-gradient hover:scale-105"
              >
                {t('nav.lets_talk')} →
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <LanguageSelector />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[#07060b]/95 backdrop-blur-2xl border-t border-white/10">
          <div className="px-4 py-6 space-y-4">
            <Link
              to="/hakkimizda"
              onClick={closeMenu}
              className={`block rounded-full px-4 py-3 transition-colors ${
                isActive('/hakkimizda')
                  ? 'text-white bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/hizmetler"
              onClick={closeMenu}
              className={`block rounded-full px-4 py-3 transition-colors ${
                isActive('/hizmetler')
                  ? 'text-white bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('nav.services')}
            </Link>
            <Link
              to="/projeler"
              onClick={closeMenu}
              className={`block rounded-full px-4 py-3 transition-colors ${
                isActive('/projeler')
                  ? 'text-white bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('nav.projects')}
            </Link>
            <Link
              to="/ekip"
              onClick={closeMenu}
              className={`block rounded-full px-4 py-3 transition-colors ${
                isActive('/ekip')
                  ? 'text-white bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Ekip
            </Link>
            <Link
              to="/sss"
              onClick={closeMenu}
              className={`block rounded-full px-4 py-3 transition-colors ${
                isActive('/sss')
                  ? 'text-white bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              SSS
            </Link>
            <Link
              to="/iletisim"
              onClick={closeMenu}
              className={`block rounded-full px-4 py-3 transition-colors ${
                isActive('/iletisim')
                  ? 'text-white bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('nav.contact')}
            </Link>
            <div className="pt-2 border-t border-white/10" />
            <Link
              to="/furkanyonat"
              onClick={closeMenu}
              className={`flex items-center justify-between rounded-full px-4 py-3 text-sm transition-colors ${
                isActive('/furkanyonat')
                  ? 'text-white bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Furkan Yonat
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              to="/gulbeneser"
              onClick={closeMenu}
              className={`flex items-center justify-between rounded-full px-4 py-3 text-sm transition-colors ${
                isActive('/gulbeneser')
                  ? 'text-white bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Gülben Eser
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              to="/kariyer"
              onClick={closeMenu}
              className={`flex items-center justify-between rounded-full px-4 py-3 text-sm transition-colors ${
                isActive('/kariyer')
                  ? 'text-white bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Kariyer Asistanı
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link to="/iletisim" onClick={closeMenu}>
              <Button className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white rounded-full glow-gradient">
                {t('nav.lets_talk')} →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
