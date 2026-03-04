import { useState } from 'react';
import { projects, Project } from '../data/mockData';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

export default function ProjectList() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section className="bg-[#111] py-24 px-6 md:px-12">
      <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-white text-4xl md:text-6xl font-light uppercase tracking-tight mb-4">
            Selected Works
          </h2>
          <p className="text-gray-400 max-w-md font-light">
            A curated selection of our most recent architectural and interior design projects.
          </p>
        </div>
        <div className="h-[1px] bg-white/20 flex-1 ml-0 md:ml-12 mb-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {projects.map((project, index) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            index={index} 
            onClick={setSelectedProject}
          />
        ))}
      </div>

      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </section>
  );
}
