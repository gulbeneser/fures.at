import React from 'react';
import AnimatedSection from './AnimatedSection';
import SkillBar from './ui/SkillBar';

interface SkillsProps {
  t: any;
}

const Skills: React.FC<SkillsProps> = ({ t }) => {
  const children = Object.values(t.skills)
    .filter((s): s is { title: string; items: any[] } => typeof s === 'object' && s !== null && 'items' in s)
    .map(skillCategory => (
      <div 
        key={skillCategory.title} 
        className="glass-card p-6 rounded-2xl opacity-0 translate-y-5 animate-reveal"
        style={{ animationDelay: `calc(var(--stagger-index) * 120ms)` } as React.CSSProperties}
      >
        <h3 className="text-lg font-bold text-primary-text mb-4 font-display">{skillCategory.title}</h3>
        <div className="space-y-4">
          {skillCategory.items.map((skill) => <SkillBar key={skill.name} name={skill.name} level={skill.level} percentage={skill.percentage} />)}
        </div>
      </div>
    ));

  return (
    <AnimatedSection id="skills">
       <style>{`
        @keyframes reveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal { animation: reveal 0.5s ease-out forwards; }
      `}</style>
      <h2 className="text-3xl font-bold text-primary-text font-display mb-8">{t.skills.title}</h2>
      <div className="space-y-8">
        {children}
      </div>
    </AnimatedSection>
  );
};

export default Skills;
