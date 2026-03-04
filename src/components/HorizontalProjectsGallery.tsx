import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { projects } from '../data/mockData';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface HorizontalProjectsGalleryProps {
  onClose: () => void;
}

export default function HorizontalProjectsGallery({ onClose }: HorizontalProjectsGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Horizontal Scroll Logic
  const { scrollXProgress } = useScroll({
    container: scrollContainerRef,
  });

  const scaleX = useSpring(scrollXProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-[#111] text-white overflow-hidden flex flex-col"
    >
      {/* Header / Navigation */}
      <div className="flex justify-between items-center p-8 md:p-12 z-20">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-gray-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <div className="text-sm uppercase tracking-widest text-gray-500 border-l border-gray-700 pl-4">
          Services & Projects
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto flex items-center px-8 md:px-12 gap-8 md:gap-16 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Spacer for start */}
        <div className="w-[5vw] shrink-0" />

        {projects.map((project, index) => (
          <div 
            key={project.id} 
            className="snap-center shrink-0 w-[80vw] md:w-[60vw] lg:w-[40vw] h-[60vh] flex flex-col group cursor-pointer"
          >
            <div className="relative w-full h-full overflow-hidden bg-gray-900 mb-8">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              />
            </div>
            
            <div className="mt-auto">
              <h3 className="text-2xl md:text-3xl font-light uppercase tracking-tight mb-2">
                {project.title}
              </h3>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                {project.category}
              </p>
            </div>
          </div>
        ))}

        {/* Spacer for end */}
        <div className="w-[5vw] shrink-0" />
      </div>

      {/* Progress Bar */}
      <div className="p-8 md:p-12 w-full max-w-screen-xl mx-auto">
        <div className="w-full h-[1px] bg-gray-800 relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-white"
            style={{ scaleX, transformOrigin: "left" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
