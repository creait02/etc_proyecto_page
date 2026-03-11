import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from 'motion/react';
import { X, ArrowLeft } from 'lucide-react';
import { Project, ProjectImage } from '../data/mockData';
import { useEffect, useRef, useState } from 'react';
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
            className="flex-1 overflow-x-auto flex items-center gap-4 md:gap-8 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing"
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
                  src={project.image}
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

            {/* Spacer between Hero and Gallery to allow centering */}
            <div className="w-[10vw] shrink-0" />

            {/* SLIDE 2+: GALLERY */}
            {project.gallery?.map((img, index) => (
              <GalleryCard 
                key={index}
                image={img}
                containerRef={scrollContainerRef}
                onClick={() => {
                  if (!isDragging) setSelectedImage(img);
                }}
              />
            ))}

            {/* Spacer for end */}
            <div className="w-[30vw] shrink-0" />
          </div>

          {/* 3D Image Overlay */}
          <AnimatePresence>
            {selectedImage && (
              <ImageOverlay image={selectedImage} onClose={() => setSelectedImage(null)} />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GalleryCard({ image, containerRef, onClick }: { image: ProjectImage, containerRef: React.RefObject<HTMLDivElement>, onClick: () => void }) {
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
    <div className="snap-center shrink-0 perspective-[1000px] py-24">
      <motion.div 
        ref={ref}
        style={{ 
          rotateY, 
          scale, 
          opacity,
          z,
          transformStyle: "preserve-3d"
        }}
        className="w-[70vw] md:w-[50vw] lg:w-[40vw] h-[50vh] md:h-[60vh] flex flex-col group cursor-pointer"
        onClick={onClick}
      >
        <div className="relative w-full h-full overflow-hidden bg-gray-900 rounded-sm shadow-2xl">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
          <motion.img 
            src={image.url} 
            alt="Gallery image" 
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>
      </motion.div>
    </div>
  );
}

function ImageOverlay({ image, onClose }: { image: ProjectImage, onClose: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  const { language, t } = useLanguage();

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 perspective-1000"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 left-6 md:top-12 md:left-12 z-50 p-3 bg-white/10 rounded-full text-white hover:bg-white hover:text-black transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-xs uppercase tracking-widest hidden md:inline-block pr-2">{t('project.back')}</span>
      </button>

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ 
          rotateX, 
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative w-full max-w-5xl aspect-video rounded-xl shadow-2xl"
      >
        <img 
          src={image.url} 
          alt="Enlarged view" 
          className="w-full h-full object-cover rounded-xl"
        />
        
        {/* Floating Text Card inside 3D container */}
        <div 
          style={{ transform: "translateZ(50px)" }}
          className="absolute bottom-6 left-6 md:bottom-12 md:left-12 bg-black/60 backdrop-blur-md p-6 md:p-8 max-w-md rounded-lg border border-white/10"
        >
          <p className="text-white font-light text-sm md:text-base leading-relaxed">
            {language === 'es' ? image.descriptionEs : image.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
