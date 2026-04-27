import { motion } from 'motion/react';
import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteData } from '../contexts/SiteContext';
import { Play } from 'lucide-react';

export default function Services() {
  const { language } = useLanguage();
  const { settings, isAdminPreview } = useSiteData();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const title = language === 'en' ? settings.services_title_en : settings.services_title_es;
  const description = language === 'en' ? settings.services_description_en : settings.services_description_es;
  const btn1 = language === 'en' ? settings.services_btn1_en : settings.services_btn1_es;
  const btn2 = language === 'en' ? settings.services_btn2_en : settings.services_btn2_es;
  
  const stat1Label = language === 'en' ? settings.services_stat1_label_en : settings.services_stat1_label_es;
  const stat2Label = language === 'en' ? settings.services_stat2_label_en : settings.services_stat2_label_es;
  const stat3Label = language === 'en' ? settings.services_stat3_label_en : settings.services_stat3_label_es;
  const stat4Label = language === 'en' ? settings.services_stat4_label_en : settings.services_stat4_label_es;

  const handleElementClick = (element: string, event: React.MouseEvent) => {
    if (!isAdminPreview) return;
    event.stopPropagation();
    window.parent.postMessage({
      type: 'ELEMENT_CLICKED',
      payload: { section: 'services', element }
    }, '*');
  };

  const wrapEditable = (elementName: string, children: React.ReactNode, wrapperClass = '') => {
    if (!isAdminPreview) return <>{children}</>;
    return (
      <div 
        onClick={(e) => handleElementClick(elementName, e)}
        className={`relative group cursor-pointer ${wrapperClass} hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 hover:ring-offset-black rounded transition-all`}
      >
        <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
          EDITAR
        </div>
        {children}
      </div>
    );
  };

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full h-full bg-[#111111] text-white flex items-center justify-center relative overflow-hidden" onClick={(e) => handleElementClick('background', e)}>
      {/* Container */}
      <div className="w-full h-full overflow-y-auto lg:overflow-hidden p-6 md:p-12 lg:p-24 custom-scrollbar">
        <div className="h-full flex flex-col lg:flex-row gap-12 lg:gap-24 items-center justify-center max-w-7xl mx-auto">
          
          {/* Section: Image Collage or Video */}
          <div className="w-full lg:w-1/2 h-full max-h-[350px] md:max-h-[450px] lg:max-h-[550px] flex flex-col gap-4 relative justify-center order-2 lg:order-1">
            {/* Top pill button */}
            <div className="absolute -top-8 left-0 lg:top-0">
              <div className="border border-white/20 rounded-full px-5 py-1.5 text-[9px] uppercase tracking-widest text-white/90">
                {language === 'en' ? 'Construction' : 'Construcción'}
              </div>
            </div>

            {settings.services_media_type === 'video' ? (
              <div className="w-full h-full mt-4 lg:mt-10 relative">
                {wrapEditable('video', (
                  <div className="w-full h-full bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden relative group">
                    {settings.services_video_url ? (
                      <video 
                        ref={videoRef}
                        src={settings.services_video_url} 
                        className="w-full h-full object-cover" 
                        controls={false}
                        loop
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Video no configurado</div>
                    )}
                    
                    {/* Play Overlay */}
                    {!isPlaying && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer" onClick={handlePlayClick}>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all">
                          <Play className="w-6 h-6 text-white group-hover:text-black ml-1" fill="currentColor" />
                        </div>
                      </div>
                    )}
                    {isPlaying && (
                      <div className="absolute inset-0 cursor-pointer" onClick={handlePlayClick} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Collage Grid */
              <div className="grid grid-cols-2 grid-rows-3 gap-2 md:gap-3 h-full mt-4 lg:mt-10">
                {wrapEditable('image_1', (
                  <div className="col-span-2 row-span-1 bg-[#1a1a1a] overflow-hidden rounded-md border border-white/5 h-full relative">
                    {settings.services_image_1 && <img src={settings.services_image_1} className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Construction" />}
                  </div>
                ), "col-span-2 row-span-1")}
                {wrapEditable('image_2', (
                  <div className="col-span-1 row-span-1 bg-[#1a1a1a] overflow-hidden rounded-md border border-white/5 h-full relative">
                    {settings.services_image_2 && <img src={settings.services_image_2} className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Working" />}
                  </div>
                ), "col-span-1 row-span-1")}
                {wrapEditable('image_3', (
                  <div className="col-span-1 row-span-1 bg-[#1a1a1a] overflow-hidden rounded-md border border-white/5 h-full relative">
                     {settings.services_image_3 && <img src={settings.services_image_3} className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Gym Structure" />}
                  </div>
                ), "col-span-1 row-span-1")}
                {wrapEditable('image_4', (
                  <div className="col-span-2 row-span-1 bg-[#1a1a1a] overflow-hidden rounded-md border border-white/5 h-full relative">
                    {settings.services_image_4 && <img src={settings.services_image_4} className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Building" />}
                  </div>
                ), "col-span-2 row-span-1")}
              </div>
            )}
          </div>

          {/* Section: Text & Stats */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center order-1 lg:order-2">
            {/* Title */}
            {wrapEditable('title', (
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl lg:text-[clamp(2.5rem,8vh,3.5rem)] xl:text-[clamp(3.5rem,10vh,5rem)] font-bold tracking-tighter mb-4 md:mb-6 lg:mb-8 leading-[0.9] max-w-[12ch] whitespace-pre-line"
              >
                {title}
              </motion.h1>
            ))}

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 items-start">
              {/* Text Content */}
              <div className="space-y-3 md:space-y-4 text-[#a1a1aa] font-medium leading-relaxed">
                {wrapEditable('description', (
                  <p className="text-[clamp(0.7rem,1.5vh,0.875rem)] lg:text-[clamp(0.8rem,1.8vh,1rem)] font-light">
                    {description}
                  </p>
                ))}
                <div className="flex items-center gap-4 pt-1 lg:pt-2">
                  {wrapEditable('buttons', (
                    <>
                      <button className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-5 lg:px-6 py-2 lg:py-2.5 rounded-lg transition-colors text-[clamp(8px,1vh,9px)] uppercase tracking-widest font-bold">
                        {btn1}
                      </button>
                      <button className="text-white/60 hover:text-white transition-colors text-[clamp(8px,1vh,9px)] uppercase tracking-widest font-bold border-b border-white/20 pb-1">
                        {btn2}
                      </button>
                    </>
                  ), "flex items-center gap-4")}
                </div>
              </div>

              {/* Stats Card */}
              {wrapEditable('stats', (
                <div className="border border-white/10 rounded-[12px] lg:rounded-[16px] bg-[#18181b]/30 p-4 lg:p-6 flex flex-col gap-3 lg:gap-5">
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <div className="text-xl lg:text-[clamp(1.5rem,4vh,2rem)] font-black mb-0.5 tracking-tighter leading-none">{settings.services_stat1_value}</div>
                      <div className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-white/30">{stat1Label}</div>
                    </div>
                    <div>
                      <div className="text-xl lg:text-[clamp(1.5rem,4vh,2rem)] font-black mb-0.5 tracking-tighter leading-none">{settings.services_stat2_value}</div>
                      <div className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-white/30">{stat2Label}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <div className="text-xl lg:text-[clamp(1.5rem,4vh,2rem)] font-black mb-0.5 tracking-tighter leading-none">{settings.services_stat3_value}</div>
                      <div className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-white/30">{stat3Label}</div>
                    </div>
                    <div>
                      <div className="text-xl lg:text-[clamp(1.5rem,4vh,2rem)] font-black mb-0.5 tracking-tighter leading-none">{settings.services_stat4_value}</div>
                      <div className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-white/30">{stat4Label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
