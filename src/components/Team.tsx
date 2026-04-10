import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const teamMembers = [
  { id: 1, name: 'Juan Montilla', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop' },
  { id: 2, name: 'Andrés García', role: 'Lead Architect', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop' },
  { id: 3, name: 'Valentina Soto', role: 'Interior Designer', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop' },
  { id: 4, name: 'Ricardo Méndez', role: 'Structural Engineer', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop' },
  { id: 5, name: 'Camila Rivas', role: 'Project Manager', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000&auto=format&fit=crop' },
  { id: 6, name: 'Mateo López', role: 'BIM Coordinator', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop' },
  { id: 7, name: 'Sofía Herrera', role: 'Sustainability Expert', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop' },
  { id: 8, name: 'Daniel Vargas', role: 'Site Supervisor', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop' },
];

export default function Team() {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [expandedMemberId, setExpandedMemberId] = useState<number | null>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current || expandedMemberId !== null) return;

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
  }, [step, expandedMemberId]);

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
            className="w-full h-full flex flex-col md:flex-row"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 200 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  flex: expandedMemberId === null ? 1 : (expandedMemberId === member.id ? 2.5 : 0.6)
                }}
                transition={{ 
                  y: { duration: 0.8, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] },
                  opacity: { duration: 0.8, delay: index * 0.05 },
                  flex: { duration: 0.35, ease: [0.76, 0, 0.24, 1] } // Aggressive "expo-like" easing
                }}
                onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                className="relative group overflow-hidden border-b md:border-b-0 md:border-r border-white/10 last:border-b-0 last:border-r-0 cursor-pointer transition-[flex] duration-350 ease-[0.76,0,0.24,1] min-h-0"
              >
                <img 
                  src={member.image} 
                  alt={member.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${expandedMemberId === member.id ? 'grayscale-0 scale-100' : 'grayscale group-hover:grayscale-0 scale-110 group-hover:scale-105'}`}
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${expandedMemberId === member.id ? 'opacity-60' : 'opacity-80 group-hover:opacity-40'}`} />
                
                {/* Name & Role Container - Always Visible */}
                <div className={`absolute bottom-6 md:bottom-12 left-0 right-0 md:left-auto md:right-auto md:rotate-[-90deg] md:origin-bottom-left md:left-12 px-6 md:px-0 text-center md:text-left transition-all duration-500 z-10 ${expandedMemberId === member.id ? 'translate-y-0 scale-110' : 'translate-y-0 opacity-100'}`}>
                  <h3 className="text-base md:text-2xl font-black uppercase tracking-tighter mb-1 whitespace-nowrap text-white drop-shadow-2xl">
                    {member.name}
                  </h3>
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-300 font-bold whitespace-nowrap drop-shadow-lg">
                    {member.role}
                  </p>
                </div>

                {/* Aggressive Overlay on Hover/Expand */}
                <div className={`absolute inset-0 border-4 border-white/0 transition-all duration-300 ${expandedMemberId === member.id ? 'border-white/20' : 'group-hover:border-white/10'}`} />
              </motion.div>
            ))}

            {/* Hint to scroll back */}
            <div className={`absolute top-24 left-6 md:left-12 z-[60] flex items-center gap-4 text-[9px] uppercase tracking-[0.3em] text-white/50 pointer-events-none transition-opacity duration-500 ${expandedMemberId !== null ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-8 h-[1px] bg-white/50" />
              <span>{language === 'en' ? 'Scroll up to go back' : 'Sube con el scroll para volver'}</span>
            </div>

            {/* Close Expanded View Button */}
            {expandedMemberId !== null && (
              <button 
                onClick={() => setExpandedMemberId(null)}
                className="absolute top-24 left-6 md:left-12 z-[70] px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all"
              >
                {language === 'en' ? 'Close' : 'Cerrar'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
