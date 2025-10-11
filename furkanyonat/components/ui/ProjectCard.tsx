import React, { useRef, MouseEvent } from 'react';

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
    const cardRef = useRef<HTMLAnchorElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateX = (rect.height / 2 - y) / (rect.height / 2) * -7;
        const rotateY = (x - rect.width / 2) / (rect.width / 2) * 7;

        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
        card.style.setProperty('--rotateX', `${rotateX}deg`);
        card.style.setProperty('--rotateY', `${rotateY}deg`);
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        card.style.setProperty('--rotateX', '0deg');
        card.style.setProperty('--rotateY', '0deg');
    };

    return (
        <a 
            href={project.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative block glass-card p-6 rounded-2xl overflow-hidden transition-all duration-300"
            style={{ transformStyle: 'preserve-3d', transform: 'perspective(1000px) rotateY(var(--rotateY, 0)) rotateX(var(--rotateX, 0))' } as React.CSSProperties}
        >
            <div 
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'radial-gradient(400px circle at var(--x, 100px) var(--y, 100px), rgba(56, 189, 248, 0.15), transparent 80%)' }}
            ></div>
            <div className="relative z-10">
                <h3 className="text-lg font-bold text-primary-text font-display">{project.name}</h3>
                <p className="text-secondary-text text-sm mt-2">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                        <span key={tag} className="text-xs font-semibold text-accent-color bg-accent-color/10 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
            <div className="absolute bottom-4 right-6 z-20 flex items-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <span className="text-xs font-semibold text-primary-text mr-2">{visitProjectText}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-text" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
        </a>
    );
};

export default ProjectCard;
