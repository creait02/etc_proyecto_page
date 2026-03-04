import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black">
      <motion.div 
        style={{ y, scale, opacity }}
        className="absolute inset-0 w-full h-full"
      >
        <div className="absolute inset-0 bg-black/30 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2400&auto=format&fit=crop" 
          alt="Hero Architecture" 
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-12">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-white/80 text-sm md:text-base uppercase tracking-[0.2em] mb-4">
            London Design Studio
          </h2>
          <h1 className="text-white text-5xl md:text-7xl lg:text-9xl font-light tracking-tight uppercase leading-[0.9]">
            Design <br />
            <span className="font-bold">Matters</span>
          </h1>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-6 md:left-12 z-20 max-w-md"
      >
        <p className="text-white/90 text-sm md:text-base font-light leading-relaxed mb-8">
          ETC PROYECTO is an award winning architectural and interior design studio based in London.
        </p>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-start gap-2 opacity-50"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll to Explore</span>
          <div className="w-[1px] h-12 bg-white/50" />
        </motion.div>
      </motion.div>
    </div>
  );
}
