import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" onClick={closeMenu}>
              <img src={logoSrc} alt="Fures Tech" className="h-8 w-auto transition-transform hover:scale-110 duration-300" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/hakkimizda" 
              className={`relative transition-colors group ${isActive('/hakkimizda') ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
            >
              {t('nav.about')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-600 group-hover:w-full transition-all duration-300 rounded-full glow-gradient"></span>
            </Link>
            <Link 
              to="/hizmetler" 
              className={`relative transition-colors group ${isActive('/hizmetler') ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
            >
              {t('nav.services')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-600 group-hover:w-full transition-all duration-300 rounded-full glow-gradient"></span>
            </Link>
            <Link 
              to="/projeler" 
              className={`relative transition-colors group ${isActive('/projeler') ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
            >
              {t('nav.projects')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-600 group-hover:w-full transition-all duration-300 rounded-full glow-gradient"></span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-gray-300 hover:text-orange-400 transition-colors relative group">
                {t('nav.more')}
                <ChevronDown className="ml-1 h-4 w-4" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-600 group-hover:w-full transition-all duration-300 rounded-full glow-gradient"></span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700 mt-2">
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-purple-600/10 transition-all">
                  <Link to="/ekip" className="w-full">Ekip</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-purple-600/10 transition-all">
                  <Link to="/sss" className="w-full">SSS</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-purple-600/10 transition-all">
                  <Link to="/iletisim" className="w-full">{t('nav.contact')}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            <Link to="/iletisim">
              <Button 
                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg glow-gradient hover:scale-105"
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
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 py-6 space-y-4">
            <Link 
              to="/hakkimizda" 
              onClick={closeMenu}
              className={`block transition-colors ${isActive('/hakkimizda') ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
            >
              {t('nav.about')}
            </Link>
            <Link 
              to="/hizmetler" 
              onClick={closeMenu}
              className={`block transition-colors ${isActive('/hizmetler') ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
            >
              {t('nav.services')}
            </Link>
            <Link 
              to="/projeler" 
              onClick={closeMenu}
              className={`block transition-colors ${isActive('/projeler') ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
            >
              {t('nav.projects')}
            </Link>
            <Link 
              to="/ekip" 
              onClick={closeMenu}
              className={`block transition-colors ${isActive('/ekip') ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
            >
              Ekip
            </Link>
            <Link 
              to="/sss" 
              onClick={closeMenu}
              className={`block transition-colors ${isActive('/sss') ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
            >
              SSS
            </Link>
            <Link 
              to="/iletisim" 
              onClick={closeMenu}
              className={`block transition-colors ${isActive('/iletisim') ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
            >
              {t('nav.contact')}
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
