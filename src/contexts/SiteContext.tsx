import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { projects as mockProjects } from '../data/mockData';
import { fallbackTeamMembers } from '../constants';

interface SiteContextType {
  settings: any;
  projects: any[];
  teamMembers: any[];
  highlights: any[];
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
  highlights_title_es: "HISTORIAS\nQUE CONSTRUIMOS",
  highlights_title_en: "STORIES\nWE BUILD",
  team_title_es: "Estudio\nTransformación\nConstrucción",
  team_title_en: "Studio\nTransformation\nConstruction",
  team_subtitle_es: "LOREM IPSUM",
  team_subtitle_en: "LOREM IPSUM",
  team_description_es: "Nuestro equipo reúne a arquitectos, ingenieros y especialistas en construcción líderes en la industria para entregar proyectos complejos a gran escala con una calidad sin concesiones. Cada estructura que creamos refleja un equilibrio entre la excelencia técnica, el diseño refinado y el valor a largo plazo.",
  team_description_en: "Our team brings together industry-leading architects, engineers, and construction specialists to deliver complex, large-scale projects with uncompromising quality. Every structure we create reflects a balance between technical excellence, refined design, and long-term value.",
  team_tags_es: "Ingeniería, Arquitectura, Diseño",
  team_tags_en: "Engineering, Architecture, Design",
  contact_title_en: "LET'S\nCREATE",
  contact_title_es: "VAMOS A\nCREAR",
  contact_subtitle_en: "GET IN TOUCH",
  contact_subtitle_es: "CONTÁCTANOS",
  contact_description_en: "We are always looking for new challenges and interesting partners. Also, we love to say hello.",
  contact_description_es: "Siempre estamos buscando nuevos desafíos y socios interesantes. Además, nos encanta saludar.",
  footer_description_en: "Award-winning architecture and interior design studio based in Caracas, creating spaces that inspire and endure.",
  footer_description_es: "Estudio galardonado de arquitectura y diseño de interiores con sede en Caracas, creando espacios que inspiran y perduran.",
  social_links: [
    { id: 'instagram', label: 'Instagram', url: '#' },
    { id: 'linkedin', label: 'LinkedIn', url: '#' },
    { id: 'pinterest', label: 'Pinterest', url: '#' }
  ],
  services_title_es: "Construcción precisa.\nResultado duradero.",
  services_title_en: "Precise construction.\nEnduring result.",
  services_description_es: "Convertimos diseño en materia. Ejecutamos cada proyecto con control, detalle y una visión clara: construir bien, construir para durar.",
  services_description_en: "We turn design into matter. We execute every project with control, detail and a clear vision: build well, build to last.",
  services_btn1_es: "Contáctanos",
  services_btn1_en: "Contact Us",
  services_btn2_es: "Ver proyectos",
  services_btn2_en: "View Projects",
  services_stat1_value: "+50.000",
  services_stat1_label_es: "M² CONSTRUIDOS",
  services_stat1_label_en: "M² BUILT",
  services_stat2_value: "+120",
  services_stat2_label_es: "PROYECTOS",
  services_stat2_label_en: "PROJECTS",
  services_stat3_value: "+10",
  services_stat3_label_es: "AÑOS",
  services_stat3_label_en: "YEARS",
  services_stat4_value: "100%",
  services_stat4_label_es: "CALIDAD",
  services_stat4_label_en: "QUALITY",
  services_media_type: "collage",
  services_video_url: "",
  services_image_1: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800",
  services_image_2: "https://images.unsplash.com/photo-1541888086205-08107cd9d5da?auto=format&fit=crop&q=80&w=800",
  services_image_3: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
  services_image_4: "https://images.unsplash.com/photo-1590644365607-1c5a39227520?auto=format&fit=crop&q=80&w=800"
};

const SiteContext = createContext<SiteContextType>({ 
  settings: defaultSettings, 
  projects: mockProjects, 
  teamMembers: [], 
  highlights: [],
  loading: true, 
  isAdminPreview: false 
});

export const SiteProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<any>(defaultSettings);
  const [projects, setProjects] = useState<any[]>(mockProjects);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminPreview, setIsAdminPreview] = useState(false);

  useEffect(() => {
    // Check if we are inside the CMS preview iframe
    const urlParams = new URLSearchParams(window.location.search);
    setIsAdminPreview(urlParams.get('admin_preview') === 'true');

    // 1. Fetch initial data from Supabase
    const fetchData = async () => {
      try {
        const [setRes, projRes, teamRes, highRes] = await Promise.all([
          supabase.from('site_settings').select('*').single(),
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('team_members').select('*').order('order', { ascending: true }),
          supabase.from('highlights').select('*').order('order', { ascending: true })
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

        if (highRes.data && highRes.data.length > 0) {
          setHighlights(highRes.data);
        } else {
          setHighlights([]);
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
        if (event.data.payload.highlights) {
          setHighlights(event.data.payload.highlights);
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
    <SiteContext.Provider value={{ settings, projects, teamMembers, highlights, loading, isAdminPreview }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteData = () => useContext(SiteContext);
