
import React, { useState, useEffect, useRef } from 'react';
import { translations, experienceOrder } from './data/translations';
import Sidebar from './components/Sidebar';
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

const App = () => {
  const [language, setLanguage] = useState('tr');
  const [theme, setTheme] = useState<Theme>('system');
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('experience');
  // FIX: Add state to track printing status for Chatbot component.
  const [isPrinting, setIsPrinting] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Auto-detect language
    const userLang = navigator.language.split('-')[0];
    if (translations[userLang as keyof typeof translations]) {
      setLanguage(userLang);
    }
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Theme management
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');

    localStorage.setItem('theme', theme);
  }, [theme]);

  // Active section tracking for sidebar nav
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px', threshold: 0 }
    );

    const sections = contentRef.current?.querySelectorAll('section');
    sections?.forEach((section) => observer.observe(section));

    return () => sections?.forEach((section) => observer.unobserve(section));
  }, [contentRef]);

  // Interactive cursor spotlight
  useEffect(() => {
    const spotlight = document.getElementById('cursor-spotlight');
    const updateSpotlight = (e: MouseEvent) => {
      spotlight?.style.setProperty('--x', `${e.clientX}px`);
      spotlight?.style.setProperty('--y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', updateSpotlight);
    return () => window.removeEventListener('mousemove', updateSpotlight);
  }, []);

  // FIX: Add effect to listen for print events to hide chatbot.
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
      <div className="container mx-auto px-4 lg:px-8 lg:max-w-screen-xl">
        <div className="lg:flex lg:gap-16">
          <Sidebar
            t={t}
            language={language}
            setLanguage={setLanguage}
            activeSection={activeSection}
            theme={theme}
            setTheme={setTheme}
          />
          
          <div ref={contentRef} className="lg:w-2/3 lg:pt-24 lg:pb-16">
            <main className="space-y-24">
              <KPIs t={t} />
              <Experience t={t} experienceOrder={experienceOrder} />
              <Skills t={t} />
              <Projects t={t} />
              <Education t={t} />
              <Certificates t={t} onCertificateSelect={setSelectedCert} />
              <Footer t={t} onAccessibilityClick={() => setIsAccessibilityModalOpen(true)} />
            </main>
          </div>
        </div>
      </div>

      {/* FIX: Pass isPrinting prop to Chatbot component. */}
      <Chatbot t={t} language={language} isPrinting={isPrinting} />

      {selectedCert && <CertificateModal cert={selectedCert} onClose={() => setSelectedCert(null)} lang={t.certificates} />}
      {isAccessibilityModalOpen && <AccessibilityModal onClose={() => setIsAccessibilityModalOpen(false)} lang={t.accessibility} />}
    </div>
  );
};

export default App;
