import { motion } from 'motion/react';
import { Menu, Search } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onContactClick: () => void;
  onProjectsClick: () => void;
}

export default function Header({ onMenuClick, onContactClick, onProjectsClick }: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 mix-blend-difference text-white"
    >
      <div className="flex items-center gap-4">
        <a href="/" className="text-2xl font-bold tracking-tighter uppercase font-sans">
          ETC PROYECTO
        </a>
      </div>

      <div className="flex items-center gap-8">
        <button 
          onClick={onProjectsClick}
          className="hidden md:block text-sm uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          Projects
        </button>
        <button className="hidden md:block text-sm uppercase tracking-widest hover:opacity-70 transition-opacity">
          Studio
        </button>
        <button 
          onClick={onContactClick}
          className="hidden md:block text-sm uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          Contact
        </button>
        <div className="flex items-center gap-4 ml-4">
          <Search className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" />
          <button onClick={onMenuClick}>
            <Menu className="w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
