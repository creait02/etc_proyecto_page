import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SiteContextType {
  settings: any;
  projects: any[];
  loading: boolean;
}

const SiteContext = createContext<SiteContextType>({ settings: {}, projects: [], loading: true });

export const SiteProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<any>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial data from Supabase
    const fetchData = async () => {
      try {
        const [setRes, projRes] = await Promise.all([
          supabase.from('site_settings').select('*').single(),
          supabase.from('projects').select('*').order('created_at', { ascending: false })
        ]);
        if (setRes.data) setSettings(setRes.data);
        if (projRes.data) setProjects(projRes.data);
      } catch (error) {
        console.error('Error fetching site data:', error);
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
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <SiteContext.Provider value={{ settings, projects, loading }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteData = () => useContext(SiteContext);
