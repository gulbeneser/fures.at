import React from 'react';

interface ExperienceCardProps {
    expKey: string;
    exp: any;
    t: any;
    isExpanded: boolean;
    setExpandedKey: (key: string | null) => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ expKey, exp, t, isExpanded, setExpandedKey }) => {
    if (typeof exp !== 'object' || exp === null || !('role' in exp)) return null;

    return (
        <div className="glass-card rounded-xl shadow-lg transition-all duration-300 overflow-hidden">
            <button
                className="w-full text-left p-6 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                onClick={() => setExpandedKey(isExpanded ? null : expKey)}
                aria-expanded={isExpanded}
                aria-controls={`experience-details-${expKey}`}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-blue-800 font-semibold">{exp.date}</p>
                        <h3 className="text-lg font-bold text-primary-text mt-1">{exp.role}</h3>
                        <p className="text-md text-secondary-text">{exp.company}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-blue-800 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            <div 
                id={`experience-details-${expKey}`} 
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="pt-4 px-6 pb-6 border-t border-slate-200/50">
                        {('problem' in exp && exp.problem) && (
                            <div>
                                <h4 className="font-bold text-sm text-secondary-text tracking-wider">{t.experience.problemTitle}</h4>
                                <p className="text-secondary-text mt-1">{exp.problem}</p>
                            </div>
                        )}
                        {('action' in exp && exp.action) && (
                            <div className="mt-3">
                                <h4 className="font-bold text-sm text-secondary-text tracking-wider">{t.experience.actionTitle}</h4>
                                <p className="text-secondary-text mt-1">{exp.action}</p>
                            </div>
                        )}
                        {('result' in exp && exp.result) && (
                            <div className="mt-3">
                                <h4 className="font-bold text-sm text-secondary-text tracking-wider">{t.experience.resultTitle}</h4>
                                <p className="text-secondary-text mt-1">{exp.result}</p>
                            </div>
                        )}
                        {exp.tasks && exp.tasks.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-bold text-sm text-secondary-text tracking-wider">{t.experience.tasksTitle}</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-secondary-text">
                                    {exp.tasks.map((task: string, index: number) => <li key={index}>{task}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExperienceCard;
