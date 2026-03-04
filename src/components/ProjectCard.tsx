import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Project } from '../data/mockData';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: (project: Project) => void;
}

export default function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group relative w-full aspect-[4/5] md:aspect-[3/4] perspective-1000 cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(project)}
      style={{ perspective: 1000 }}
    >
      <motion.div
        layoutId={`project-card-${project.id}`}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative transition-shadow duration-500 ease-out group-hover:shadow-2xl group-hover:shadow-white/10"
      >
        <div className="absolute inset-0 bg-gray-900 overflow-hidden">
          <motion.img
            layoutId={`project-image-${project.id}`}
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ transform: "translateZ(0px)" }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
        </div>

        <motion.div 
          className="absolute bottom-0 left-0 w-full p-8 text-white"
          style={{ transform: "translateZ(50px)" }}
        >
          <p className="text-xs uppercase tracking-widest mb-2 opacity-80">{project.category}</p>
          <h3 className="text-3xl font-light uppercase tracking-tight">{project.title}</h3>
          <div className="h-[1px] w-0 bg-white mt-4 transition-all duration-500 group-hover:w-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
