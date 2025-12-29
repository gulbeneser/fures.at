import React, { useState } from 'react';
import AnimatedSection from './AnimatedSection';
import ExperienceCard from './ui/ExperienceCard';

interface ExperienceProps {
  t: any;
  experienceOrder: string[];
}

const Experience: React.FC<ExperienceProps> = ({ t, experienceOrder }) => {
  const [expandedKey, setExpandedKey] = useState<string | null>('neu');
  const [expandAll, setExpandAll] = useState(false);

  const handleToggleAll = () => {
    setExpandAll((prev) => {
      const next = !prev;
      setExpandedKey(next ? null : 'neu');
      return next;
    });
  };

  return (
    <AnimatedSection id="experience">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary-text">{t.experience.title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleToggleAll}
            className="glass-card rounded-full px-4 py-2 text-sm font-semibold border-none hover:bg-white/5 transition-colors"
            aria-pressed={expandAll}
          >
            {expandAll ? t.experience.controls.collapseAll : t.experience.controls.expandAll}
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {experienceOrder.map(key => (
          <ExperienceCard
            key={key}
            expKey={key}
            exp={t.experience[key as keyof typeof t.experience]}
            t={t}
            isExpanded={expandAll || expandedKey === key}
            setExpandedKey={setExpandedKey}
            expandAll={expandAll}
          />
        ))}
      </div>
    </AnimatedSection>
  );
};

export default Experience;
