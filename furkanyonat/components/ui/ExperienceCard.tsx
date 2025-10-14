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
        <div className="glass-card rounded-2xl shadow-lg transition-all duration-300 overflow-hidden">
            <button
                className="w-full text-left p-6 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50 transition-colors"
                onClick={() => setExpandedKey(isExpanded ? null : expKey)}
                aria-expanded={isExpanded}
                aria-controls={`experience-details-${expKey}`}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-secondary-text font-semibold uppercase tracking-wider">{exp.date}</p>
                        <h3 className="text-lg font-bold text-primary-text mt-1">{exp.role}</h3>
                        <p className="text-md text-primary-text/80">{exp.company}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-secondary-text transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            <div 
                id={`experience-details-${expKey}`} 
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 border-t border-card-border">
                        <div className="space-y-4 pt-4">
                            {('problem' in exp && exp.problem) && (
                                <div>
                                    <h4 className="font-bold text-sm text-secondary-text tracking-wider">{t.experience.problemTitle}</h4>
                                    <p className="text-secondary-text mt-1 text-sm">{exp.problem}</p>
                                </div>
                            )}
                            {('action' in exp && exp.action) && (
                                <div className="">
                                    <h4 className="font-bold text-sm text-secondary-text tracking-wider">{t.experience.actionTitle}</h4>
                                    <p className="text-secondary-text mt-1 text-sm">{exp.action}</p>
                                </div>
                            )}
                            {('result' in exp && exp.result) && (
                                <div className="">
                                    <h4 className="font-bold text-sm text-secondary-text tracking-wider">{t.experience.resultTitle}</h4>
                                    <p className="text-secondary-text mt-1 text-sm">{exp.result}</p>
                                </div>
                            )}
                            {exp.tasks && exp.tasks.length > 0 && (
                                <div className="">
                                    <h4 className="font-bold text-sm text-secondary-text tracking-wider">{t.experience.tasksTitle}</h4>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-secondary-text text-sm">
                                        {exp.tasks.map((task: string, index: number) => <li key={index}>{task}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExperienceCard;