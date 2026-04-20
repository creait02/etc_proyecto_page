import React, { useRef, useState, useEffect, useMemo, memo } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { projects, Project } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteData } from '../contexts/SiteContext';
import Editable from './Editable';

interface HorizontalProjectsGalleryProps {
  onSelectProject: (project: Project) => void;
}

const HorizontalProjectsGallery = ({ onSelectProject }: HorizontalProjectsGalleryProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const { t, language } = useLanguage();
  const { projects: liveProjects, settings } = useSiteData();

  // Filter labels from CMS settings (Dynamic list)
  const filterOptions = useMemo(() => {
    return settings?.project_filters || [
      { id: 'all', label_en: 'All', label_es: 'Todos' },
      { id: 'build', label_en: 'Build', label_es: 'En Obra' },
      { id: 'complete', label_en: 'Complete', label_es: 'Terminados' }
    ];
  }, [settings]);

  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => {
      if (id === 'all') return ['all'];
      
      const next = prev.includes(id) 
        ? prev.filter(f => f !== id) 
        : [...prev.filter(f => f !== 'all'), id];
      
      return next.length === 0 ? ['all'] : next;
    });
  };

  // Use live projects if available, otherwise fallback to mock data
  const displayProjects = useMemo(() => 
    liveProjects && liveProjects.length > 0 ? liveProjects : projects
  , [liveProjects]);

  // Filter projects by status or category if status doesn't match
  const filteredProjects = useMemo(() => {
    if (activeFilters.includes('all')) return displayProjects;
    
    return displayProjects.filter((p: any) => {
      const pStatuses = String(p.status || '').split(',').map(s => s.trim().toLowerCase());
      
      return activeFilters.some(fId => {
        const lowerFilter = fId.toLowerCase();
        return pStatuses.includes(lowerFilter) || 
               (p.category_en || p.category || '').toLowerCase().replace(/\s+/g, '-') === lowerFilter;
      });
    });
  }, [displayProjects, activeFilters]);

  // Duplicate projects to create a longer, more immersive carousel
  // Limited to 3 sets to balance performance and visual infinity
  const allProjects = useMemo(() => 
    filteredProjects.length > 0 
      ? [...filteredProjects, ...filteredProjects, ...filteredProjects]
      : []
  , [filteredProjects]);

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

  // Reset scroll when filters change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeFilters]);
  
  return (
    <div className="w-full h-full bg-[#050505] text-white overflow-hidden flex flex-col relative cursor-none">
      {/* Filtering UI */}
      <div className="absolute top-24 md:top-28 left-0 w-full z-50 flex justify-center items-center gap-3 md:gap-8 pointer-events-none px-4">
        <Editable section="projects" element="filters" className="pointer-events-auto flex items-center gap-3 md:gap-8">
          {filterOptions.map((option: any) => (
            <button
              key={option.id}
              onMouseDown={(e) => e.stopPropagation()} // Prevent parent drag from triggering
              onClick={(e) => {
                // Don't stop propagation so Editable can catch it
                toggleFilter(option.id);
              }}
              className={`
                px-4 md:px-8 py-2 md:py-2.5 rounded-full border text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] font-bold transition-all duration-500
                ${activeFilters.includes(option.id) 
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105 md:scale-110' 
                  : 'bg-transparent text-gray-500 border-white/10 hover:border-white/40 hover:text-white'
                }
              `}
            >
              {language === 'es' ? option.label_es : option.label_en}
            </button>
          ))}
        </Editable>
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto flex items-center px-6 md:px-12 gap-8 md:gap-20 snap-x snap-mandatory scrollbar-hide perspective-[1000px] cursor-none pt-32 md:pt-48 pb-20"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {/* Spacer for start */}
        <div className="w-[30vw] shrink-0" />

        {allProjects.length > 0 ? (
          allProjects.map((project, index) => (
            <Editable key={`${project.id}-${index}`} section="projects" element="project" projectId={project.id}>
              <ProjectCard 
                project={project} 
                containerRef={scrollContainerRef} 
                onClick={() => {
                  if (!isDragging) onSelectProject(project);
                }}
              />
            </Editable>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center w-[50vw]">
            <p className="text-white/30 uppercase tracking-[0.3em] text-[10px] italic">
              {language === 'es' ? 'No hay proyectos en esta categoría' : 'No projects in this category'}
            </p>
          </div>
        )}

        {/* Spacer for end */}
        <div className="w-[30vw] shrink-0" />
      </div>
    </div>
  );
};

// Memoized Card component for GPU accelerated animations and reduced re-renders
const ProjectCard: React.FC<{ 
  project: Project, 
  containerRef: React.RefObject<HTMLDivElement>, 
  onClick: () => void 
}> = memo(({ project, containerRef, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  
  const { scrollXProgress } = useScroll({
    target: ref,
    container: containerRef,
    axis: "x",
    offset: ["center end", "center start"]
  });

  // 3D Carousel Effects - Optimized for performance
  const rotateY = useTransform(scrollXProgress, [0, 0.5, 1], [45, 0, -45]);
  const scale = useTransform(scrollXProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);
  const opacity = useTransform(scrollXProgress, [0, 0.5, 1], [0.4, 1, 0.4]);
  const z = useTransform(scrollXProgress, [0, 0.5, 1], [-200, 0, -200]);

  return (
    <div className="snap-center shrink-0 perspective-[1000px] will-change-transform">
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
            alt={language === 'es' ? ((project as any).title_es || project.titleEs) : ((project as any).title_en || project.title)} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <motion.div 
          className="mt-auto text-center"
          style={{ opacity }}
        >
          <h3 className="text-2xl md:text-3xl font-light uppercase tracking-tight mb-2">
            {language === 'es' ? ((project as any).title_es || project.titleEs) : ((project as any).title_en || project.title)}
          </h3>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            {language === 'es' ? ((project as any).category_es || project.categoryEs) : ((project as any).category_en || project.category)}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default HorizontalProjectsGallery;
