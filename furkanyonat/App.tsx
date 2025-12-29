import React, { useState, useEffect, useRef } from 'react';
import { translations, experienceOrder } from './data/translations';
import Header from './components/Sidebar';
import KPIs from './components/KPIs';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Education from './components/Education';
import Certificates from './components/Certificates';
import Projects from './components/Projects';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import { CertificateModal } from './components/modals/CertificateModal';
import { AccessibilityModal } from './components/modals/AccessibilityModal';

type Theme = 'light' | 'dark' | 'system';

const Hero = ({ t }: { t: any }) => (
  <section id="hero" className="min-h-screen flex items-center justify-center text-center pt-12 md:pt-16">
    <div className="max-w-3xl mx-auto px-4 space-y-6">
      <div className="space-y-3">
        <h1 className="text-5xl md:text-7xl font-bold text-primary-text font-display leading-tight">
          {t.name}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm md:text-base text-secondary-text">
          <a href={`tel:${t.contactInfo.phone}`} className="glass-card px-3 py-1.5 rounded-full border-none">
            {t.hero.contact.phone}: {t.contactInfo.phoneDisplay || t.contactInfo.phone}
          </a>
          <a href={`mailto:${t.contactInfo.email}`} className="glass-card px-3 py-1.5 rounded-full border-none">
            {t.hero.contact.email}: {t.contactInfo.email}
          </a>
          <div className="glass-card px-3 py-1.5 rounded-full border-none">
            {t.hero.contact.address}: {t.contactInfo.address}
          </div>
        </div>
      </div>
      <div className="inline-block glass-card rounded-full px-4 py-1.5 text-sm font-semibold border-none">
        {t.title}
      </div>
      <div className="inline-block glass-card rounded-full px-4 py-1.5 text-sm font-semibold border-none">
        {t.hero.pretitle}
      </div>
      <h2 className="text-4xl md:text-6xl font-bold text-primary-text font-display leading-tight">
        {t.hero.title}{' '}
        <span className="text-transparent bg-clip-text bg-[var(--highlight-gradient)]">
          {t.hero.titleGradient}
        </span>
      </h2>
      <p className="text-lg md:text-xl max-w-2xl mx-auto text-secondary-text leading-relaxed">
        {t.hero.subtitle}
      </p>
    </div>
  </section>
);

const App = () => {
  const [language, setLanguage] = useState('tr');
  const [theme, setTheme] = useState<Theme>('dark');
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isPrinting, setIsPrinting] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const userLang = navigator.language.split('-')[0];
    if (translations[userLang as keyof typeof translations]) {
      setLanguage(userLang);
    }
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    setTheme(savedTheme || 'dark');
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');

    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -60% 0px', threshold: 0 }
    );

    const sections = contentRef.current?.querySelectorAll('section');
    sections?.forEach((section) => observer.observe(section));

    return () => sections?.forEach((section) => observer.unobserve(section));
  }, [contentRef]);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const t = translations[language as keyof typeof translations] || translations.tr;

  return (
    <div className="min-h-screen">
      <Header
        t={t}
        language={language}
        setLanguage={setLanguage}
        activeSection={activeSection}
        theme={theme}
        setTheme={setTheme}
      />
          
      <div ref={contentRef} className="container mx-auto px-4 lg:px-8 max-w-screen-lg">
          <main className="space-y-24 md:space-y-32 pt-24 pb-16">
            <Hero t={t} />
            <KPIs t={t} />
            <Experience t={t} experienceOrder={experienceOrder} />
            <Skills t={t} />
            <Projects t={t} />
            <Education t={t} />
            <Certificates t={t} onCertificateSelect={setSelectedCert} />
            <Footer t={t} onAccessibilityClick={() => setIsAccessibilityModalOpen(true)} />
          </main>
      </div>
      
      <Chatbot t={t} language={language} isPrinting={isPrinting} />

      {selectedCert && <CertificateModal cert={selectedCert} onClose={() => setSelectedCert(null)} lang={t.certificates} />}
      {isAccessibilityModalOpen && <AccessibilityModal onClose={() => setIsAccessibilityModalOpen(false)} lang={t.accessibility} />}
    </div>
  );
};

export default App;