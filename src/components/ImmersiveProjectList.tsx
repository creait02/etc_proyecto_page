import { useRef } from 'react';
import { useScroll, useTransform, motion, MotionValue } from 'motion/react';
import { projects, Project } from '../data/mockData';
import { ArrowRight } from 'lucide-react';

interface ImmersiveProjectListProps {
  onSelectProject: (project: Project) => void;
}

export default function ImmersiveProjectList({ onSelectProject }: ImmersiveProjectListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Define transition pattern: Vertical, Horizontal, Horizontal, Vertical, Horizontal...
  const transitionPattern = ['vertical', 'horizontal', 'horizontal', 'vertical', 'horizontal'];

  return (
    <div ref={containerRef} className="relative bg-black" style={{ height: `${projects.length * 100}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {projects.map((project, index) => (
          <ProjectSlide 
            key={project.id}
            project={project}
            index={index}
            total={projects.length}
            scrollYProgress={scrollYProgress}
            transitionType={transitionPattern[index % transitionPattern.length] as 'vertical' | 'horizontal'}
            onSelect={() => onSelectProject(project)}
          />
        ))}
        
        {/* Progress Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-50 mix-blend-difference">
          {projects.map((_, i) => (
            <ProgressDot 
              key={i} 
              index={i} 
              total={projects.length} 
              scrollYProgress={scrollYProgress} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectSlide({ 
  project, 
  index, 
  total, 
  scrollYProgress,
  transitionType,
  onSelect 
}: { 
  project: Project; 
  index: number; 
  total: number;
  scrollYProgress: MotionValue<number>;
  transitionType: 'vertical' | 'horizontal';
  onSelect: () => void;
}) {
  const step = 1 / (total - 1);
  
  // Define time points
  const enterStart = (index - 1) * step;
  const activePoint = index * step;
  const exitEnd = (index + 1) * step;

  // --- Common Effects ---
  
  // Scale Effect (Internal Image)
  const scale = useTransform(
    scrollYProgress, 
    [enterStart, activePoint], 
    [1.2, 1]
  );

  // Dimming Effect for exiting slides
  const brightness = useTransform(
    scrollYProgress,
    [activePoint, exitEnd],
    [1, 0.5]
  );

  // --- Dynamic Transition Logic ---

  let xInput = [enterStart, activePoint, exitEnd];
  let xOutput = ["0%", "0%", "0%"]; // Default no X movement
  
  let yInput = [enterStart, activePoint, exitEnd];
  let yOutput = ["0%", "0%", "0%"]; // Default no Y movement

  let opacityInput = [enterStart, activePoint, exitEnd];
  let opacityOutput = [1, 1, 1]; // Default visible

  if (index === 0) {
    // First slide is base, just exits
    if (transitionType === 'horizontal') {
       xInput = [0, step];
       xOutput = ["0%", "-25%"];
    } else {
       yInput = [0, step];
       yOutput = ["0%", "-20%"];
       opacityInput = [0, step];
       opacityOutput = [1, 0]; // Fade out vertical base
    }
  } else {
    // Subsequent slides
    if (transitionType === 'horizontal') {
      // Horizontal Slide In
      xInput = [enterStart, activePoint, exitEnd];
      xOutput = ["100%", "0%", "-25%"];
    } else {
      // Vertical Fade/Slide In
      yInput = [enterStart, activePoint, exitEnd];
      yOutput = ["100%", "0%", "-20%"]; // Slide up from bottom
      
      // Optional: Add opacity for vertical to make it smoother
      opacityInput = [enterStart, activePoint];
      opacityOutput = [0, 1];
    }
  }

  const x = useTransform(scrollYProgress, xInput, xOutput);
  const y = useTransform(scrollYProgress, yInput, yOutput);
  // Only apply opacity transform if it's a vertical transition (or base slide)
  // For horizontal, we want full opacity as it slides in.
  const opacity = transitionType === 'vertical' || index === 0 
    ? useTransform(scrollYProgress, opacityInput, opacityOutput) 
    : 1;

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex items-center justify-center bg-black"
      style={{ x, y, opacity, zIndex: index }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="w-full h-full" 
          style={{ 
            scale,
            filter: useTransform(brightness, b => `brightness(${b})`)
          }}
        >
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-20 text-center text-white px-6 max-w-5xl mx-auto"
      >
        <span className="inline-block text-sm md:text-base uppercase tracking-[0.3em] mb-6 text-white/70 shadow-black drop-shadow-md">
          {project.category}
        </span>
        
        <h2 className="text-5xl md:text-7xl lg:text-9xl font-light uppercase tracking-tight mb-8 leading-[0.9] drop-shadow-2xl">
          {project.title}
        </h2>

        <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-lg">
          {project.description}
        </p>

        <button
          onClick={onSelect}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 cursor-pointer shadow-lg"
        >
          View Project
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </motion.div>
  );
}

function ProgressDot({ 
  index, 
  total, 
  scrollYProgress 
}: { 
  index: number; 
  total: number; 
  scrollYProgress: MotionValue<number>;
}) {
  const step = 1 / (total - 1);
  const activePoint = index * step;
  
  // Highlight when close to the active point
  const opacity = useTransform(
    scrollYProgress,
    [activePoint - step/2, activePoint, activePoint + step/2],
    [0.3, 1, 0.3]
  );

  const scale = useTransform(
    scrollYProgress,
    [activePoint - step/2, activePoint, activePoint + step/2],
    [1, 1.5, 1]
  );

  return (
    <motion.div 
      className="w-2 h-2 bg-white rounded-full"
      style={{ opacity, scale }}
    />
  );
}
