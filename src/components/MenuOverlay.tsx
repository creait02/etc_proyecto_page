import { motion, AnimatePresence } from 'motion/react';
import { X, Instagram, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onContactClick: () => void;
  onProjectsClick: () => void;
  onHomeClick: () => void;
}

const menuItems = [
  { key: "menu.projects", action: "projects" },
  { key: "menu.services", action: "services", hasSubMenu: true },
  { key: "menu.studio", action: "studio" },
  { key: "menu.highlights", action: "highlights" },
  { key: "menu.contact", action: "contact" }
];

const servicesList = [
  "services.arch",
  "services.planning",
  "services.interior",
  "services.conservation",
  "services.create"
];

export default function MenuOverlay({ isOpen, onClose, onContactClick, onProjectsClick, onHomeClick }: MenuOverlayProps) {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setActiveSubMenu(null), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleItemClick = (action: string, hasSubMenu?: boolean) => {
    if (hasSubMenu) {
      setActiveSubMenu(activeSubMenu === action ? null : action);
      return;
    }
    onClose();
    if (action === 'contact') {
      onContactClick();
    } else if (action === 'projects') {
      onProjectsClick();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[60] bg-[#050505]/95 backdrop-blur-md text-white flex flex-col"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-6 md:px-12 z-10">
            <button 
              onClick={() => { onClose(); onHomeClick(); }} 
              className="text-2xl font-bold tracking-tighter uppercase font-sans"
            >
              ETC PROYECTO
            </button>
            <div className="flex items-center gap-6">
              <button 
                onClick={toggleLanguage} 
                className="text-xs font-medium tracking-widest hover:text-gray-400 transition-colors border border-white px-2 py-1"
              >
                {language === 'en' ? 'ES' : 'EN'}
              </button>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 hover:opacity-70 transition-opacity"
              >
                <X className="w-8 h-8 stroke-[1]" />
              </button>
            </div>
          </div>

          {/* Center Content */}
          <div className="flex-1 flex justify-center items-center w-full max-w-5xl mx-auto px-6 relative">
            
            {/* Main Menu */}
            <motion.nav 
              layout
              className={`flex flex-col gap-6 md:gap-8 ${activeSubMenu ? 'hidden md:flex items-start text-left pr-8 md:pr-16' : 'flex items-center text-center'}`}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {menuItems.map((item, index) => (
                <motion.button
                  layout
                  key={item.key}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`text-3xl md:text-5xl font-extralight tracking-wide transition-colors ${activeSubMenu && activeSubMenu !== item.action ? 'text-gray-600' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => handleItemClick(item.action, item.hasSubMenu)}
                >
                  {t(item.key)}
                </motion.button>
              ))}
            </motion.nav>

            {/* Sub Menu */}
            <AnimatePresence>
              {activeSubMenu === 'services' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-row items-stretch absolute md:relative h-[50vh] md:h-auto"
                >
                  <motion.div 
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-[1px] bg-white/20 origin-top mr-6 md:mr-16" 
                  />
                  <div className="flex flex-col gap-6 whitespace-nowrap items-start justify-center md:justify-start py-4">
                    <button 
                      className="md:hidden flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-white mb-4"
                      onClick={() => setActiveSubMenu(null)}
                    >
                      <ChevronLeft className="w-4 h-4" /> {t('menu.back')}
                    </button>
                    {servicesList.map((serviceKey, i) => (
                      <motion.button
                        key={serviceKey}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                        className="text-xl md:text-3xl font-light text-gray-400 hover:text-white transition-colors text-left"
                        onClick={onClose}
                      >
                        {t(serviceKey)}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Elements */}
          <div className="absolute bottom-8 left-6 md:left-12 flex items-end gap-4">
            {/* Placeholder for awards */}
            <div className="w-12 h-12 border border-white/20 flex items-center justify-center text-[8px] text-center text-white/50 p-1">AWARD<br/>2024</div>
            <div className="w-12 h-12 border border-white/20 flex items-center justify-center text-[8px] text-center text-white/50 p-1">DESIGN<br/>WINNER</div>
          </div>

          <div className="absolute bottom-8 right-6 md:right-12 flex flex-col items-end gap-2">
            <div className="flex items-center gap-4">
              {/* Pinterest Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-white cursor-pointer transition-colors">
                <path d="M8 20.5c.49-1.81 1.05-4.4 1.3-5.5.25-1.1.25-1.1.25-1.1s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.8 0 1.2.6 1.2 1.4 0 .8-.5 2.1-.8 3.2-.3 1 .5 1.8 1.5 1.8 1.8 0 3.2-1.9 3.2-4.6 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.6 2.2-4.6 4.4 0 .9.3 1.8.7 2.3.1.1.1.2 0 .4l-.3 1.2c0 .1-.1.2-.3.1-1.1-.5-1.8-2-1.8-3.2 0-2.6 1.9-5 5.5-5 3 0 5.3 2.1 5.3 4.9 0 3-1.9 5.4-4.5 5.4-1 0-1.9-.5-2.2-1.1l-.6 2.3c-.2.8-.7 1.8-1 2.4"/>
              </svg>
              <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
            <span className="text-xs text-gray-500 font-light">{t('menu.webDesign')}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
