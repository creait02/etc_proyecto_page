import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { projects as mockProjects } from '../data/mockData';

interface SiteContextType {
  settings: any;
  projects: any[];
  teamMembers: any[];
  loading: boolean;
  isAdminPreview: boolean;
}

export const defaultSettings = { 
  home_title_en: "ETC PROYECTO",
  home_title_es: "ETC PROYECTO",
  home_pretitle_en: "Caracas Design Studio | Architecture & Interior Design Studio Caracas",
  home_pretitle_es: "Estudio de Diseño Caracas | Arquitectura e Interiorismo Caracas",
  home_subtitle_en: "Architecture & Design Studio",
  home_subtitle_es: "Estudio de Arquitectura y Diseño",
  filter_all_en: "All",
  filter_all_es: "Todos",
  filter_build_en: "Build",
  filter_build_es: "En Obra",
  filter_complete_en: "Complete",
  filter_complete_es: "Terminados",
  project_filters: [
    { id: 'all', label_en: 'All', label_es: 'Todos' },
    { id: 'build', label_en: 'Build', label_es: 'En Obra' },
    { id: 'complete', label_en: 'Complete', label_es: 'Terminados' }
  ],
  contact_email: "info@etcproyecto.com",
  contact_phone: "+58 412 000 0000",
  contact_address: "Caracas, Venezuela",
  logo_url: "https://res.cloudinary.com/debywjrlg/image/upload/v1773851845/logo_ETC_white_zlrhe4.png",
  team_title_es: "Estudio\nTransformación\nConstrucción",
  team_title_en: "Studio\nTransformation\nConstruction",
  team_subtitle_es: "LOREM IPSUM",
  team_subtitle_en: "LOREM IPSUM",
  team_description_es: "Nuestro equipo reúne a arquitectos, ingenieros y especialistas en construcción líderes en la industria para entregar proyectos complejos a gran escala con una calidad sin concesiones. Cada estructura que creamos refleja un equilibrio entre la excelencia técnica, el diseño refinado y el valor a largo plazo.",
  team_description_en: "Our team brings together industry-leading architects, engineers, and construction specialists to deliver complex, large-scale projects with uncompromising quality. Every structure we create reflects a balance between technical excellence, refined design, and long-term value.",
  team_tags_es: "Ingeniería, Arquitectura, Diseño",
  team_tags_en: "Engineering, Architecture, Design"
};

const SiteContext = createContext<SiteContextType>({ 
  settings: defaultSettings, 
  projects: mockProjects, 
  teamMembers: [], 
  loading: true, 
  isAdminPreview: false 
});

export const SiteProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<any>(defaultSettings);
  const [projects, setProjects] = useState<any[]>(mockProjects);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminPreview, setIsAdminPreview] = useState(false);

  useEffect(() => {
    // Check if we are inside the CMS preview iframe
    const urlParams = new URLSearchParams(window.location.search);
    setIsAdminPreview(urlParams.get('admin_preview') === 'true');

    // 1. Fetch initial data from Supabase
    const fetchData = async () => {
      try {
        const [setRes, projRes, teamRes] = await Promise.all([
          supabase.from('site_settings').select('*').single(),
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('team_members').select('*').order('order', { ascending: true })
        ]);
        
        if (setRes.data) {
          const merged = { ...defaultSettings };
          Object.keys(setRes.data).forEach(key => {
            if (setRes.data[key] !== null && setRes.data[key] !== undefined) {
              (merged as any)[key] = setRes.data[key];
            }
          });
          setSettings(merged);
        } else {
          console.warn('No site settings found in Supabase, using defaults.');
        }

        if (projRes.data && projRes.data.length > 0) {
          setProjects(projRes.data);
        } else {
          console.warn('No projects found in Supabase, using mock data.');
          setProjects(mockProjects);
        }

        if (teamRes.data && teamRes.data.length > 0) {
          setTeamMembers(teamRes.data);
        } else {
          console.warn('No team members found in Supabase.');
          setTeamMembers(fallbackTeamMembers);
        }
      } catch (error: any) {
        if (error.message === 'Failed to fetch') {
          console.warn('Error de conexión con Supabase (Failed to fetch). Usando datos de respaldo.');
        } else {
          console.error('Error fetching site data from Supabase:', error);
        }
        // Fallback is already set via initial state
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // 2. Listen for Live Preview messages from the CMS iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_UPDATE') {
        if (event.data.payload.settings) {
          setSettings(event.data.payload.settings);
        }
        if (event.data.payload.projects) {
          setProjects(event.data.payload.projects);
        }
        if (event.data.payload.teamMembers) {
          setTeamMembers(event.data.payload.teamMembers);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <SiteContext.Provider value={{ settings, projects, teamMembers, loading, isAdminPreview }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteData = () => useContext(SiteContext);
