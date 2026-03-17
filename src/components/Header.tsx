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
          <button onClick={onHomeClick} className="text-2xl font-bold tracking-tighter uppercase font-sans flex items-center gap-2">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={settings.logo_alt || "ETC PROYECTO"} className="h-8 object-contain" />
            ) : (
              "ETC PROYECTO"
            )}
          </button>
        </Editable>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleLanguage} 
          className="text-sm font-medium tracking-widest hover:text-gray-400 transition-colors"
        >
          {language === 'en' ? 'ES' : 'EN'}
        </button>
        <button onClick={onMenuClick} className="p-2 -mr-2">
          <Menu className="w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity" />
        </button>
      </div>
    </motion.header>
  );
}
