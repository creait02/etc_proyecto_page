import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { projects } from '../data/mockData';

const highlightsData = projects.map((project, index) => ({
  id: index + 1,
  name: project.title,
  nameEs: project.titleEs,
  role: project.category,
  roleEs: project.categoryEs,
  image: project.image,
  description: project.description,
  descriptionEs: project.descriptionEs,
}));

export default function Highlights() {
  const { language } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<typeof highlightsData[0] | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const isScrollingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollTop(scrollRef.current.scrollTop);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartY(e.touches[0].pageY - scrollRef.current.offsetTop);
    setScrollTop(scrollRef.current.scrollTop);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const y = e.pageY - scrollRef.current.offsetTop;
    const walk = (y - startY) * 2; // Scroll speed
    scrollRef.current.scrollTop = scrollTop - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const y = e.touches[0].pageY - scrollRef.current.offsetTop;
    const walk = (y - startY) * 2;
    scrollRef.current.scrollTop = scrollTop - walk;
  };

  // Handle horizontal scroll between projects in detail view
  useEffect(() => {
    if (!selectedItem) return;

    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) return;
      
      // If the inner text container is being scrolled, don't switch projects
      // We check if the target is within the scrollable description
      const isInsideScrollable = (e.target as HTMLElement).closest('[data-lenis-prevent]');
      if (isInsideScrollable) {
        const el = isInsideScrollable as HTMLElement;
        const isAtTop = el.scrollTop === 0;
        const isAtBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 1;
        
        // Only allow project switch if scrolling up at top or down at bottom
        if (e.deltaY > 0 && !isAtBottom) return;
        if (e.deltaY < 0 && !isAtTop) return;
      }

      if (Math.abs(e.deltaY) > 30) {
        if (e.deltaY > 0 && currentIndex < highlightsData.length - 1) {
          isScrollingRef.current = true;
          setCurrentIndex(prev => prev + 1);
          setSelectedItem(highlightsData[currentIndex + 1]);
          setTimeout(() => { isScrollingRef.current = false; }, 800);
        } else if (e.deltaY < 0 && currentIndex > 0) {
          isScrollingRef.current = true;
          setCurrentIndex(prev => prev - 1);
          setSelectedItem(highlightsData[currentIndex - 1]);
          setTimeout(() => { isScrollingRef.current = false; }, 800);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [selectedItem, currentIndex]);

  const handleSelect = (item: typeof highlightsData[0], index: number) => {
    setSelectedItem(item);
    setCurrentIndex(index);
  };

  const [touchStartY, setTouchStartY] = useState(0);

  const handleTouchStartDetail = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].pageY);
  };

  const handleTouchEndDetail = (e: React.TouchEvent) => {
    if (isScrollingRef.current || !selectedItem) return;

    const touchEndY = e.changedTouches[0].pageY;
    const deltaY = touchStartY - touchEndY;

    // If the inner text container is being scrolled, don't switch projects
    const isInsideScrollable = (e.target as HTMLElement).closest('[data-lenis-prevent]');
    if (isInsideScrollable) {
      const el = isInsideScrollable as HTMLElement;
      const isAtTop = el.scrollTop === 0;
      const isAtBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 1;
      
      if (deltaY > 0 && !isAtBottom) return;
      if (deltaY < 0 && !isAtTop) return;
    }

    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0 && currentIndex < highlightsData.length - 1) {
        isScrollingRef.current = true;
        setCurrentIndex(prev => prev + 1);
        setSelectedItem(highlightsData[currentIndex + 1]);
        setTimeout(() => { isScrollingRef.current = false; }, 800);
      } else if (deltaY < 0 && currentIndex > 0) {
        isScrollingRef.current = true;
        setCurrentIndex(prev => prev - 1);
        setSelectedItem(highlightsData[currentIndex - 1]);
        setTimeout(() => { isScrollingRef.current = false; }, 800);
      }
    }
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-white overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!selectedItem ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col px-6 md:px-12 lg:px-24 pt-8 md:pt-12 pb-6 md:pb-8 overflow-hidden"
          >
            {/* Header */}
            <div className="mb-6 md:mb-8 w-full max-w-[1300px] mx-auto shrink-0">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase leading-[1.1] whitespace-pre-line text-white">
                {language === 'en' ? 'STORIES\nWE BUILD' : 'HISTORIAS\nQUE CONSTRUIMOS'}
              </h1>
            </div>

            {/* Grid Container for viewport fitting */}
            <div className="w-full max-w-[1300px] mx-auto flex-1 min-h-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 w-full h-full auto-rows-[minmax(0,1fr)]">
                {highlightsData.slice(0, 7).map((item, index) => (
                  <motion.div 
                    key={item.id}
                    layoutId={`card-${item.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: item.id * 0.05 }}
                    onClick={() => handleSelect(item, index)}
                    className="bg-[#151515] w-full h-full rounded-[16px] lg:rounded-[20px] overflow-hidden group hover:border-[#666] transition-colors duration-500 border border-[#333] flex flex-col cursor-pointer shadow-lg"
                  >
                    <div className="flex-1 overflow-hidden relative min-h-[60px]">
                      <motion.img 
                        layoutId={`project-image-${item.id}`}
                        src={(item as any).image_url || item.image} 
                        alt={language === 'en' ? item.name : item.nameEs}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-3 sm:p-4 lg:p-5 shrink-0 flex flex-col bg-[#111]">
                      <h3 className="text-sm sm:text-base lg:text-[17px] font-bold mb-1 lg:mb-1.5 text-white tracking-wide truncate">
                        {language === 'en' ? item.name : item.nameEs}
                      </h3>
                      <p className="text-[#999] font-normal text-[10px] sm:text-xs lg:text-[13px] leading-snug line-clamp-2">
                        {language === 'en' ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key={`detail-${selectedItem.id}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onTouchStart={handleTouchStartDetail}
            onTouchEnd={handleTouchEndDetail}
            className="w-full h-full flex flex-col md:flex-row bg-[#0a0a0a] relative overflow-hidden"
          >
            {/* Back Button - Relocated to Top Left but below the header logo for better UX */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedItem(null);
              }}
              className="absolute top-24 left-6 md:top-32 md:left-12 z-[100] px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl flex items-center gap-3 hover:bg-white/20 transition-all border border-white/20 group cursor-pointer shadow-2xl"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform text-white" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white">
                {language === 'en' ? 'Back' : 'Volver'}
              </span>
            </button>

            {/* Left Side: Main Visual */}
            <div className="w-full md:w-[45%] h-[30vh] md:h-full relative overflow-hidden group shrink-0">
              <motion.img 
                layoutId={`project-image-${selectedItem.id}`}
                src={(selectedItem as any).image_url || selectedItem.image} 
                className="w-full h-full object-cover"
                alt={selectedItem.name}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20" />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-500">
                  <div className="w-0 h-0 border-t-[6px] md:border-t-[8px] border-t-transparent border-l-[12px] md:border-l-[14px] border-l-white border-b-[6px] md:border-b-[8px] border-b-transparent ml-1" />
                </div>
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="flex-1 h-full p-6 md:p-12 lg:p-20 flex flex-col overflow-hidden">
              <div className="max-w-2xl flex flex-col h-full pt-10 md:pt-0">
                {/* Category Tag */}
                <div className="mb-4 md:mb-8">
                  <span className="px-4 py-1.5 bg-gray-800/50 rounded-full text-[9px] md:text-[10px] uppercase tracking-widest text-gray-300 border border-white/5">
                    {language === 'en' ? selectedItem.role : selectedItem.roleEs}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 tracking-tight leading-tight">
                  {language === 'en' ? selectedItem.name : selectedItem.nameEs}
                </h2>

                {/* Subtitle */}
                <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4 md:mb-6 font-medium">
                  LOREM IPSUM
                </h3>

                {/* Description - Scrollable area */}
                <div 
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onTouchEnd={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  data-lenis-prevent
                  className="flex-1 space-y-4 md:space-y-6 text-gray-400 font-light leading-relaxed text-xs md:text-sm overflow-y-auto scrollbar-hide pr-2 mb-6 select-none touch-pan-y"
                >
                  <p>
                    {language === 'en' ? selectedItem.description : selectedItem.descriptionEs}
                  </p>
                  <p>
                    {language === 'en' 
                      ? "Our architects, engineers, and construction professionals work as a single, integrated unit. This cohesion allows us to translate ambitious concepts into built realities, ensuring that every decision — from structural systems to material selection — is aligned with the project's broader vision and long-term durability."
                      : "Nuestros arquitectos, ingenieros y profesionales de la construcción trabajan como una unidad única e integrada. Esta cohesión nos permite traducir conceptos ambiciosos en realidades construidas, asegurando que cada decisión, desde los sistemas estructurales hasta la selección de materiales, esté alineada con la visión más amplia y la durabilidad a largo plazo del proyecto."
                    }
                  </p>
                </div>

                {/* Mini Gallery - Hidden on very small screens to save space, or adjusted */}
                <div className="mt-auto grid grid-cols-2 gap-3 shrink-0 pb-4 md:pb-0">
                  <div className="aspect-video rounded-lg md:rounded-xl overflow-hidden border border-white/5">
                    <img src={selectedItem.image} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="Gallery 1" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-video rounded-lg md:rounded-xl overflow-hidden border border-white/5">
                    <img src={selectedItem.image} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="Gallery 2" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
