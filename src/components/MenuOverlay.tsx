import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  "Projects",
  "Studio",
  "Services",
  "Journal",
  "Contact"
];

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[60] bg-black text-white flex flex-col justify-center items-center"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <nav className="flex flex-col items-center gap-8">
            {menuItems.map((item, index) => (
              <motion.a
                key={item}
                href="#"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-7xl font-light uppercase tracking-tight hover:text-gray-400 transition-colors"
                onClick={onClose}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-12 text-xs uppercase tracking-widest text-gray-500"
          >
            London &mdash; Design Studio
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
