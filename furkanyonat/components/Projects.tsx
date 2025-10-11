import React from 'react';
import AnimatedSection from './AnimatedSection';
import ProjectCard from './ui/ProjectCard';

interface ProjectsProps {
  t: any;
}

const Projects: React.FC<ProjectsProps> = ({ t }) => {
  return (
    <AnimatedSection id="projects">
      <h2 className="text-2xl font-bold text-primary-text mb-6">{t.projects.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {t.projects.items.map((project: any) => (
          <ProjectCard key={project.name} project={project} visitProjectText={t.projects.visitProject} />
        ))}
      </div>
    </AnimatedSection>
  );
};

export default Projects;
