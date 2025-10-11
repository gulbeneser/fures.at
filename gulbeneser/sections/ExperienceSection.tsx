import React, { useState } from 'react';
import AnimatedSection from '../components/AnimatedSection';

const ExperienceCard = ({ exp, t, delay, isExpanded, onToggle }: { exp: any, t: any, delay: number, isExpanded: boolean, onToggle: () => void }) => (
    <AnimatedSection delay={delay}>
        <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl overflow-hidden">
            <button 
                onClick={onToggle} 
                className="w-full text-left p-6 flex justify-between items-start gap-4" 
                aria-expanded={isExpanded}
            >
                <div className="flex-1">
                    <p className="text-xs text-blue-800 font-semibold">{exp.date}</p>
                    <h3 className="text-xl font-bold text-slate-800 mt-1">{exp.role}</h3>
                    <p className="text-md text-slate-600">{exp.company}</p>
                </div>
                <div className="flex-shrink-0 pt-1 text-slate-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1500px]' : 'max-h-0'}`}>
                <div className="px-6 pb-6 pt-4 border-t border-slate-200/80">
                    {('problem' in exp && exp.problem) && (
                        <div className="mt-4">
                            <h4 className="font-bold text-sm text-slate-500 tracking-wider uppercase">{t.experience.problemTitle}</h4>
                            <p className="text-slate-700 mt-1 text-sm">{exp.problem}</p>
                        </div>
                    )}
                    {('action' in exp && exp.action) && (
                        <div className="mt-3">
                            <h4 className="font-bold text-sm text-slate-500 tracking-wider uppercase">{t.experience.actionTitle}</h4>
                            <p className="text-slate-700 mt-1 text-sm">{exp.action}</p>
                        </div>
                    )}
                    {('result' in exp && exp.result) && (
                        <div className="mt-3">
                            <h4 className="font-bold text-sm text-slate-500 tracking-wider uppercase">{t.experience.resultTitle}</h4>
                            <p className="text-slate-700 mt-1 text-sm">{exp.result}</p>
                        </div>
                    )}
                    {('learnings' in exp && exp.learnings) && (
                        <div className="mt-3">
                            <h4 className="font-bold text-sm text-slate-500 tracking-wider uppercase">{t.experience.learningsTitle}</h4>
                            <p className="text-slate-700 mt-1 text-sm">{exp.learnings}</p>
                        </div>
                    )}
                    {exp.tasks && exp.tasks.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-bold text-sm text-slate-500 tracking-wider uppercase">{t.experience.tasksTitle}</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700 text-sm">
                                {exp.tasks.map((task: string, index: number) => <li key={index}>{task}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </AnimatedSection>
);

const ExperienceSection = ({ t }: { t: any }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
    const experienceKeys = Object.keys(t.experience).filter(key => typeof t.experience[key] === 'object');
    
    const handleToggle = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <AnimatedSection>
            <h2 className="text-3xl font-bold text-slate-800 relative inline-block">
                {t.experience.title}
                <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transform translate-y-2"></span>
            </h2>
            <div className="mt-8 space-y-4">
                {experienceKeys.map((key, index) => (
                    <ExperienceCard 
                        key={key} 
                        exp={t.experience[key]} 
                        t={t} 
                        delay={index * 100} 
                        isExpanded={expandedIndex === index}
                        onToggle={() => handleToggle(index)}
                    />
                ))}
            </div>
        </AnimatedSection>
    );
};

export default ExperienceSection;