import React from 'react';
import AnimatedSection from './AnimatedSection';
import Counter from './ui/Counter';

interface KPIsProps {
  t: any;
}

const KPIs: React.FC<KPIsProps> = ({ t }) => {
  const icons: { [key: string]: React.ReactNode } = {
    hotels: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    languages: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m4 13l4-16M12 19l4-16m-4 16L8 3m4 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    projects: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    automation: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  };
  
  const kpiItems = Object.entries(t.kpis).map(([key, value], index) => (
      <div 
        key={key}
        className="opacity-0 translate-y-5 animate-reveal"
        style={{ animationDelay: `calc(var(--stagger-index) * 100ms)` } as React.CSSProperties}
       >
        <Counter 
          endValue={value as string} 
          description={t.kpis_full[key as keyof typeof t.kpis_full]}
          icon={icons[key]}
        />
      </div>
    ));

  return (
    <AnimatedSection id="kpis">
        <style>{`
          @keyframes reveal {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-reveal { animation: reveal 0.5s ease-out forwards; }
        `}</style>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {kpiItems}
      </div>
    </AnimatedSection>
  );
};

export default KPIs;
