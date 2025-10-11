import React from 'react';
import AnimatedSection from '../components/AnimatedSection';

const ProjectsSection = ({ t }: { t: any }) => (
    <AnimatedSection>
        <h2 className="text-3xl font-bold text-slate-800 relative inline-block">
            {t.projects.title}
            <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transform translate-y-2"></span>
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {t.projects.items.map((project: any, index: number) => (
                <AnimatedSection delay={index * 100} key={project.name}>
                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                        <h3 className="text-xl font-bold text-slate-800">{project.name}</h3>
                        <p className="text-slate-600 mt-2 flex-grow">{project.description}</p>
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block w-full text-center px-4 py-2 text-sm font-semibold text-white bg-blue-800 rounded-lg hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">
                            {t.projects.visitProject}
                        </a>
                    </div>
                </AnimatedSection>
            ))}
        </div>
    </AnimatedSection>
);

export default ProjectsSection;
