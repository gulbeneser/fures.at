import React from 'react';

interface FooterProps {
  t: any;
  onAccessibilityClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ t, onAccessibilityClick }) => {
  const socialLinks = [
    { label: 'Email', href: `mailto:${t.contactInfo.email}`, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { label: 'WhatsApp', href: t.contactInfo.whatsapp, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.806 6.096l-1.225 4.485 4.574-1.196zM12 5.999c-3.316 0-6.002 2.686-6.002 6.001s2.686 6.001 6.002 6.001c3.315 0 6.001-2.686 6.001-6.001s-2.686-6.001-6.001-6.001zm0 10.875c-2.689 0-4.875-2.186-4.875-4.875s2.186-4.875 4.875-4.875 4.875 2.186 4.875 4.875-2.186 4.875-4.875 4.875zm-1.83-2.925c-.205-.104-1.218-.603-1.406-.67-.188-.066-.324-.103-.46-.346-.135-.243-.27-.563-.33-.67-.061-.106-.123-.122-.23-.122-.107 0-.214.017-.32.083-.106.066-.27.188-.367.233-.098.046-.196.07-.294.04-.098-.03-.414-.148-.788-.485-.29-.26-.487-.45-.544-.518-.058-.068-.008-.106.029-.143.037-.037.083-.093.123-.139.041-.046.053-.083.08-.139.026-.056.013-.103-.008-.149-.021-.046-.46-.1.083-1.258-.292-.26-.45-.448-.45-.715 0-.267.233-.404.292-.46.058-.057.123-.149.196-.28l.041-.066c.037-.067.061-.122.09-.188.028-.066.024-.139-.004-.205-.028-.067-.123-.15-.18-.18-.057-.03-.122-.047-.18-.047-.058 0-.14.004-.21.008-.069.004-.18.02-.277.036-.098.016-.21.028-.303.041-.094.013-.23.083-.346.21-.116.126-.44.425-.44.975 0 .55.45.93.51.986.06.056.887 1.428 2.16 2.01.29.13.52.208.7.264.18.056.345.047.473.029.128-.019.414-.17.473-.332.06-.162.06-.3.04-.332-.017-.032-.066-.05-.135-.083z"/></svg> },
    { label: 'LinkedIn', href: t.contactInfo.linkedin, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
  ];

  return (
    <footer className="text-center mt-12 py-6 text-sm text-secondary-text border-t border-card-border">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p>{t.footer.copyright}</p>
        <div className="flex items-center gap-x-4">
          {socialLinks.map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-primary-text transition-colors" aria-label={link.label}>
              {link.icon}
            </a>
          ))}
          <button onClick={onAccessibilityClick} className="hover:text-primary-text transition-colors" aria-label={t.accessibility.title}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.22 5.22a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zm10.78 1.06a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.06zM10 18a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 18zm3.94-2.22a.75.75 0 010-1.06l1.06-1.06a.75.75 0 011.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zm-5.94-2.22a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0z" />
              <path fillRule="evenodd" d="M10 4a6 6 0 100 12 6 6 0 000-12zM8 10a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-4 text-xs">
          {t.footer.poweredBy} <a href="https://fures.at" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-text hover:text-blue-400 transition-colors">Fures</a>
      </div>
    </footer>
  );
};

export default Footer;