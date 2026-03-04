/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import SmoothScroll from './components/SmoothScroll';
import Header from './components/Header';
import Hero from './components/Hero';
import ImmersiveProjectList from './components/ImmersiveProjectList';
import Footer from './components/Footer';
import MenuOverlay from './components/MenuOverlay';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import Contact from './components/Contact';
import ProjectModal from './components/ProjectModal';
import HorizontalProjectsGallery from './components/HorizontalProjectsGallery';
import { AnimatePresence, motion } from 'motion/react';
import Lenis from 'lenis';
import { cn } from './lib/utils';
import { Project } from './data/mockData';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [isContactTransition, setIsContactTransition] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [view, setView] = useState<'home' | 'projects' | 'contact'>('home');

  // Lock body scroll when menu is open or loading
  useEffect(() => {
    if (isMenuOpen || isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuOpen, isLoading]);

  const handleContactClick = () => {
    setView('contact');
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      
      <SmoothScroll onInit={setLenisInstance}>
        <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black cursor-none">
          <CustomCursor />
          <Header 
            onMenuClick={() => setIsMenuOpen(true)} 
            onContactClick={handleContactClick}
            onProjectsClick={() => setView('projects')}
            onHomeClick={() => setView('home')}
          />
          <MenuOverlay 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            onContactClick={handleContactClick}
            onProjectsClick={() => setView('projects')}
          />
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
          
          <div className="relative min-h-screen w-full perspective-[2000px]">
            <AnimatePresence mode="wait">
              {view === 'home' && (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="origin-center w-full bg-black"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <main>
                    <Hero />
                    <ImmersiveProjectList onSelectProject={setSelectedProject} />
                  </main>
                  <Footer />
                </motion.div>
              )}

              {view === 'projects' && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-0 z-40 bg-black"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <HorizontalProjectsGallery onClose={() => setView('home')} />
                </motion.div>
              )}

              {view === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100%' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-0 z-40 bg-black overflow-y-auto"
                >
                  <Contact />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SmoothScroll>
    </>
  );
}
