import { motion } from 'motion/react';
import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Services() {
  const { language } = useLanguage();

  return (
    <div className="w-full h-full bg-[#111111] text-white flex items-center justify-center relative overflow-hidden">
      {/* Container */}
      <div className="w-full h-full overflow-y-auto lg:overflow-hidden p-6 md:p-12 lg:p-24 custom-scrollbar">
        <div className="h-full flex flex-col lg:flex-row gap-12 lg:gap-24 items-center justify-center max-w-7xl mx-auto">
          
          {/* Section: Image Collage */}
          <div className="w-full lg:w-1/2 h-full max-h-[350px] md:max-h-[450px] lg:max-h-[550px] flex flex-col gap-4 relative justify-center order-2 lg:order-1">
            {/* Top pill button */}
            <div className="absolute -top-8 left-0 lg:top-0">
              <div className="border border-white/20 rounded-full px-5 py-1.5 text-[9px] uppercase tracking-widest text-white/90">
                Construcción
              </div>
            </div>

            {/* Collage Grid */}
            <div className="grid grid-cols-2 grid-rows-3 gap-2 md:gap-3 h-full mt-4 lg:mt-10">
              <div className="col-span-2 row-span-1 bg-[#1a1a1a] overflow-hidden rounded-md border border-white/5">
                <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Construction" />
              </div>
              <div className="col-span-1 row-span-1 bg-[#1a1a1a] overflow-hidden rounded-md border border-white/5">
                <img src="https://images.unsplash.com/photo-1541888086205-08107cd9d5da?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Working" />
              </div>
              <div className="col-span-1 row-span-1 bg-[#1a1a1a] overflow-hidden rounded-md border border-white/5">
                 <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Gym Structure" />
              </div>
              <div className="col-span-2 row-span-1 bg-[#1a1a1a] overflow-hidden rounded-md border border-white/5">
                <img src="https://images.unsplash.com/photo-1590644365607-1c5a39227520?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Building" />
              </div>
            </div>
          </div>

          {/* Section: Text & Stats */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center order-1 lg:order-2">
            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl lg:text-[clamp(2.5rem,8vh,3.5rem)] xl:text-[clamp(3.5rem,10vh,5rem)] font-bold tracking-tighter mb-4 md:mb-6 lg:mb-8 leading-[0.9] max-w-[12ch]"
            >
              Construcción precisa.<br/>
              Resultado duradero.
            </motion.h1>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 items-start">
              {/* Text Content */}
              <div className="space-y-3 md:space-y-4 text-[#a1a1aa] font-medium leading-relaxed">
                <p className="text-[clamp(0.7rem,1.5vh,0.875rem)] lg:text-[clamp(0.8rem,1.8vh,1rem)] font-light">
                  Convertimos diseño en materia. Ejecutamos cada proyecto con control, detalle y una visión clara: construir bien, construir para durar.
                </p>
                <div className="flex items-center gap-4 pt-1 lg:pt-2">
                  <button className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-5 lg:px-6 py-2 lg:py-2.5 rounded-lg transition-colors text-[clamp(8px,1vh,9px)] uppercase tracking-widest font-bold">
                    Contact Us
                  </button>
                  <button className="text-white/60 hover:text-white transition-colors text-[clamp(8px,1vh,9px)] uppercase tracking-widest font-bold border-b border-white/20 pb-1">
                    Ver proyectos
                  </button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="border border-white/10 rounded-[12px] lg:rounded-[16px] bg-[#18181b]/30 p-4 lg:p-6 flex flex-col gap-3 lg:gap-5">
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <div className="text-xl lg:text-[clamp(1.5rem,4vh,2rem)] font-black mb-0.5 tracking-tighter leading-none">+50.000</div>
                    <div className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-white/30">M² CONSTRUIDOS</div>
                  </div>
                  <div>
                    <div className="text-xl lg:text-[clamp(1.5rem,4vh,2rem)] font-black mb-0.5 tracking-tighter leading-none">+120</div>
                    <div className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-white/30">PROYECTOS</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <div className="text-xl lg:text-[clamp(1.5rem,4vh,2rem)] font-black mb-0.5 tracking-tighter leading-none">+10</div>
                    <div className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-white/30">AÑOS</div>
                  </div>
                  <div>
                    <div className="text-xl lg:text-[clamp(1.5rem,4vh,2rem)] font-black mb-0.5 tracking-tighter leading-none">100%</div>
                    <div className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-white/30">CALIDAD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
