import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { projects, Project } from '../data/mockData';
import { ArrowLeft } from 'lucide-react';

interface HorizontalProjectsGalleryProps {
  onClose: () => void;
}

export default function HorizontalProjectsGallery({ onClose }: HorizontalProjectsGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="w-full h-full bg-[#050505] text-white overflow-hidden flex flex-col">
      {/* Header / Navigation */}
      <div className="flex justify-between items-center p-8 md:p-12 z-20">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-gray-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <div className="text-sm uppercase tracking-widest text-gray-500 border-l border-gray-700 pl-4">
          Services & Projects
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto flex items-center px-8 md:px-12 gap-4 md:gap-8 snap-x snap-mandatory scrollbar-hide perspective-[1000px]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Spacer for start */}
        <div className="w-[30vw] shrink-0" />

        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            containerRef={scrollContainerRef} 
          />
        ))}

        {/* Spacer for end */}
        <div className="w-[30vw] shrink-0" />
      </div>
    </div>
  );
}

function ProjectCard({ project, containerRef }: { project: Project, containerRef: React.RefObject<HTMLDivElement> }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollXProgress } = useScroll({
    target: ref,
    container: containerRef,
    axis: "x",
    offset: ["center end", "center start"]
  });

  // 3D Carousel Effects
  const rotateY = useTransform(scrollXProgress, [0, 0.5, 1], [45, 0, -45]);
  const scale = useTransform(scrollXProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);
  const opacity = useTransform(scrollXProgress, [0, 0.5, 1], [0.4, 1, 0.4]);
  const z = useTransform(scrollXProgress, [0, 0.5, 1], [-200, 0, -200]);

  return (
    <div className="snap-center shrink-0 perspective-[1000px]">
      <motion.div 
        ref={ref}
        style={{ 
          rotateY, 
          scale, 
          opacity,
          z,
          transformStyle: "preserve-3d"
        }}
        className="w-[60vw] md:w-[40vw] lg:w-[30vw] h-[50vh] md:h-[60vh] flex flex-col group cursor-pointer"
      >
        <div className="relative w-full h-full overflow-hidden bg-gray-900 mb-8 rounded-sm shadow-2xl">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <motion.img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <motion.div 
          className="mt-auto text-center"
          style={{ opacity }}
        >
          <h3 className="text-2xl md:text-3xl font-light uppercase tracking-tight mb-2">
            {project.title}
          </h3>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            {project.category}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
