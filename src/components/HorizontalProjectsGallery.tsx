import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { projects, Project } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';

interface HorizontalProjectsGalleryProps {
  onSelectProject: (project: Project) => void;
}

export default function HorizontalProjectsGallery({ onSelectProject }: HorizontalProjectsGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const { t } = useLanguage();

  // Duplicate projects to create a longer, more immersive carousel
  const allProjects = [...projects, ...projects, ...projects];

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

  // Map vertical scroll to horizontal scroll
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
  
  return (
    <div className="w-full h-full bg-[#050505] text-white overflow-hidden flex flex-col relative">
      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto flex items-center px-8 md:px-12 gap-4 md:gap-8 snap-x snap-mandatory scrollbar-hide perspective-[1000px] cursor-grab active:cursor-grabbing"
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

function ProjectCard({ project, containerRef, onClick }: { project: Project, containerRef: React.RefObject<HTMLDivElement>, onClick: () => void }) {
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
            src={project.image} 
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
