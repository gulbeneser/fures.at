import React, { useState } from 'react';
import AnimatedSection from './AnimatedSection';
import ExperienceCard from './ui/ExperienceCard';

interface ExperienceProps {
  t: any;
  experienceOrder: string[];
}

const Experience: React.FC<ExperienceProps> = ({ t, experienceOrder }) => {
  const [expandedKey, setExpandedKey] = useState<string | null>('neu');

  return (
    <AnimatedSection id="experience">
      <h2 className="text-2xl font-bold text-primary-text mb-6">{t.experience.title}</h2>
      <div className="space-y-4">
        {experienceOrder.map(key => (
          <ExperienceCard 
            key={key}
            expKey={key}
            exp={t.experience[key as keyof typeof t.experience]}
            t={t}
            isExpanded={expandedKey === key}
            setExpandedKey={setExpandedKey}
          />
        ))}
      </div>
    </AnimatedSection>
  );
};

export default Experience;
