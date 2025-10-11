import React from 'react';
import SkillBar from '../components/SkillBar';
import AnimatedSection from '../components/AnimatedSection';

const SkillsSection = ({ t }: { t: any }) => (
    <AnimatedSection>
        <h2 className="text-3xl font-bold text-slate-800 relative inline-block">
            {t.skills.title}
            <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transform translate-y-2"></span>
        </h2>
        <div className="mt-8 space-y-8">
            {Object.values(t.skills).filter((s): s is { title: string; items: any[] } => typeof s === 'object' && s !== null && 'items' in s).map((skillCategory, index) => (
                <AnimatedSection delay={index * 150} key={skillCategory.title}>
                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">{skillCategory.title}</h3>
                        <div className="space-y-5">
                            {skillCategory.items.map((skill) => <SkillBar key={skill.name} name={skill.name} level={skill.level} percentage={skill.percentage} />)}
                        </div>
                    </div>
                </AnimatedSection>
            ))}
        </div>
    </AnimatedSection>
);

export default SkillsSection;
