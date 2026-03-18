import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isShrinking, setIsShrinking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide custom cursor in admin area
    if (window.location.pathname.startsWith('/admin')) {
      setIsVisible(false);
      document.body.style.cursor = 'auto'; // Ensure default cursor is visible
      return;
    }

    // Hide default cursor on main site globally, including over buttons/links
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if hovering over an element that should shrink the cursor
      if (target.classList.contains('cursor-shrink') || target.closest('.cursor-shrink')) {
        setIsShrinking(true);
        setIsHovering(false);
      } 
      // Check if hovering over standard interactive elements
      else if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
        setIsShrinking(false);
      } 
      else {
        setIsHovering(false);
        setIsShrinking(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.head.removeChild(style);
      document.body.style.cursor = 'auto'; // Restore default cursor
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (!isVisible) return null;

  // Determine the scale based on state
  let cursorScale = 1;
  if (isHovering) cursorScale = 2.5;
  if (isShrinking) cursorScale = 0.5;

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference"
      animate={{
        x: mousePosition.x - 8,
        y: mousePosition.y - 8,
        scale: cursorScale,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1
      }}
    />
  );
}
