import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteData } from '../contexts/SiteContext';
import Editable from './Editable';

import { fallbackTeamMembers } from '../constants';

export default function Team() {
  const { language } = useLanguage();
  const { settings, teamMembers: liveTeamMembers } = useSiteData();
  const [step, setStep] = useState(1);
  const [expandedMemberId, setExpandedMemberId] = useState<number | string | null>(null);
  const isScrollingRef = useRef(false);

  const teamMembers = liveTeamMembers && liveTeamMembers.length > 0 ? liveTeamMembers : fallbackTeamMembers;

  // Get live settings or fallback
  const title = language === 'es' ? (settings?.team_title_es || 'Estudio\nTransformación\nConstrucción') : (settings?.team_title_en || 'Studio\nTransformation\nConstruction');
  const subtitle = language === 'es' ? (settings?.team_subtitle_es || 'LOREM IPSUM') : (settings?.team_subtitle_en || 'LOREM IPSUM');
  const description = language === 'es' ? (settings?.team_description_es || 'Our team brings together industry-leading architects, engineers, and construction specialists to deliver complex, large-scale projects with uncompromising quality.') : (settings?.team_description_en || 'Our team brings together industry-leading architects, engineers, and construction specialists to deliver complex, large-scale projects with uncompromising quality.');
  const tagsStr = language === 'es' ? (settings?.team_tags_es || 'Ingeniería, Arquitectura, Diseño') : (settings?.team_tags_en || 'Engineering, Architecture, Design');
  const tags = tagsStr.split(',').map((t: string) => t.trim());

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
              <Editable section="team" element="tags">
                <div className="flex gap-4 mb-12">
                  {tags.map((tag: string) => (
                    <span key={tag} className="px-4 py-1 border border-white/20 rounded-full text-[10px] uppercase tracking-widest text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </Editable>
              <Editable section="team" element="title">
                <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight uppercase max-w-xl whitespace-pre-line">
                  {title}
                </h1>
              </Editable>
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-[1px] h-1/2 bg-white/10 mx-12 lg:mx-24" />

            {/* Right Side */}
            <div className="flex-1 flex flex-col justify-center items-start max-w-xl">
              <Editable section="team" element="subtitle">
                <h2 className="text-3xl md:text-4xl font-bold uppercase mb-8 tracking-tight">
                  {subtitle}
                </h2>
              </Editable>
              <Editable section="team" element="description">
                <div className="space-y-6 text-gray-400 font-light leading-relaxed text-sm md:text-base whitespace-pre-line">
                  <p>{description}</p>
                </div>
              </Editable>
              
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
                    flex: { duration: 0.35, ease: [0.76, 0, 0.24, 1] } 
                  }}
                  className="relative group min-h-0 overflow-hidden border-b md:border-b-0 md:border-r border-white/10 last:border-b-0 last:border-r-0 cursor-pointer"
                >
                  <Editable 
                    section="team" 
                    element="member" 
                    memberId={member.id}
                    className="w-full h-full"
                    onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                  >
                    <img 
                      src={member.image_url || member.image} 
                      alt={member.name}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${expandedMemberId === member.id ? 'grayscale-0 scale-100' : 'grayscale group-hover:grayscale-0 scale-110 group-hover:scale-105'}`}
                      referrerPolicy="no-referrer"
                    />
                    <div className={`absolute inset-0 bg-black/50 transition-opacity duration-500 ${expandedMemberId === member.id ? 'opacity-40' : 'opacity-70 group-hover:opacity-40'}`} />
                    
                    {/* Name & Role Container - Visible only when expanded, at the bottom, and smaller */}
                    <div className={`absolute bottom-10 left-0 right-0 px-6 text-center transition-all duration-700 z-10 ${expandedMemberId === member.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                      <h3 className="text-lg md:text-2xl font-black uppercase tracking-tighter mb-1 whitespace-nowrap text-white drop-shadow-2xl">
                        {member.name}
                      </h3>
                      <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold whitespace-nowrap">
                        {member.role_es || member.role}
                      </p>
                    </div>

                    {/* Aggressive Overlay on Hover/Expand */}
                    <div className={`absolute inset-0 border-4 border-white/0 transition-all duration-300 ${expandedMemberId === member.id ? 'border-white/20' : 'group-hover:border-white/10'}`} />
                  </Editable>
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
