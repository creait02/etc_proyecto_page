import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { projects, Project } from '../data/mockData';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteData } from '../contexts/SiteContext';
import Editable from './Editable';

interface HomeHorizontalLayoutProps {
  onSelectProject: (project: Project) => void;
}

export default function HomeHorizontalLayout({ onSelectProject }: HomeHorizontalLayoutProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const { settings } = useSiteData();
  
  // Get live settings or fallback
  const title = language === 'es' ? (settings?.home_title_es || t('home.designMatters')) : (settings?.home_title_en || t('home.designMatters'));
  const pretitle = language === 'es' ? (settings?.home_pretitle_es || `${t('home.studio')} | ${t('project.studio')}`) : (settings?.home_pretitle_en || `${t('home.studio')} | ${t('project.studio')}`);
  const subtitle = language === 'es' ? (settings?.home_subtitle_es || 'ETC PROYECTO es un estudio de arquitectura y diseño interior.') : (settings?.home_subtitle_en || 'ETC PROYECTO is an award winning architectural and interior design studio based in Caracas.');
  const bgImage = settings?.home_bg_image; // If empty, we use the video

  // Map vertical scroll (wheel) to horizontal scroll for the main page layout
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isScrolling = false;

    const handleWheel = (e: WheelEvent) => {
      // If purely vertical scroll
      if (e.deltaY !== 0) {
        e.preventDefault();
        
        if (isScrolling) return;
        
        // Ignore very small trackpad movements to prevent accidental triggers
        if (Math.abs(e.deltaY) < 10) return;

        isScrolling = true;
        
        if (e.deltaY > 0) {
          // Scroll Right (Down)
          container.scrollTo({ left: container.clientWidth, behavior: 'smooth' });
        } else {
          // Scroll Left (Up)
          container.scrollTo({ left: 0, behavior: 'smooth' });
        }

        // Cooldown to prevent multiple scrolls from a single swipe/wheel spin
        setTimeout(() => {
          isScrolling = false;
        }, 800);
      }
    };

    // Attach to container to capture events over it
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Main Horizontal Scroll Container (Only 2 Slides: Hero + Projects) */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto flex items-center gap-0 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* SLIDE 1: HERO SECTION */}
        <div className="snap-start shrink-0 w-screen h-screen flex flex-col justify-end items-start px-6 pb-20 md:px-16 md:pb-24 lg:px-24 lg:pb-24 relative overflow-hidden">
          {/* Background - Video or Image */}
          <Editable section="home" element="background" className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
            {bgImage ? (
              <img src={bgImage} className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" alt="Background" />
            ) : (
              <iframe
                src="https://www.youtube.com/embed/o0ylWuQEYPE?autoplay=1&mute=1&controls=0&loop=1&playlist=o0ylWuQEYPE&playsinline=1&rel=0&modestbranding=1"
                className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </Editable>

          <div className="max-w-4xl z-10 pointer-events-none select-none text-left">
            <Editable section="home" element="pretitle" className="pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center flex-wrap gap-4 mb-4 text-[9px] md:text-[11px] uppercase tracking-[0.2em] text-gray-300 font-medium"
              >
                {pretitle}
              </motion.div>
            </Editable>
            
            <Editable section="home" element="title" className="pointer-events-auto">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-5xl md:text-[5.5rem] font-extralight leading-[1.1] tracking-tight mb-6 text-white drop-shadow-2xl uppercase whitespace-pre-line"
              >
                {title}
              </motion.h1>
            </Editable>
            
            <Editable section="home" element="subtitle" className="pointer-events-auto">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-gray-300 max-w-md leading-relaxed drop-shadow-md text-sm md:text-base font-light whitespace-pre-line"
              >
                {subtitle}
              </motion.p>
            </Editable>
          </div>
        </div>

        {/* SLIDE 2: PROJECTS SLIDESHOW CONTAINER */}
        <div className="snap-start shrink-0 w-screen h-screen bg-[#050505] relative flex items-center justify-center overflow-hidden">
          <ProjectsSlideshow onSelectProject={onSelectProject} />
        </div>
      </div>
    </div>
  );
}

function ProjectsSlideshow({ onSelectProject }: { onSelectProject: (p: Project) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language, t } = useLanguage();
  const { projects: liveProjects } = useSiteData();
  const duration = 5000; // 5 seconds per slide
  
  // Use live projects if available, otherwise fallback to mock data
  const displayProjects = liveProjects && liveProjects.length > 0 ? liveProjects : projects;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayProjects.length);
    }, duration);

    return () => clearInterval(timer);
  }, [displayProjects.length]);

  const currentProject = displayProjects[currentIndex];

  if (!currentProject) return null;

  return (
    <div className="w-full h-full relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentProject.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <motion.img 
              layoutId={`project-image-${currentProject.id}`}
              src={currentProject.image_url || currentProject.image} 
              alt={language === 'es' ? (currentProject.title_es || currentProject.titleEs) : (currentProject.title_en || currentProject.title)} 
              className="w-full h-full object-cover"
              initial={{ scale: 1 }}
              animate={{ scale: 1.08 }}
              transition={{ duration: 6, ease: "linear" }}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 w-full p-12 md:p-24 flex flex-col md:flex-row justify-between items-end z-20">
            <Editable section="projects" element="project" projectId={currentProject.id} className="max-w-2xl">
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4"
              >
                {language === 'es' ? (currentProject.category_es || currentProject.categoryEs) : (currentProject.category_en || currentProject.category)}
              </motion.p>
              <motion.h2 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-7xl font-light uppercase tracking-tight mb-8"
              >
                {language === 'es' ? (currentProject.title_es || currentProject.titleEs) : (currentProject.title_en || currentProject.title)}
              </motion.h2>
              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => onSelectProject(currentProject as any)}
                className="group flex items-center gap-3 px-8 py-3 border border-white/30 rounded-full text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm"
              >
                {t('home.viewProject')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Editable>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-30">
        <motion.div 
          key={currentIndex} // Reset animation on slide change
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className="h-full bg-white"
        />
      </div>
    </div>
  );
}
