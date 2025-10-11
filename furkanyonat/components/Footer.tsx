import React from 'react';

interface FooterProps {
  t: any;
  onAccessibilityClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ t, onAccessibilityClick }) => {
  return (
    <footer className="text-center mt-12 py-6 text-sm text-secondary-text flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-x-4 flex-wrap justify-center">
        <span>{t.footer.copyright}</span>
        <span className="hidden md:inline">|</span>
        <span>{t.footer.motto}</span>
        <span className="hidden md:inline">|</span>
        <span>
          {t.footer.poweredBy} <a href="https://fures.at" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-text hover:text-accent-color transition-colors">Fures</a>
        </span>
      </div>
      <button onClick={onAccessibilityClick} className="hover:text-accent-color transition-colors duration-300" aria-label={t.accessibility.title}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.22 5.22a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zm10.78 1.06a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.06zM10 18a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 18zm3.94-2.22a.75.75 0 010-1.06l1.06-1.06a.75.75 0 011.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zm-5.94-2.22a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0z" />
          <path fillRule="evenodd" d="M10 4a6 6 0 100 12 6 6 0 000-12zM8 10a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
