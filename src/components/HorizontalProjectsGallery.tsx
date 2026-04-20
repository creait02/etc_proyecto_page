import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { projects, Project } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteData } from '../contexts/SiteContext';

interface HorizontalProjectsGalleryProps {
  onSelectProject: (project: Project) => void;
}

export default function HorizontalProjectsGallery({ onSelectProject }: HorizontalProjectsGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filter, setFilter] = useState<'all' | 'build' | 'complete'>('all');
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const { t } = useLanguage();
  const { projects: liveProjects } = useSiteData();

  // Use live projects if available, otherwise fallback to mock data
  const displayProjects = liveProjects && liveProjects.length > 0 ? liveProjects : projects;

  // Filter projects by status
  const filteredProjects = filter === 'all' 
    ? displayProjects 
    : displayProjects.filter((p: any) => p.status === filter);

  // Duplicate projects to create a longer, more immersive carousel
  // We need at least a few items for the effect to work well
  const allProjects = filteredProjects.length > 0 
    ? [...filteredProjects, ...filteredProjects, ...filteredProjects]
    : [];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
    
    // Disable snap while dragging for smooth movement
    scrollContainerRef.current.style.scrollSnapType = 'none';
    scrollContainerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    if (!isDragging || !scrollContainerRef.current) return;
    setIsDragging(false);
    
    // Re-enable snap
    scrollContainerRef.current.style.scrollSnapType = 'x mandatory';
    scrollContainerRef.current.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    
    // Re-enable snap
    scrollContainerRef.current.style.scrollSnapType = 'x mandatory';
    scrollContainerRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Sync wheel scroll for horizontal movement
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        container.scrollLeft += e.deltaY * 2.5; 
        e.preventDefault();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Reset scroll when filter changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [filter]);
  
  return (
    <div className="w-full h-full bg-[#050505] text-white overflow-hidden flex flex-col relative cursor-none">
      {/* Filtering UI */}
      <div className="absolute top-20 md:top-[124px] left-0 w-full z-50 flex justify-center items-center gap-3 md:gap-8 pointer-events-none px-4">
        {(['all', 'build', 'complete'] as const).map((option) => (
          <button
            key={option}
            onMouseDown={(e) => e.stopPropagation()} // Prevent parent drag from triggering
            onClick={(e) => {
              e.stopPropagation();
              setFilter(option);
            }}
            className={`
              pointer-events-auto
              px-4 md:px-8 py-2 md:py-2.5 rounded-full border text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] font-bold transition-all duration-500
              ${filter === option 
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105 md:scale-110' 
                : 'bg-transparent text-gray-500 border-white/10 hover:border-white/40 hover:text-white'
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto flex items-center px-6 md:px-12 gap-8 md:gap-20 snap-x snap-mandatory scrollbar-hide perspective-[1000px] cursor-none pt-32 md:pt-40 pb-20"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {/* Spacer for start */}
        <div className="w-[30vw] shrink-0" />

        {allProjects.map((project, index) => (
          <ProjectCard 
            key={`${project.id}-${index}`} 
            project={project} 
            containerRef={scrollContainerRef} 
            onClick={() => {
              if (!isDragging) onSelectProject(project);
            }}
          />
        ))}

        {/* Spacer for end */}
        <div className="w-[30vw] shrink-0" />
      </div>
    </div>
  );
}

const ProjectCard: React.FC<{ project: Project, containerRef: React.RefObject<HTMLDivElement>, onClick: () => void }> = ({ project, containerRef, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  
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
        onClick={onClick}
      >
        <div className="relative w-full h-full overflow-hidden bg-gray-900 mb-8 rounded-sm shadow-2xl">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <motion.img 
            layoutId={`project-image-${project.id}`}
            src={(project as any).image_url || project.image} 
            alt={language === 'es' ? project.titleEs : project.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <motion.div 
          className="mt-auto text-center"
          style={{ opacity }}
        >
          <h3 className="text-2xl md:text-3xl font-light uppercase tracking-tight mb-2">
            {language === 'es' ? project.titleEs : project.title}
          </h3>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            {language === 'es' ? project.categoryEs : project.category}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
