import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onContactClick: () => void;
  onProjectsClick: () => void;
}

const menuItems = [
  { label: "Projects", action: "projects" },
  { label: "Studio", action: "studio" },
  { label: "Services", action: "services" },
  { label: "Journal", action: "journal" },
  { label: "Contact", action: "contact" }
];

export default function MenuOverlay({ isOpen, onClose, onContactClick, onProjectsClick }: MenuOverlayProps) {
  const handleItemClick = (action: string) => {
    onClose();
    // Small delay to allow menu close animation to start/finish if needed, 
    // or just trigger immediately. 
    // For smoother UX, we might want to trigger the action after a short delay 
    // or immediately if the action itself handles transitions (like contact/projects do).
    
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
              <motion.button
                key={item.label}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-7xl font-light uppercase tracking-tight hover:text-gray-400 transition-colors"
                onClick={() => handleItemClick(item.action)}
              >
                {item.label}
              </motion.button>
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
