import React from 'react';
import { translations } from '../data/translations';
import ThemeSwitcher from './ThemeSwitcher';

type Theme = 'light' | 'dark' | 'system';

interface SidebarProps {
  t: any;
  language: string;
  setLanguage: (lang: string) => void;
  activeSection: string;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ t, language, setLanguage, activeSection, theme, setTheme }) => {
  
  const socialLinks = [
    { label: 'Email', href: `mailto:${t.contactInfo.email}`, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { label: 'WhatsApp', href: t.contactInfo.whatsapp, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.806 6.096l-1.225 4.485 4.574-1.196zM12 5.999c-3.316 0-6.002 2.686-6.002 6.001s2.686 6.001 6.002 6.001c3.315 0 6.001-2.686 6.001-6.001s-2.686-6.001-6.001-6.001zm0 10.875c-2.689 0-4.875-2.186-4.875-4.875s2.186-4.875 4.875-4.875 4.875 2.186 4.875 4.875-2.186 4.875-4.875 4.875zm-1.83-2.925c-.205-.104-1.218-.603-1.406-.67-.188-.066-.324-.103-.46-.346-.135-.243-.27-.563-.33-.67-.061-.106-.123-.122-.23-.122-.107 0-.214.017-.32.083-.106.066-.27.188-.367.233-.098.046-.196.07-.294.04-.098-.03-.414-.148-.788-.485-.29-.26-.487-.45-.544-.518-.058-.068-.008-.106.029-.143.037-.037.083-.093.123-.139.041-.046.053-.083.08-.139.026-.056.013-.103-.008-.149-.021-.046-.46-.1.083-1.258-.292-.26-.45-.448-.45-.715 0-.267.233-.404.292-.46.058-.057.123-.149.196-.28l.041-.066c.037-.067.061-.122.09-.188.028-.066.024-.139-.004-.205-.028-.067-.123-.15-.18-.18-.057-.03-.122-.047-.18-.047-.058 0-.14.004-.21.008-.069.004-.18.02-.277.036-.098.016-.21.028-.303.041-.094.013-.23.083-.346.21-.116.126-.44.425-.44.975 0 .55.45.93.51.986.06.056.887 1.428 2.16 2.01.29.13.52.208.7.264.18.056.345.047.473.029.128-.019.414-.17.473-.332.06-.162.06-.3.04-.332-.017-.032-.066-.05-.135-.083z"/></svg> },
    { label: 'LinkedIn', href: t.contactInfo.linkedin, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
    { label: 'Portfolio', href: t.contactInfo.portfolio, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" /></svg> },
    { label: 'Facebook', href: t.contactInfo.facebook, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg> },
    { label: 'Instagram', href: t.contactInfo.instagram, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.585.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44c0-.795-.645-1.44-1.441-1.44z"/></svg> },
    { label: 'Xing', href: t.contactInfo.xing, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.188 0c-1.576 0-2.947.803-3.69 2.01l-4.502 7.633c-.173.293-.393.533-.66.72l-1.854-3.144c.48-.48 1.226-.803 2.04-1.123l2.29-3.935c-1.34-1.123-3.1-1.123-4.44 0l-5.626 9.645c-1.34 2.292-1.34 5.065 0 7.358l5.627 9.645c.67.964 1.683 1.606 2.825 1.606s2.155-.642 2.825-1.606l2.593-4.44c.173-.293.393-.533.66-.72l4.61-7.86c1.34-2.292 1.34-5.065 0-7.358l-2.69-4.55c-.742-1.206-2.113-2.01-3.69-2.01zm-5.46 12.06c0-.047-.046-.093-.093-.14l-2.43-4.116c.14-.14.28-.233.466-.233.233 0 .466.14.56.326l2.43 4.116c-.234.327-.42.466-.514.466-.187 0-.327-.186-.42-.42zm-1.856 5.82l-2.688 4.596c-.326.513-.932.895-1.63.895-.652 0-1.258-.382-1.583-.895l-5.627-9.645c-.652-1.123-.652-2.515 0-3.638l5.627-9.645c.326-.513.93-.895 1.582-.895.698 0 1.304.382 1.63.895l4.31 7.358c-.513.56-1.305.98-2.183 1.258l-2.136 3.638z"/></svg> },
  ];

  return (
    <header className='lg:w-1/3 lg:sticky top-0 lg:h-screen lg:flex lg:flex-col lg:justify-between lg:py-24'>
      <div>
        {/* Profile Section */}
        <div className="pt-8 lg:pt-0">
          <div className="relative w-36 h-36 mx-auto lg:mx-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-sky-500 to-purple-500 opacity-80 animate-pulse-slow"></div>
            <img 
              src={t.contactInfo.profileImage} 
              alt={t.name} 
              className="relative w-full h-full object-cover rounded-full border-4 border-[var(--bg-color)] shadow-xl" 
            />
          </div>
          <h1 className="text-4xl font-bold mt-6 text-primary-text font-display">{t.name}</h1>
          <h2 className="text-lg font-medium text-primary-text mt-3">{t.title}</h2>
          <p className="mt-4 text-secondary-text max-w-xs">{t.vision}</p>
        </div>

        {/* Navigation */}
        <nav className="mt-16 hidden lg:block">
          <ul className="space-y-4">
            {Object.entries(t.nav).map(([key, value]) => (
              <li key={key}>
                <a href={`#${key}`} className="group flex items-center py-1 transition-colors duration-300">
                  <span className={`w-10 h-px transition-all duration-300 ${activeSection === key ? 'w-16 bg-accent-color' : 'bg-secondary-text group-hover:w-16 group-hover:bg-primary-text'}`}></span>
                  <span className={`ml-4 text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${activeSection === key ? 'text-primary-text' : 'text-secondary-text group-hover:text-primary-text'}`}>{value as string}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom Section: Socials, Lang, Theme */}
      <div className="mt-8 lg:mt-0 flex flex-col items-center lg:items-start space-y-6">
        <div className="flex justify-center lg:justify-start space-x-5 text-secondary-text items-center flex-wrap gap-y-4">
          {socialLinks.map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-accent-color transition-transform duration-300 hover:scale-110" aria-label={link.label}>
              {link.icon}
            </a>
          ))}
          <a href={`tel:${t.contactInfo.phone}`} className="flex items-center gap-2 text-xs font-mono hover:text-accent-color transition-colors duration-300" aria-label="Phone">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
            <span>{t.contactInfo.phone.replace('+90', '+90 ')}</span>
          </a>
        </div>
        
        <div className="flex justify-center lg:justify-start items-center gap-4">
            <div className="flex p-1 rounded-full glass-card">
              {Object.keys(translations).map(lang => (
              <button key={lang} onClick={() => setLanguage(lang)} className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${language === lang ? 'bg-accent-color text-white' : 'text-secondary-text hover:text-primary-text'}`}>
                  {lang.toUpperCase()}
              </button>
              ))}
            </div>
            <ThemeSwitcher t={t} theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s infinite ease-in-out;
        }
      `}</style>
    </header>
  );
};

export default Sidebar;
