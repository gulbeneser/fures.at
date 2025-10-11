import React from 'react';
import AnimatedSection from '../components/AnimatedSection';

const EducationSection = ({ t }: { t: any }) => (
    <AnimatedSection>
        <h2 className="text-3xl font-bold text-slate-800 relative inline-block">
            {t.education.title}
            <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transform translate-y-2"></span>
        </h2>
        <div className="mt-8 space-y-8">
            {Object.values(t.education).filter((e): e is any => typeof e === 'object' && e !== null && 'degree' in e).map((edu: any) => (
                <div key={edu.degree} className="bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                    <p className="text-xs text-blue-800 font-semibold">{edu.date}</p>
                    <h3 className="text-xl font-bold text-slate-800 mt-1">{edu.degree}</h3>
                    <p className="text-md text-slate-600">{edu.university}</p>
                    {edu.details && edu.details.length > 0 && (
                        <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600 text-sm">
                            {edu.details.map((detail: string, index: number) => <li key={index}>{detail}</li>)}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    </AnimatedSection>
);

export default EducationSection;
