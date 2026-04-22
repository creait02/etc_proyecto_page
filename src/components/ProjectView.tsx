import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from 'motion/react';
import { X, ArrowLeft } from 'lucide-react';
import { Project, ProjectImage } from '../data/mockData';
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Editable } from './Editable';

interface ProjectViewProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectView({ project, onClose }: ProjectViewProps) {
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [project]);

  return (
    <AnimatePresence mode="wait">
      {project && (
        <ProjectContent project={project} onClose={onClose} />
      )}
    </AnimatePresence>
  );
}

function ProjectContent({ project, onClose }: { project: Project; onClose: () => void }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const { language, t } = useLanguage();

  const { scrollXProgress } = useScroll({
    container: scrollContainerRef
  });

  const progress = useSpring(scrollXProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Reset scroll position when project changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [project]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        container.scrollLeft += e.deltaY * 3.5;
        e.preventDefault();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
    scrollContainerRef.current.style.scrollSnapType = 'none';
    scrollContainerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    if (!isDragging || !scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.scrollSnapType = 'x mandatory';
    scrollContainerRef.current.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.scrollSnapType = 'x mandatory';
    scrollContainerRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[70] bg-black text-white overflow-hidden flex flex-col"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 md:top-12 md:right-12 z-50 p-3 bg-black/50 rounded-full text-white hover:bg-white hover:text-black transition-colors backdrop-blur-md"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto flex items-center snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {/* SLIDE 1: HERO SECTION */}
        <div className="snap-start shrink-0 w-screen h-screen flex flex-col justify-end items-start px-6 pb-20 md:px-16 md:pb-24 lg:px-24 lg:pb-24 relative overflow-hidden cursor-default">
          <Editable section="projects" element="image" projectId={project.id} className="absolute inset-0 z-0 w-full h-full">
            <motion.img
              layoutId={`project-image-${project.id}`}
              src={(project as any).image_url || project.image}
              alt={language === 'es' ? ((project as any).title_es || project.titleEs) : ((project as any).title_en || project.title)}
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
          </Editable>

          <div className="max-w-4xl z-10 pointer-events-none select-none text-left">
            <Editable section="projects" element="category" projectId={project.id} className="pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center flex-wrap gap-4 mb-4 text-[9px] md:text-[11px] uppercase tracking-[0.2em] text-gray-300 font-medium"
              >
                <span>{language === 'es' ? ((project as any).category_es || project.categoryEs) : ((project as any).category_en || project.category)}</span>
                <span className="w-[1px] h-3 bg-gray-400 hidden md:inline-block"></span>
                <span className="text-gray-400">{t('project.studio')}</span>
              </motion.div>
            </Editable>
            
            <Editable section="projects" element="title" projectId={project.id} className="pointer-events-auto">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-5xl md:text-[5.5rem] font-extralight leading-[1.1] tracking-tight mb-6 text-white drop-shadow-2xl uppercase"
              >
                {language === 'es' ? ((project as any).title_es || project.titleEs) : ((project as any).title_en || project.title)}
              </motion.h1>
            </Editable>
            
            <Editable section="projects" element="description" projectId={project.id} className="pointer-events-auto">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-300 max-w-md leading-relaxed drop-shadow-md text-sm md:text-base font-light"
              >
                {language === 'es' ? ((project as any).description_es || project.descriptionEs) : ((project as any).description_en || project.description)}
              </motion.p>
            </Editable>
          </div>
        </div>

        {/* SLIDE 2: SPLIT SECTION (Media + Text) */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="snap-start shrink-0 w-screen h-screen flex relative overflow-hidden bg-[#0a0a0a] cursor-default">
            {/* Left side: Media (Image/Video) - 45% width */}
            <div className="w-[45%] h-full relative bg-[#e5e5e5] flex items-center justify-center p-12">
               {/* Background image from gallery 0, or just a clean render of it */}
               <motion.div 
                 className="relative w-full h-full"
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: false }}
                 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
               >
                 {project.gallery[0].url.match(/\.(mp4|webm|ogg)$/i) ? (
                   <video src={project.gallery[0].url} autoPlay muted loop className="w-full h-full object-contain" />
                 ) : (
                   <img src={project.gallery[0].url} alt="" className="w-full h-full object-contain" />
                 )}
               </motion.div>
            </div>

            {/* Right side: Text - 55% width */}
            <div className="w-[55%] h-full bg-[#111] flex flex-col justify-center px-16 md:px-24">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-light uppercase tracking-tight mb-8 leading-[1.2] text-white max-w-2xl"
              >
                {language === 'es' ? 'DESIGN BEYOND BOUNDARIES' : 'DESIGN BEYOND BOUNDARIES'}
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-gray-400 text-xs md:text-sm font-light leading-relaxed max-w-xl"
              >
                {language === 'es' ? (project.gallery[0].descriptionEs || (project.gallery[0] as any).description_es || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.') : (project.gallery[0].description || (project.gallery[0] as any).description_en || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')}
              </motion.div>
            </div>
          </div>
        )}

        {/* SLIDE 3: MOSAIC GRID SLIDE (Galería) */}
        <SummaryGridSlide project={project} />
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] md:h-[2px] bg-white/10 z-50">
        <motion.div 
          className="h-full bg-white"
          style={{ scaleX: progress, transformOrigin: "0%" }}
        />
      </div>
    </motion.div>
  );
}

const SummaryGridSlide: React.FC<{ project: Project }> = ({ project }) => {
  // Use up to 5 images for the grid, fallback to repeating if less than 5 but at least 3
  const galleryImages = project.gallery || [];
  const displayImages = [...galleryImages];
  while (displayImages.length < 5 && displayImages.length > 0) {
    displayImages.push(...galleryImages);
  }
  const images = displayImages.slice(0, 5);

  return (
    <div className="snap-start shrink-0 w-screen h-screen bg-[#111] flex flex-col p-4 md:p-8 lg:p-12 gap-4 md:gap-4 overflow-hidden cursor-default">
      {/* Top Row: 2 Columns - 2/3 and 1/3 split */}
      <div className="flex-[1.4] grid grid-cols-3 gap-4 md:gap-4">
        {images.slice(0, 2).map((img, idx) => (
          <motion.div 
            key={`summary-top-${idx}`}
            initial={{ opacity: 0, scale: 1.02, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: idx * 0.1 }}
            className={`relative overflow-hidden rounded-sm group will-change-transform ${idx === 0 ? 'col-span-2' : 'col-span-1'}`}
          >
            <img 
              src={img.url} 
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 will-change-transform" 
              alt="" 
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
          </motion.div>
        ))}
      </div>
      
      {/* Bottom Row: 3 Columns - Supportive base */}
      <div className="flex-1 grid grid-cols-3 gap-4 md:gap-4">
        {images.slice(2, 5).map((img, idx) => (
          <motion.div 
            key={`summary-bottom-${idx}`}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 + idx * 0.1 }}
            className="relative overflow-hidden rounded-sm group will-change-transform"
          >
            <img 
              src={img.url} 
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 will-change-transform" 
              alt="" 
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};


