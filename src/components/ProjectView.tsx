import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from 'motion/react';
import { X, ArrowLeft } from 'lucide-react';
import { Project, ProjectImage } from '../data/mockData';
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProjectViewProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectView({ project, onClose }: ProjectViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const { language, t } = useLanguage();

  // Reset scroll position when project changes
  useEffect(() => {
    if (project && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [project]);

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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !project) return;

    const handleWheel = (e: WheelEvent) => {
      if (selectedImage) return; // Don't scroll horizontally if overlay is open
      if (e.deltaY !== 0) {
        container.scrollLeft += e.deltaY * 3.5; // Increased speed for better reach
        e.preventDefault();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [project, selectedImage]);

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

  return (
    <AnimatePresence>
      {project && (
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
              <div className="absolute inset-0 z-0">
                <motion.img
                  layoutId={`project-image-${project.id}`}
                  src={(project as any).image_url || project.image}
                  alt={language === 'es' ? ((project as any).title_es || project.titleEs) : ((project as any).title_en || project.title)}
                  className="w-full h-full object-cover opacity-60 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
              </div>

              <div className="max-w-4xl z-10 pointer-events-none select-none text-left">
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
                
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-5xl md:text-[5.5rem] font-extralight leading-[1.1] tracking-tight mb-6 text-white drop-shadow-2xl uppercase"
                >
                  {language === 'es' ? ((project as any).title_es || project.titleEs) : ((project as any).title_en || project.title)}
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-300 max-w-md leading-relaxed drop-shadow-md text-sm md:text-base font-light"
                >
                  {language === 'es' ? ((project as any).description_es || project.descriptionEs) : ((project as any).description_en || project.description)}
                </motion.p>
              </div>
            </div>

            {/* SLIDE 2: INFO SECTION (Split Screen - Text Right, Image Left) */}
            <div className="snap-start shrink-0 w-screen h-screen flex flex-col md:flex-row bg-[#0a0a0a] relative overflow-hidden cursor-default">
              <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
                <img 
                  src={project.gallery?.[0]?.url || (project as any).image_url || project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-20 lg:px-32 bg-black">
                <span className="text-[10px] uppercase tracking-[0.4em] text-gray-500 mb-6 block font-medium">
                  {language === 'es' ? 'Detalle del Proyecto' : 'Project Detail'}
                </span>
                <h2 className="text-4xl md:text-7xl font-extralight uppercase tracking-tight mb-8 leading-[1.1]">
                  {language === 'es' ? 'Excelencia en cada detalle' : 'Excellence in every detail'}
                </h2>
                <div className="text-gray-400 text-sm md:text-lg font-light leading-relaxed max-w-xl">
                  {project.gallery?.[0] ? (language === 'es' ? (project.gallery[0].descriptionEs || (project.gallery[0] as any).description_es) : (project.gallery[0].description || (project.gallery[0] as any).description_en)) : (language === 'es' ? ((project as any).description_es || project.descriptionEs) : ((project as any).description_en || project.description))}
                </div>
                <div className="mt-12 w-24 h-[1px] bg-white/20" />
              </div>
            </div>

            {/* FINAL SUMMARY GRID SLIDE (Galería) */}
            {project.gallery && project.gallery.length > 0 && (
              <SummaryGridSlide project={project} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
    <div className="snap-start shrink-0 w-screen h-screen bg-[#050505] flex flex-col p-4 md:p-8 lg:p-12 gap-4 md:gap-4 overflow-hidden">
      {/* Top Row: 2 Columns - More dominant */}
      <div className="flex-[1.4] grid grid-cols-2 gap-4 md:gap-4">
        {images.slice(0, 2).map((img, idx) => (
          <motion.div 
            key={`summary-top-${idx}`}
            initial={{ opacity: 0, scale: 1.1, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: idx * 0.2 }}
            className="relative overflow-hidden rounded-sm group"
          >
            <motion.img 
              src={img.url} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              alt="" 
              whileHover={{ scale: 1.1 }}
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
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 + idx * 0.15 }}
            className="relative overflow-hidden rounded-sm group"
          >
            <motion.img 
              src={img.url} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              alt="" 
              whileHover={{ scale: 1.1 }}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};


