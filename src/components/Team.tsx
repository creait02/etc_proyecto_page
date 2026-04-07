import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Highlights from './Highlights';

export default function Team() {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) return;

      // Detect vertical scroll and map to horizontal transition
      if (Math.abs(e.deltaY) > 20) {
        if (e.deltaY > 0 && step === 1) {
          // Scroll Down -> Go to Step 2
          isScrollingRef.current = true;
          setStep(2);
          setTimeout(() => { isScrollingRef.current = false; }, 1000);
        } else if (e.deltaY < 0 && step === 2) {
          // Scroll Up -> Go to Step 1
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
    <div className="w-full h-full bg-black text-white overflow-hidden relative">
      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full flex flex-col md:flex-row items-center justify-center px-6 md:px-24 gap-12 md:gap-0"
          >
            {/* Left Side */}
            <div className="flex-1 flex flex-col justify-center items-start">
              <div className="flex gap-4 mb-12">
                {['Engineer', 'Architecture', 'Design'].map((tag) => (
                  <span key={tag} className="px-4 py-1 border border-white/20 rounded-full text-[10px] uppercase tracking-widest text-gray-400">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight uppercase max-w-xl">
                Estudio<br />Transformación<br />Construcción
              </h1>
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-[1px] h-1/2 bg-white/10 mx-12 lg:mx-24" />

            {/* Right Side */}
            <div className="flex-1 flex flex-col justify-center items-start max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold uppercase mb-8 tracking-tight">
                LOREM IPSUM
              </h2>
              <div className="space-y-6 text-gray-400 font-light leading-relaxed text-sm md:text-base">
                <p>
                  Our team brings together industry-leading architects, engineers, and construction specialists to deliver complex, large-scale projects with uncompromising quality. Every structure we create reflects a balance between technical excellence, refined design, and long-term value.
                </p>
                <p>
                  Our architects, engineers, and construction professionals work as a single, integrated unit. This cohesion allows us to translate ambitious concepts into built realities, ensuring that every decision — from structural systems to material selection — is aligned with the project's broader vision and long-term durability.
                </p>
              </div>
              
              <div className="mt-12 flex items-center gap-4 text-[9px] uppercase tracking-[0.3em] text-gray-500">
                <div className="w-8 h-[1px] bg-gray-500" />
                <span>{language === 'en' ? 'Scroll down to meet the team' : 'Baja con el scroll para conocer al equipo'}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
             <Highlights />
             {/* Hint to scroll back */}
             <div className="absolute top-24 left-12 z-[60] flex items-center gap-4 text-[9px] uppercase tracking-[0.3em] text-white/30 pointer-events-none">
                <div className="w-8 h-[1px] bg-white/30" />
                <span>{language === 'en' ? 'Scroll up to go back' : 'Sube con el scroll para volver'}</span>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
