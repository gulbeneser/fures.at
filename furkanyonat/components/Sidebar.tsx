import React, { useState, useEffect, useRef } from 'react';
import { translations } from '../data/translations';
import ThemeSwitcher from './ThemeSwitcher';

type Theme = 'light' | 'dark' | 'system';

interface HeaderProps {
  t: any;
  language: string;
  setLanguage: (lang: string) => void;
  activeSection: string;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const NavIcons: { [key: string]: React.ReactNode } = {
  experience: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
  skills: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>,
  projects: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>,
  more: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>,
  education: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 011.056 0l4-1.819a1 1 0 000-1.84l-5-2.273zM5 9.449c0 .348.11.685.31.97l4 6a1 1 0 001.38 0l4-6c.2-.285.31-.622.31-.97V6.551a1 1 0 00-1-1h-6a1 1 0 00-1 1v2.898z" /></svg>,
  certificates: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
};

// FIX: Moved NavItem outside of Header component to prevent re-definition on render and fix props typing.
interface NavItemProps {
  itemKey: string;
  activeSection: string;
  t: any;
}

const NavItem: React.FC<NavItemProps> = ({ itemKey, activeSection, t }) => (
  <a href={`#${itemKey}`} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${activeSection === itemKey ? 'bg-white/10 text-primary-text' : 'text-secondary-text hover:text-primary-text'}`}>
    {NavIcons[itemKey]}
    <span>{t.nav[itemKey]}</span>
  </a>
);

const Header: React.FC<HeaderProps> = ({ t, language, setLanguage, activeSection, theme, setTheme }) => {
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const mainNavItems = ['experience', 'skills', 'projects'];
  const moreNavItems = ['education', 'certificates'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);
  

  return (
    <header className='fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] md:w-auto no-print'>
      <div className="mx-auto glass-card p-2 rounded-full flex items-center justify-between shadow-2xl">
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <a href="#" className="mr-2">
             <img src={t.contactInfo.profileImage} alt={t.name} className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/50 transition-colors" />
          </a>
          {/* FIX: Pass required props to the standalone NavItem component. */}
          {mainNavItems.map(key => <NavItem key={key} itemKey={key} activeSection={activeSection} t={t} />)}
          <div className="relative">
            <button
              ref={moreButtonRef}
              onClick={() => setMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${moreNavItems.includes(activeSection) ? 'bg-white/10 text-primary-text' : 'text-secondary-text hover:text-primary-text'}`}
            >
              {NavIcons.more}
              <span>{t.nav.more}</span>
            </button>
            {isMoreMenuOpen && (
              <div ref={moreMenuRef} className="absolute top-full right-0 mt-2 w-48 glass-card rounded-xl p-2 shadow-lg animate-fade-in-down">
                {moreNavItems.map(key => (
                  <a key={key} href={`#${key}`} onClick={() => setMoreMenuOpen(false)} className={`w-full text-left flex items-center gap-3 p-2 text-sm rounded-md transition-colors ${activeSection === key ? 'bg-white/10 text-primary-text' : 'text-secondary-text hover:text-primary-text hover:bg-white/5'}`}>
                    {NavIcons[key]}
                    <span>{t.nav[key]}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Nav */}
        <nav className="md:hidden flex-1 flex items-center overflow-x-auto p-1 scrollbar-hide">
            <div className="flex items-center gap-1 min-w-max">
                {mainNavItems.concat(moreNavItems).map(key => (
                     <a key={key} href={`#${key}`} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-300 ${activeSection === key ? 'bg-white/10 text-primary-text' : 'text-secondary-text hover:text-primary-text'}`}>
                        {NavIcons[key]}
                        <span>{t.nav[key]}</span>
                    </a>
                ))}
            </div>
        </nav>

        <div className="flex items-center gap-2 pl-2">
            <button
              onClick={handlePrint}
              className="glass-card px-3 py-2 rounded-full text-sm font-semibold border-none flex items-center gap-2 hover:text-primary-text transition-colors"
              aria-label={t.actions?.downloadPdf || 'Download PDF'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M5 2a2 2 0 00-2 2v3a1 1 0 102 0V4h10v3a1 1 0 102 0V4a2 2 0 00-2-2H5z" />
                <path d="M4 9a1 1 0 011 1v3a2 2 0 002 2h6a2 2 0 002-2v-3a1 1 0 112 0v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z" />
                <path d="M7 9a1 1 0 000 2h2v1a1 1 0 102 0v-1h2a1 1 0 100-2H7z" />
              </svg>
              <span>{t.actions?.downloadPdf}</span>
            </button>
            <div className="flex p-1 rounded-full glass-card bg-transparent border-none shadow-none">
              {Object.keys(translations).map(lang => (
              <button key={lang} onClick={() => setLanguage(lang)} className={`w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-full transition-all duration-300 ${language === lang ? 'active-pill-button' : 'text-secondary-text hover:text-primary-text'}`}>
                  {lang.toUpperCase()}
              </button>
              ))}
            </div>
            <ThemeSwitcher t={t} theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
      `}</style>
    </header>
  );
};

export default Header;