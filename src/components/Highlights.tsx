import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { HelpCircle } from 'lucide-react';

import { projects } from '../data/mockData';

const highlightsData = projects.map((project, index) => ({
  id: index + 1,
  name: project.title,
  nameEs: project.titleEs,
  role: project.category,
  roleEs: project.categoryEs,
  image: project.image,
}));

export default function Highlights() {
  const { language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<number | null>(1);

  return (
    <div className="w-full h-full bg-black flex flex-row items-stretch overflow-hidden relative">
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
            {/* Overlay */}
            <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${hoveredId === item.id ? 'opacity-0' : 'opacity-40'}`} />
            
            {/* Gradient for text readability */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>

          {/* Content (Bottom Left) */}
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

          {/* Vertical Name (When collapsed) */}
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

      {/* Help Icon (Bottom Right) */}
      <div className="absolute bottom-8 right-8 z-50">
        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-shrink">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Exit Hint */}
      <div className="absolute top-8 right-8 z-50 pointer-events-none">
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/20">
          {language === 'en' ? 'Click logo to exit' : 'Click en logo para salir'}
        </span>
      </div>
    </div>
  );
}
