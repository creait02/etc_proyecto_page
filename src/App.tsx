/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SmoothScroll from './components/SmoothScroll';
import Header from './components/Header';
import HomeHorizontalLayout from './components/HomeHorizontalLayout';
import Footer from './components/Footer';
import MenuOverlay from './components/MenuOverlay';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import Contact from './components/Contact';
import Highlights from './components/Highlights';
import Team from './components/Team';
import ProjectView from './components/ProjectView';
import HorizontalProjectsGallery from './components/HorizontalProjectsGallery';
import { AnimatePresence, motion } from 'motion/react';
import Lenis from 'lenis';
import { cn } from './lib/utils';
import { Project, projects } from './data/mockData';
import { LanguageProvider } from './contexts/LanguageContext';
import { SiteProvider, useSiteData } from './contexts/SiteContext';
import AdminApp from './admin/AdminApp';
import { Toaster } from 'sonner';

function MainSite() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [isContactTransition, setIsContactTransition] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [view, setView] = useState<'home' | 'projects' | 'contact' | 'highlights' | 'team'>('home');
  const { projects: liveProjects } = useSiteData();

  const displayProjects = liveProjects && liveProjects.length > 0 ? liveProjects : projects;

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
    <SmoothScroll onInit={setLenisInstance}>
      <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
        <CustomCursor />
        <Header 
          onMenuClick={() => setIsMenuOpen(true)} 
          onHomeClick={() => setView('home')}
        />
        <MenuOverlay 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          onContactClick={handleContactClick}
          onProjectsClick={() => setView('projects')}
          onHomeClick={() => setView('home')}
          onHighlightsClick={() => setView('highlights')}
          onTeamClick={() => setView('team')}
        />
        <ProjectView 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
        
        <div className="relative min-h-screen w-full perspective-[2000px]">
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="origin-center w-full bg-black h-screen overflow-hidden"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <HomeHorizontalLayout onSelectProject={setSelectedProject} />
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
                <HorizontalProjectsGallery onSelectProject={setSelectedProject} />
              </motion.div>
            )}

            {view === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full z-40 bg-white"
              >
                <Contact />
              </motion.div>
            )}

            {view === 'highlights' && (
              <motion.div
                key="highlights"
                initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 z-40 bg-[#0a0a0a]"
              >
                <Highlights />
              </motion.div>
            )}

            {view === 'team' && (
              <motion.div
                key="team"
                initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 z-40 bg-black"
              >
                <Team />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SmoothScroll>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <LanguageProvider>
          <Toaster position="top-right" richColors theme="dark" />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/*" element={<MainSite />} />
              <Route path="/admin/*" element={<AdminApp />} />
            </Routes>
          </AnimatePresence>
        </LanguageProvider>
      </SiteProvider>
    </BrowserRouter>
  );
}
