import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
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
  const [step, setStep] = useState(1);
  const [hoveredId, setHoveredId] = useState<number | null>(1);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const isScrollingRef = useRef(false);

  const categories = [
    { id: 'All', en: 'All', es: 'Todos' },
    { id: 'Eventos', en: 'Events', es: 'Eventos' },
    { id: 'eco', en: 'Eco', es: 'eco' },
    { id: 'Habitado', en: 'Inhabited', es: 'Habitado' }
  ];

  // Map real categories to the filter categories
  const getMappedCategory = (role: string) => {
    if (role === 'Industrial' || role === 'Architecture') return 'Eventos';
    if (role === 'Commercial') return 'eco';
    if (role === 'Residential') return 'Habitado';
    return 'Habitado';
  };

  const filteredHighlights = highlightsData.filter(item => {
    if (activeFilter === 'All') return true;
    return getMappedCategory(item.role) === activeFilter;
  });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) return;

      // Increased threshold to avoid accidental transitions
      if (Math.abs(e.deltaY) > 50) {
        if (e.deltaY > 0 && step === 1) {
          isScrollingRef.current = true;
          setStep(2);
          setTimeout(() => { isScrollingRef.current = false; }, 1000);
        } else if (e.deltaY < 0 && step === 2) {
          isScrollingRef.current = true;
          setStep(1);
          setTimeout(() => { isScrollingRef.current = false; }, 1000);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [step]);

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-white overflow-hidden relative">
      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full flex flex-col items-center px-6 md:px-24 py-20 overflow-y-auto scrollbar-hide"
          >
            {/* Header */}
            <div className="text-center mb-16 pt-10">
              <h1 className="text-4xl md:text-7xl font-bold tracking-[0.1em] uppercase mb-12">
                {language === 'en' ? 'STORIES WE BUILD' : 'HISTORIAS QUE CONSTRUIMOS'}
              </h1>
              
              {/* Categories / Filters */}
              <div className="flex justify-center gap-4 md:gap-12 flex-wrap">
                {categories.map((cat) => (
                  <button 
                    key={cat.id} 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFilter(cat.id);
                    }}
                    className="group relative px-6 py-3 cursor-pointer z-20 transition-all duration-300"
                  >
                    {/* Top Line Indicator */}
                    <motion.div 
                      initial={false}
                      animate={{ 
                        opacity: activeFilter === cat.id ? 1 : 0,
                        width: activeFilter === cat.id ? '2rem' : '0rem'
                      }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 h-[2px] bg-cyan-400" 
                    />
                    
                    {/* Background Pill (Active State) */}
                    {activeFilter === cat.id && (
                      <motion.div 
                        layoutId="activeFilterBg"
                        className="absolute inset-0 bg-gray-800/80 rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    <span className={`text-sm md:text-xl font-light tracking-widest transition-colors duration-300 ${activeFilter === cat.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                      {language === 'en' ? cat.en : cat.es}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full pb-20">
              <AnimatePresence mode="popLayout">
                {filteredHighlights.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-[#151515] rounded-3xl overflow-hidden group hover:bg-[#1a1a1a] transition-colors duration-500 border border-white/5"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={language === 'en' ? item.name : item.nameEs}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-medium mb-4">
                        {language === 'en' ? item.name : item.nameEs}
                      </h3>
                      <p className="text-gray-400 font-light text-sm leading-relaxed mb-8 line-clamp-3">
                        {language === 'en' ? item.description : item.descriptionEs}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="px-4 py-1.5 bg-gray-800/50 rounded-full text-[10px] uppercase tracking-widest text-gray-400">
                          {getMappedCategory(item.role)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Scroll Hint */}
            <div className="mt-16 flex flex-col items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500 animate-bounce">
              <span>{language === 'en' ? 'Scroll down' : 'Baja para ver más'}</span>
              <div className="w-[1px] h-8 bg-gray-500" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full flex flex-row items-stretch overflow-hidden relative"
          >
            {highlightsData.map((item) => (
              <motion.div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                layout
                initial={false}
                animate={{
                  flex: hoveredId === item.id ? 4 : 1,
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="relative h-full cursor-none overflow-hidden group border-r border-white/5 last:border-r-0"
              >
                {/* Image */}
                <motion.div 
                  className="absolute inset-0 w-full h-full"
                  animate={{
                    filter: hoveredId === item.id ? 'grayscale(0%)' : 'grayscale(100%)',
                    scale: hoveredId === item.id ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <img 
                    src={item.image} 
                    alt={language === 'en' ? item.name : item.nameEs}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${hoveredId === item.id ? 'opacity-0' : 'opacity-40'}`} />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>

                {/* Content */}
                <AnimatePresence>
                  {hoveredId === item.id && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="absolute bottom-10 left-10 z-10 pointer-events-none"
                    >
                      <h3 className="text-2xl md:text-4xl font-medium text-white mb-1">
                        {language === 'en' ? item.name : item.nameEs}
                      </h3>
                      <p className="text-sm md:text-lg text-gray-300 font-light">
                        {language === 'en' ? item.role : item.roleEs}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Vertical Name */}
                <AnimatePresence>
                  {hoveredId !== item.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <span className="rotate-90 whitespace-nowrap text-[10px] tracking-[0.4em] uppercase text-white/30 font-medium">
                        {language === 'en' ? item.name : item.nameEs}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Help Icon */}
            <div className="absolute bottom-8 right-8 z-50">
              <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-shrink">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Exit Hint */}
            <div className="absolute top-8 right-8 z-50 pointer-events-none">
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/20">
                {language === 'en' ? 'Scroll up to go back' : 'Sube para volver'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
