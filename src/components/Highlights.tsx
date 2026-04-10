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
  const [selectedItem, setSelectedItem] = useState<typeof highlightsData[0] | null>(null);

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-white overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!selectedItem ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-start px-6 md:px-16 lg:px-24 py-12 md:py-16"
          >
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase leading-[0.9] whitespace-pre-line">
                {language === 'en' ? 'STORIES\nWE BUILD' : 'HISTORIAS\nQUE CONSTRUIMOS'}
              </h1>
            </div>

            {/* Grid Container - Fills remaining space */}
            <div className="flex-1 w-full min-h-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-rows-2 gap-4 h-full">
                {highlightsData.slice(0, 8).map((item) => (
                  <motion.div 
                    key={item.id}
                    layoutId={`card-${item.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: item.id * 0.05 }}
                    onClick={() => setSelectedItem(item)}
                    className="bg-[#151515] rounded-2xl overflow-hidden group hover:bg-[#1a1a1a] transition-colors duration-500 border border-white/5 flex flex-col h-full cursor-pointer"
                  >
                    <div className="flex-1 overflow-hidden relative">
                      <img 
                        src={item.image} 
                        alt={language === 'en' ? item.name : item.nameEs}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-4 shrink-0">
                      <h3 className="text-lg font-medium mb-1 truncate">
                        {language === 'en' ? item.name : item.nameEs}
                      </h3>
                      <p className="text-gray-500 font-light text-[10px] leading-relaxed line-clamp-1">
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
            key="detail"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full flex flex-col md:flex-row bg-[#0a0a0a] relative overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-8 right-8 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>

            {/* Left Side: Main Visual */}
            <div className="w-full md:w-[45%] h-[40vh] md:h-full relative overflow-hidden group shrink-0">
              <img 
                src={selectedItem.image} 
                className="w-full h-full object-cover"
                alt={selectedItem.name}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20" />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-500">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                </div>
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="flex-1 h-full p-8 md:p-12 lg:p-20 flex flex-col justify-between overflow-hidden">
              <div className="max-w-2xl flex flex-col h-full">
                {/* Category Tag */}
                <div className="mb-8">
                  <span className="px-5 py-1.5 bg-gray-800/50 rounded-full text-[10px] uppercase tracking-widest text-gray-300 border border-white/5">
                    {language === 'en' ? selectedItem.role : selectedItem.roleEs}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight leading-tight">
                  {language === 'en' ? selectedItem.name : selectedItem.nameEs}
                </h2>

                {/* Subtitle */}
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-6 font-medium">
                  LOREM IPSUM
                </h3>

                {/* Description - Scrollable if needed but contained */}
                <div className="space-y-6 text-gray-400 font-light leading-relaxed text-xs md:text-sm overflow-y-auto scrollbar-hide pr-4 mb-8">
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

                {/* Mini Gallery - Fixed at bottom */}
                <div className="mt-auto grid grid-cols-2 gap-4 shrink-0">
                  <div className="aspect-video rounded-xl overflow-hidden border border-white/5">
                    <img src={selectedItem.image} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="Gallery 1" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-video rounded-xl overflow-hidden border border-white/5">
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
