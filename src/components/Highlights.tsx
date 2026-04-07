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
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) return;

      if (Math.abs(e.deltaY) > 20) {
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
            className="w-full h-full flex flex-col items-center justify-center px-6 md:px-24 py-20 overflow-y-auto scrollbar-hide"
          >
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-7xl font-bold tracking-[0.1em] uppercase mb-12">
                {language === 'en' ? 'STORIES WE BUILD' : 'HISTORIAS QUE CONSTRUIMOS'}
              </h1>
              
              {/* Categories */}
              <div className="flex justify-center gap-12 md:gap-24">
                {['Eventos', 'eco', 'Habitado'].map((cat) => (
                  <div key={cat} className="group cursor-pointer">
                    <div className="w-8 h-[2px] bg-cyan-400 mb-2 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-lg md:text-2xl font-light tracking-widest text-gray-400 group-hover:text-white transition-colors">
                      {cat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full">
              {highlightsData.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-[#151515] rounded-3xl overflow-hidden group hover:bg-[#1a1a1a] transition-colors duration-500">
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
                    <p className="text-gray-400 font-light text-sm leading-relaxed mb-8 line-clamp-4">
                      {language === 'en' ? item.description : item.descriptionEs}
                    </p>
                    <button className="px-6 py-2 bg-gray-700/50 rounded-full text-xs uppercase tracking-widest text-gray-300 group-hover:bg-cyan-900/30 group-hover:text-cyan-400 transition-all">
                      {item.roleEs}
                    </button>
                  </div>
                </div>
              ))}
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
