import React from 'react';

interface ProjectCardProps {
    project: {
        name: string;
        description: string;
        link: string;
        tags: string[];
    };
    visitProjectText: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, visitProjectText }) => {
    return (
        <a 
            href={project.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group block glass-card p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
        >
            <div className="relative z-10 flex flex-col h-full">
                <div>
                    <h3 className="text-lg font-bold text-primary-text font-display">{project.name}</h3>
                    <p className="text-secondary-text text-sm mt-2">{project.description}</p>
                </div>
                <div className="flex-grow"></div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                        <span key={tag} className="text-xs font-semibold text-blue-300 bg-blue-600/20 px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
        </a>
    );
};

export default ProjectCard;