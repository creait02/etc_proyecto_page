import { motion } from 'motion/react';
import { Menu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteData } from '../contexts/SiteContext';
import Editable from './Editable';

interface HeaderProps {
  onMenuClick: () => void;
  onHomeClick: () => void;
}

export default function Header({ onMenuClick, onHomeClick }: HeaderProps) {
  const { language, toggleLanguage } = useLanguage();
  const { settings } = useSiteData();

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 mix-blend-difference text-white"
    >
      <div className="flex items-center gap-4">
        <Editable section="header" element="logo">
          <button onClick={onHomeClick} className="flex items-center group cursor-shrink">
            <img 
              src="https://res.cloudinary.com/debywjrlg/image/upload/v1773851845/logo_ETC_white_zlrhe4.png" 
              alt="ETC" 
              className="h-6 md:h-8 w-auto object-contain relative z-10" 
              referrerPolicy="no-referrer"
            />
            <div className="grid grid-cols-[0fr] group-hover:grid-cols-[1fr] transition-[grid-template-columns] duration-700 ease-[0.16,1,0.3,1]">
              <div className="overflow-hidden flex items-center">
                <div className="pl-3 flex items-center">
                  <img 
                    src="https://res.cloudinary.com/debywjrlg/image/upload/v1773851845/ETC_large_white_o9sqhc.png" 
                    alt="Estudio Transformación Construcción" 
                    className="h-6 md:h-8 w-auto max-w-none -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[0.16,1,0.3,1]" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </button>
        </Editable>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleLanguage} 
          className="text-sm font-medium tracking-widest hover:text-gray-400 transition-all duration-300 cursor-shrink hover:scale-125"
        >
          {language === 'en' ? 'ES' : 'EN'}
        </button>
        <button onClick={onMenuClick} className="p-2 -mr-2 cursor-shrink hover:scale-125 hover:text-gray-400 transition-all duration-300">
          <Menu className="w-6 h-6 cursor-pointer" />
        </button>
      </div>
    </motion.header>
  );
}
