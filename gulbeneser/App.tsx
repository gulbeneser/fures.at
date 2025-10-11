import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';

import { translations } from './data/translations';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import { notoSansRegular } from './data/NotoSans-Regular-Base64';

import Header from './sections/Header';
import KpiSection from './sections/KpiSection';
import ExperienceSection from './sections/ExperienceSection';
import SkillsSection from './sections/SkillsSection';
import EducationSection from './sections/EducationSection';
import CertificatesSection from './sections/CertificatesSection';
import ProjectsSection from './sections/ProjectsSection';
import Footer from './sections/Footer';
import Chatbot from './components/Chatbot';
import CertificateModal from './components/modals/CertificateModal';
import AccessibilityModal from './components/modals/AccessibilityModal';
import CoverLetterModal from './components/modals/CoverLetterModal';

const App = () => {
  const [language, setLanguage] = useState('tr');
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeSection, setActiveSection] = useState('experience');

  const t = translations[language as keyof typeof translations] || translations.tr;

  useEffect(() => {
    const userLang = navigator.language.split('-')[0];
    if (translations[userLang as keyof typeof translations]) {
      setLanguage(userLang);
    }
  }, []);

  const handleDownloadPdf = async () => {
      setIsPrinting(true);
      try {
        const doc = new jsPDF('p', 'pt', 'a4');
        const margin = 40;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = margin;

        // Add and set the custom font
        doc.addFileToVFS('NotoSans-Regular.ttf', notoSansRegular);
        doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
        doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'bold'); // Assuming same file for bold for simplicity

        // --- Header ---
        doc.setFont('NotoSans', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(t.pdfColors.primary);
        doc.text(t.name, pageWidth / 2, y, { align: 'center' });
        y += 28;

        doc.setFont('NotoSans', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(t.pdfColors.secondary);
        doc.text(t.title.replace(/<[^>]*>?/gm, ''), pageWidth / 2, y, { align: 'center' });
        y += 16;
        
        doc.setFontSize(9);
        doc.setTextColor(t.pdfColors.text);
        const contactInfo = `${t.contactInfo.email} | ${t.contactInfo.phone} | ${t.contactInfo.address}`;
        doc.text(contactInfo, pageWidth / 2, y, { align: 'center' });
        y += 30;

        const addSectionTitle = (title: string) => {
            if (y > pageHeight - margin - 30) { doc.addPage(); y = margin; }
            doc.setFont('NotoSans', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(t.pdfColors.primary);
            doc.text(title, margin, y);
            y += 20;
            doc.setDrawColor(t.pdfColors.primary);
            doc.line(margin, y - 15, margin + 50, y-15);
        };
        
        // --- Experience ---
        addSectionTitle(t.experience.title);
        Object.values(t.experience).filter((e): e is any => typeof e === 'object' && 'role' in e).forEach(exp => {
            if (y > pageHeight - margin - 60) { doc.addPage(); y = margin; }
            doc.setFont('NotoSans', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(t.pdfColors.secondary);
            doc.text(exp.role, margin, y);
            doc.setFont('NotoSans', 'normal');
            doc.text(exp.date, pageWidth - margin, y, { align: 'right' });
            y += 14;

            doc.setFontSize(10);
            doc.setTextColor(t.pdfColors.text);
            doc.text(exp.company, margin, y);
            y += 20;

            if (exp.tasks && exp.tasks.length > 0) {
              exp.tasks.forEach((task: string) => {
                  if (y > pageHeight - margin - 20) { doc.addPage(); y = margin; }
                  doc.text(`• ${task}`, margin + 10, y, { maxWidth: pageWidth - margin * 2 - 10 });
                  y += doc.getTextDimensions(`• ${task}`, { maxWidth: pageWidth - margin * 2 - 10 }).h + 5;
              });
            }
            y += 15;
        });

        // --- Skills ---
        if (y > pageHeight - margin - 80) { doc.addPage(); y = margin; }
        addSectionTitle(t.skills.title);
        Object.values(t.skills).filter((s): s is any => typeof s === 'object' && 'title' in s && s.title !== t.skills.title).forEach(cat => {
            if (y > pageHeight - margin - 40) { doc.addPage(); y = margin; }
            doc.setFont('NotoSans', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(t.pdfColors.secondary);
            doc.text(cat.title, margin, y);
            y += 18;

            cat.items.forEach((skill: any) => {
                if (y > pageHeight - margin - 20) { doc.addPage(); y = margin; }
                doc.setFont('NotoSans', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(t.pdfColors.text);
                doc.text(skill.name, margin, y);
                doc.text(skill.level, pageWidth - margin, y, { align: 'right' });
                y += 15;
            });
        });
        
        // --- Education ---
        if (y > pageHeight - margin - 80) { doc.addPage(); y = margin; }
        addSectionTitle(t.education.title);
        Object.values(t.education).filter((e): e is any => typeof e === 'object' && 'degree' in e).forEach(edu => {
            if (y > pageHeight - margin - 50) { doc.addPage(); y = margin; }
            doc.setFont('NotoSans', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(t.pdfColors.secondary);
            doc.text(edu.degree, margin, y);
            doc.setFont('NotoSans', 'normal');
            doc.text(edu.date, pageWidth - margin, y, { align: 'right' });
            y += 14;

            doc.setFontSize(10);
            doc.setTextColor(t.pdfColors.text);
            doc.text(edu.university, margin, y);
            y += 15;

            if (edu.details && edu.details.length > 0) {
                edu.details.forEach((detail: string) => {
                    if (y > pageHeight - margin - 20) { doc.addPage(); y = margin; }
                    doc.text(`• ${detail}`, margin + 10, y, { maxWidth: pageWidth - margin * 2 - 10 });
                    y += doc.getTextDimensions(`• ${detail}`, { maxWidth: pageWidth - margin * 2 - 10 }).h + 5;
                });
            }
            y += 10;
        });
        
        // --- Projects ---
        if (y > pageHeight - margin - 80) { doc.addPage(); y = margin; }
        addSectionTitle(t.projects.title);
        t.projects.items.forEach((project: any) => {
            if (y > pageHeight - margin - 40) { doc.addPage(); y = margin; }
            doc.setFont('NotoSans', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(t.pdfColors.secondary);
            doc.text(project.name, margin, y);
            y += 14;
            
            doc.setFont('NotoSans', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(t.pdfColors.text);
            const descriptionLines = doc.splitTextToSize(project.description, pageWidth - margin * 2);
            doc.text(descriptionLines, margin, y);
            y += descriptionLines.length * 12 + 10;
        });
        
        // --- Certificates ---
        if (y > pageHeight - margin - 80) { doc.addPage(); y = margin; }
        addSectionTitle(t.certificates.title);
        t.certificates.items.forEach((cert: any) => {
            if (y > pageHeight - margin - 30) { doc.addPage(); y = margin; }
            doc.setFont('NotoSans', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(t.pdfColors.secondary);
            doc.text(cert.name, margin, y, { maxWidth: pageWidth - margin * 2 });
            const nameHeight = doc.getTextDimensions(cert.name, { maxWidth: pageWidth - margin * 2 }).h;
            y += nameHeight + 2;

            doc.setFont('NotoSans', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(t.pdfColors.text);
            doc.text(cert.issuer, margin, y);
            y += 20;
        });

        doc.save('Gulben-Eser-CV.pdf');
    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setIsPrinting(false);
    }
  };

  const SectionWrapper = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const [ref, entry] = useIntersectionObserver({ threshold: 0.3, rootMargin: "-100px 0px -100px 0px" });
    useEffect(() => {
      if (entry?.isIntersecting) {
        setActiveSection(id);
      }
    }, [entry, id]);
    return <section ref={ref} id={id}>{children}</section>;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <div className={`container mx-auto p-4 md:p-8`}>
        <div className={'lg:flex lg:space-x-12'}>
          <Header
            t={t}
            language={language}
            setLanguage={setLanguage}
            handleDownloadPdf={handleDownloadPdf}
            isPrinting={isPrinting}
            activeSection={activeSection}
            setIsCoverLetterModalOpen={setIsCoverLetterModalOpen}
          />
          
          <div id="cv-content" className={'lg:w-2/3 mt-16 lg:mt-0'}>
            <KpiSection t={t} />
            
            <main className="mt-16 space-y-16">
              <SectionWrapper id="experience"><ExperienceSection t={t} /></SectionWrapper>
              <SectionWrapper id="skills"><SkillsSection t={t} /></SectionWrapper>
              <SectionWrapper id="education"><EducationSection t={t} /></SectionWrapper>
              <SectionWrapper id="certificates"><CertificatesSection t={t} setSelectedCert={setSelectedCert} /></SectionWrapper>
              <SectionWrapper id="projects"><ProjectsSection t={t} /></SectionWrapper>
              
              <Footer t={t} setIsAccessibilityModalOpen={setIsAccessibilityModalOpen} />
            </main>
          </div>
        </div>
      </div>

      <Chatbot t={t} language={language} />
      {selectedCert && <CertificateModal cert={selectedCert} onClose={() => setSelectedCert(null)} lang={t.certificates} />}
      {isAccessibilityModalOpen && <AccessibilityModal onClose={() => setIsAccessibilityModalOpen(false)} lang={t.accessibility} />}
      {isCoverLetterModalOpen && <CoverLetterModal onClose={() => setIsCoverLetterModalOpen(false)} t={t} />}
    </div>
  );
};

export default App;