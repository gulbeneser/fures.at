import React from 'react';
// FIX: Import translations to be used in the component.
import { translations } from '../data/translations';

const Header = ({ t, language, setLanguage, handleDownloadPdf, isPrinting, activeSection, setIsCoverLetterModalOpen }: { t: any, language: string, setLanguage: (lang: string) => void, handleDownloadPdf: () => void, isPrinting: boolean, activeSection: string, setIsCoverLetterModalOpen: (isOpen: boolean) => void }) => {
  return (
    <header className={'lg:w-1/3 lg:sticky top-8 self-start'}>
      <div className="p-8 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
        <div className="text-center lg:text-left">
          <img src={t.contactInfo.profileImage} alt={t.name} className="w-32 h-32 rounded-full mx-auto lg:mx-0 shadow-xl border-4 border-white" />
          <h1 className="text-4xl font-black mt-4 text-slate-900">{t.name}</h1>
          <h2 className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-800 mt-1">{t.title}</h2>
          <p className="mt-4 text-slate-600 text-sm leading-relaxed">{t.vision}</p>
        </div>

        <nav className="mt-12 hidden lg:block">
          <ul className="space-y-2">
            {Object.entries(t.nav).map(([key, value]) => (
              <li key={key}>
                <a href={`#${key}`} className="font-semibold text-slate-500 hover:text-pink-600 transition-colors duration-300 group flex items-center py-1">
                  <span className={`block w-8 h-px bg-slate-400 group-hover:bg-pink-600 transition-all duration-300 mr-4 ${activeSection === key ? 'w-16 !bg-pink-600' : ''}`}></span>
                  <span className={`${activeSection === key ? 'text-pink-600 font-bold' : ''}`}>{String(value)}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 flex justify-center lg:justify-start space-x-4 text-2xl text-slate-500 items-center">
            <a href={`tel:${t.contactInfo.phone}`} className="hover:text-pink-600 transition-colors duration-300" aria-label="Phone"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></a>
            <a href={`https://wa.me/${t.contactInfo.phone.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors duration-300" aria-label="WhatsApp"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.383 1.905 6.195l-.23 1.443 1.522.214zM8.381 9.989c.297-.149 1.758-.867 2.03-.967.273-.099.471-.148.67.15.197.297.767.966.94 1.164.173.199.347.223.644.075.297-.15 1.255-.463 2.39-1.475.883-.788 1.48-1.761 1.653-2.059.173-.297.023-.47-.05-.644-.073-.172-.644-1.563-.882-2.129-.239-.566-.48-.48-.669-.486-.189-.007-.386-.007-.584-.007s-.48.074-.73.372-.944 1.164-1.163 1.412c-.22.247-.44.272-.736.125-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.023-.47-.05-.644-.073-.172-.644-1.563-.882-2.129-.239-.566-.48-.48-.669-.486-.189-.007-.386-.007-.584-.007s-.48.074-.73.372-.944 1.164-1.163 1.412c-.22.247-.44.272-.736.125-.296-.149-1.055-.462-1.99-1.164-.733-.565-1.232-1.267-1.399-1.492-.167-.224-.334-.372-.149-.644.186-.272.373-.347.521-.422.149-.075.297-.125.446-.149s.223-.022.323-.022c.15-.002.347.023.521.223.173.199.767.966.94 1.164.173.199.347.223.644.075.297-.149 1.255-.463 2.39-1.475.883-.788 1.48-1.761 1.653-2.059.173-.297.023-.47-.05-.644-.073-.172-.644-1.563-.882-2.129-.239-.566-.48-.48-.669-.486-.189-.007-.386-.007-.584-.007s-.48.074-.73.372-.944 1.164-1.163 1.412c-.22.247-.44.272-.736.125-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.023-.47-.05-.644-.073-.172-.644-1.563-.882-2.129-.239-.566-.48-.48-.669-.486-.189-.007-.386-.007-.584-.007s-.48.074-.73.372-.944 1.164-1.163 1.412c-.22.247-.44.272-.736.125z"/></svg></a>
            <a href={t.contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors duration-300" aria-label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
            <a href={t.contactInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors duration-300" aria-label="GitHub"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
            
            <div className="flex-grow"></div> 

            <button onClick={() => setIsCoverLetterModalOpen(true)} className="hover:text-pink-600 transition-colors duration-300" aria-label={t.coverLetterGenerator.buttonText} title={t.coverLetterGenerator.buttonText}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v2a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v2a1 1 0 01-1 1h-3a1 1 0 00-1-1v-.5a1.5 1.5 0 01-3 0v.5a1 1 0 00-1 1H6a1 1 0 01-1-1v-2a1 1 0 011-1h.5a1.5 1.5 0 000-3H6a1 1 0 01-1-1V5a1 1 0 011-1h3a1 1 0 001-1v-.5z" /></svg>
            </button>
            <button onClick={handleDownloadPdf} disabled={isPrinting} className="hover:text-pink-600 transition-colors duration-300 disabled:text-slate-400 disabled:cursor-wait" aria-label="Download PDF">
                {isPrinting ? 
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  :
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                }
            </button>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-300/50">
          <div className="flex justify-center lg:justify-start space-x-2 flex-wrap">
            {Object.keys(translations).map(lang => (
              <button key={lang} onClick={() => setLanguage(lang)} className={`px-3 py-1 mb-2 text-sm font-semibold rounded-full transition-colors duration-300 ${language === lang ? 'bg-pink-600 text-white shadow-md' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;