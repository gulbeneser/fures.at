import React from 'react';
import AnimatedSection from './AnimatedSection';

interface EducationProps {
  t: any;
}

const Education: React.FC<EducationProps> = ({ t }) => {
  return (
    <AnimatedSection id="education">
      <h2 className="text-2xl font-bold text-primary-text mb-6">{t.education.title}</h2>
      <div className="space-y-4">
        {Object.values(t.education).filter((e): e is { degree: string, university: string, date: string, details: string[] } => typeof e === 'object' && e !== null && 'degree' in e).map((edu) => (
          <div key={edu.degree} className="glass-card p-6 rounded-xl shadow-lg">
            <p className="text-xs text-blue-800 font-semibold">{edu.date}</p>
            <h3 className="text-lg font-bold text-primary-text mt-1">{edu.degree}</h3>
            <p className="text-md text-secondary-text">{edu.university}</p>
            {edu.details && edu.details.length > 0 && (
                <ul className="list-disc list-inside mt-2 space-y-1 text-secondary-text text-sm">
                    {edu.details.map((detail: string, index: number) => <li key={index}>{detail}</li>)}
                </ul>
            )}
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
};

export default Education;
