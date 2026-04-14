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
        container.scrollLeft += e.deltaY * 2.5; 
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
                  alt={language === 'es' ? project.titleEs : project.title}
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
                  <span>{language === 'es' ? project.categoryEs : project.category}</span>
                  <span className="w-[1px] h-3 bg-gray-400 hidden md:inline-block"></span>
                  <span className="text-gray-400">{t('project.studio')}</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-5xl md:text-[5.5rem] font-extralight leading-[1.1] tracking-tight mb-6 text-white drop-shadow-2xl uppercase"
                >
                  {language === 'es' ? project.titleEs : project.title}
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-300 max-w-md leading-relaxed drop-shadow-md text-sm md:text-base font-light"
                >
                  {language === 'es' ? project.descriptionEs : project.description}
                </motion.p>
              </div>
            </div>

            {/* SLIDE 2: INFO SECTION (Split Screen) */}
            <div className="snap-start shrink-0 w-screen h-screen flex flex-col md:flex-row bg-[#0a0a0a] relative overflow-hidden cursor-default">
              <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
                <img 
                  src={(project as any).image_url || project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-20 lg:px-32 bg-[#0a0a0a]">
                <span className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6 block">
                  {language === 'es' ? 'Concepto de Diseño' : 'Design Concept'}
                </span>
                <h2 className="text-4xl md:text-6xl font-light uppercase tracking-tight mb-8 leading-tight">
                  {language === 'es' ? 'Diseño más allá de los límites' : 'Design beyond boundaries'}
                </h2>
                <p className="text-gray-400 text-sm md:text-lg font-light leading-relaxed max-w-xl">
                  {language === 'es' ? project.descriptionEs : project.description}
                  {" "}
                  {language === 'es' 
                    ? "Nuestro enfoque integra la funcionalidad con una estética audaz, creando espacios que inspiran y perduran en el tiempo."
                    : "Our approach integrates functionality with bold aesthetics, creating spaces that inspire and endure over time."}
                </p>
                <div className="mt-12 w-24 h-[1px] bg-white/20" />
              </div>
            </div>

            {/* GALLERY SLIDES (Split Screen Style with Animation) */}
            {project.gallery?.map((img, idx) => (
              <GallerySlide 
                key={`${project.id}-gallery-${idx}`}
                img={img}
                idx={idx}
                containerRef={scrollContainerRef}
                language={language}
              />
            ))}

            {/* Final Spacer */}
            <div className="w-[30vw] shrink-0" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const GallerySlide: React.FC<{ 
  img: ProjectImage, 
  idx: number, 
  containerRef: React.RefObject<HTMLDivElement>,
  language: string
}> = ({ img, idx, containerRef, language }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollXProgress } = useScroll({
    target: ref,
    container: containerRef,
    axis: "x",
    offset: ["start end", "end start"]
  });

  // Animation values based on scroll progress
  const imageScale = useTransform(scrollXProgress, [0, 0.5, 1], [1.2, 1, 1.2]);
  const textX = useTransform(scrollXProgress, [0, 0.5, 1], [idx % 2 === 0 ? 100 : -100, 0, idx % 2 === 0 ? -100 : 100]);
  const opacity = useTransform(scrollXProgress, [0.1, 0.4, 0.6, 0.9], [0, 1, 1, 0]);
  const brightness = useTransform(scrollXProgress, [0, 0.5, 1], [0.5, 1, 0.5]);

  return (
    <motion.div 
      ref={ref}
      style={{ opacity }}
      className="snap-start shrink-0 w-screen h-screen flex flex-col md:flex-row bg-[#0a0a0a] relative overflow-hidden cursor-default"
    >
      {/* Alternate layout: even index image-left, odd index image-right */}
      {idx % 2 === 0 ? (
        <>
          <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
            <motion.img 
              src={img.url} 
              alt={img.description} 
              style={{ scale: imageScale, filter: useTransform(brightness, b => `brightness(${b})`) }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
          <motion.div 
            style={{ x: textX }}
            className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-20 lg:px-32 bg-[#0a0a0a]"
          >
            <span className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6 block">
              {language === 'es' ? 'Detalle del Proyecto' : 'Project Detail'}
            </span>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl md:text-5xl font-light uppercase tracking-tight mb-8 leading-tight"
            >
              {language === 'es' ? 'Excelencia en cada detalle' : 'Excellence in every detail'}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-gray-400 text-sm md:text-lg font-light leading-relaxed max-w-xl"
            >
              {language === 'es' ? img.descriptionEs : img.description}
            </motion.p>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-12 w-24 h-[1px] bg-white/20 origin-left" 
            />
          </motion.div>
        </>
      ) : (
        <>
          <motion.div 
            style={{ x: textX }}
            className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-20 lg:px-32 bg-[#0a0a0a] order-2 md:order-1"
          >
            <span className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-6 block">
              {language === 'es' ? 'Perspectiva' : 'Perspective'}
            </span>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl md:text-5xl font-light uppercase tracking-tight mb-8 leading-tight"
            >
              {language === 'es' ? 'Visión Arquitectónica' : 'Architectural Vision'}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-gray-400 text-sm md:text-lg font-light leading-relaxed max-w-xl"
            >
              {language === 'es' ? img.descriptionEs : img.description}
            </motion.p>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-12 w-24 h-[1px] bg-white/20 origin-left" 
            />
          </motion.div>
          <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden order-1 md:order-2">
            <motion.img 
              src={img.url} 
              alt={img.description} 
              style={{ scale: imageScale, filter: useTransform(brightness, b => `brightness(${b})`) }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        </>
      )}
    </motion.div>
  );
}
