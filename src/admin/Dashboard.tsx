import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LogOut, Layout, Phone, FolderKanban, Save, X, Plus, Trash2, 
  Edit2, Users, Video, Play, Film, Shield, Menu, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { fallbackTeamMembers } from '../constants';
import { defaultSettings } from '../contexts/SiteContext';
import { projects as fallbackProjects } from '../data/mockData';

export default function Dashboard({ userEmail: propUserEmail }: { userEmail?: string | null }) {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [userEmail, setUserEmail] = useState<string | null>(propUserEmail || null);

  // Settings State
  const [originalSettings, setOriginalSettings] = useState<any>({});
  const [draftSettings, setDraftSettings] = useState<any>({});
  
  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any>(null);

  // Highlights State
  const fallbackHighlights = [
    { 
      id: 1, 
      title_en: 'LOREM IPSUM TITLE', 
      title_es: 'LOREM IPSUM TITLE', 
      category_en: 'LOREM IPSUM ROLE', 
      category_es: 'LOREM IPSUM ROLE', 
      description_en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 
      description_es: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      body_en: "Our architects, engineers, and construction professionals work as a single, integrated unit. This cohesion allows us to translate ambitious concepts into built realities, ensuring that every decision — from structural systems to material selection — is aligned with the project's broader vision and long-term durability.",
      body_es: "Nuestros arquitectos, ingenieros y profesionales de la construcción trabajan como una unidad única e integrada. Esta cohesión nos permite traducir conceptos ambiciosos en realidades construidas, asegurando que cada decisión, desde los sistemas estructurales hasta la selección de materiales, esté alineada con la visión más amplia y la durabilidad a largo plazo del proyecto.",
      image_url: '',
      video_url: '',
      gallery_url_1: '',
      gallery_url_2: '' 
    },
    { 
      id: 2, 
      title_en: 'LOREM IPSUM TITLE 2', 
      title_es: 'LOREM IPSUM TITLE 2', 
      category_en: 'LOREM IPSUM ROLE 2', 
      category_es: 'LOREM IPSUM ROLE 2', 
      description_en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 
      description_es: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      body_en: "Our architects, engineers, and construction professionals work as a single, integrated unit. This cohesion allows us to translate ambitious concepts into built realities, ensuring that every decision — from structural systems to material selection — is aligned with the project's broader vision and long-term durability.",
      body_es: "Nuestros arquitectos, ingenieros y profesionales de la construcción trabajan como una unidad única e integrada. Esta cohesión nos permite traducir conceptos ambiciosos en realidades construidas, asegurando que cada decisión, desde los sistemas estructurales hasta la selección de materiales, esté alineada con la visión más amplia y la durabilidad a largo plazo del proyecto.",
      image_url: '',
      video_url: '',
      gallery_url_1: '',
      gallery_url_2: '' 
    }
  ];

  const [highlights, setHighlights] = useState<any[]>([]);
  const highlightsRef = useRef<any[]>([]);
  const [editingHighlight, setEditingHighlight] = useState<any>(null);

  const isUUID = (id: any) => {
    if (!id) return false;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return typeof id === 'string' && uuidRegex.test(id);
  };

  useEffect(() => {
    highlightsRef.current = highlights;
  }, [highlights]);

  useEffect(() => {
    if (propUserEmail) {
      setUserEmail(propUserEmail);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, [propUserEmail]);

  // Team State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [allowedUsers, setAllowedUsers] = useState<any[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  
  // Elementor-like Editor State
  const [activeEditor, setActiveEditor] = useState<{ section: string, element: string, projectId?: string | number, memberId?: string | number } | null>(null);

  // Refs for data to be used in event listeners without re-triggering effects
  const projectsRef = useRef(projects);
  const teamMembersRef = useRef(teamMembers);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    teamMembersRef.current = teamMembers;
  }, [teamMembers]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'CHANGE_VIEW',
        payload: { view: activeTab }
      }, '*');
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();

    // Subscribe to real-time changes to keep the dashboard state updated if other users make changes
    const channels = [
      supabase.channel('dashboard_settings').on('postgres_changes', { event: '*', table: 'site_settings', schema: 'public' }, () => fetchData()),
      supabase.channel('dashboard_projects').on('postgres_changes', { event: '*', table: 'projects', schema: 'public' }, () => fetchData()),
      supabase.channel('dashboard_team').on('postgres_changes', { event: '*', table: 'team_members', schema: 'public' }, () => fetchData()),
      supabase.channel('dashboard_highlights').on('postgres_changes', { event: '*', table: 'highlights', schema: 'public' }, () => fetchData())
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []); // Only subscribe on mount

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ELEMENT_CLICKED') {
        const { section, element, projectId, memberId } = event.data.payload;
        setActiveEditor({ section, element, projectId, memberId });
        
        // Switch to the appropriate tab based on the section
        if (section === 'home' || section === 'header') {
          setActiveTab('home');
        } else if (section === 'projects' || element === 'new_project') {
          setActiveTab('projects');
          if (element === 'new_project') {
             setEditingProject({});
          } else if (projectId) {
            const projIdStr = String(projectId);
            const proj = projectsRef.current.find(p => String(p.id) === projIdStr);
            if (proj) {
              setEditingProject(proj);
            } else {
              // Check fallbacks first to handle initial mock data clicks seamlessly
              const fallbackProj = fallbackProjects.find(p => String(p.id) === projIdStr);
              if (fallbackProj) {
                // Initialize a mock project exactly as it should look locally and in DB
                setEditingProject({
                  ...fallbackProj,
                  title_en: fallbackProj.title,
                  title_es: fallbackProj.titleEs,
                  category_en: fallbackProj.category,
                  category_es: fallbackProj.categoryEs,
                  description_en: fallbackProj.description,
                  description_es: fallbackProj.descriptionEs,
                  image_url: fallbackProj.image,
                  // Remove old mock keys so it doesn't cause insert issues
                  title: undefined,
                  titleEs: undefined,
                  category: undefined,
                  categoryEs: undefined,
                  description: undefined,
                  descriptionEs: undefined,
                  image: undefined,
                  gallery: undefined
                });
              } else {
                // DIRECT FETCH as absolute fallback to avoid null editingProject
                const loadProject = async () => {
                  const { data } = await supabase.from('projects').select('*').eq('id', projectId).single();
                  if (data) setEditingProject(data);
                };
                loadProject();
              }
            }
          }
        } else if (section === 'highlights' || element === 'new_highlight') {
          setActiveTab('highlights');
          if (element === 'new_highlight') {
            setEditingHighlight({ 
              id: null, 
              title_en: '', 
              title_es: '', 
              category_en: '', 
              category_es: '', 
              description_en: '', 
              description_es: '', 
              body_en: '', 
              body_es: '', 
              image_url: '',
              video_url: '',
              gallery_url_1: '',
              gallery_url_2: ''
            });
          } else if (projectId) {
            const highlightIdStr = String(projectId);
            const hig = highlightsRef.current.find(h => String(h.id) === highlightIdStr);
            if (hig) {
              setEditingHighlight(hig);
            } else {
              // Check fallback
              const fallbackHig = fallbackHighlights.find(h => String(h.id) === highlightIdStr);
              if (fallbackHig) {
                setEditingHighlight(fallbackHig);
              } else {
                const loadHighlight = async () => {
                  const { data } = await supabase.from('highlights').select('*').eq('id', projectId).single();
                  if (data) setEditingHighlight(data);
                };
                loadHighlight();
              }
            }
          }
        } else if (section === 'contact') {
          setActiveTab('contact');
        } else if (section === 'services') {
          setActiveTab('services');
        } else if (section === 'highlights') {
          setActiveTab('highlights');
        } else if (section === 'team') {
          setActiveTab('team');
          if (memberId) {
            let member = teamMembersRef.current.find(m => String(m.id) === String(memberId));
            if (!member) {
              // Check fallbacks if not in DB
              member = fallbackTeamMembers.find(m => String(m.id) === String(memberId));
            }
            if (member) {
              setEditingMember({
                ...member,
                role_en: (member as any).role_en || (member as any).role || '',
                role_es: (member as any).role_es || (member as any).role || ''
              });
            }
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const hasChangesRef = useRef(false);

  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  const fetchData = async (retryCount = 0) => {
    try {
      const [setRes, projRes, teamRes, highRes, usersRes] = await Promise.all([
        supabase.from('site_settings').select('*').single(),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('team_members').select('*').order('order', { ascending: true }),
        supabase.from('highlights').select('*').order('order', { ascending: true }),
        supabase.from('allowed_users').select('*').order('created_at', { ascending: false })
      ]);
      
      const errors = [setRes.error, projRes.error, teamRes.error, highRes.error, usersRes.error].filter(Boolean);
      const isLockError = errors.some(e => e?.message?.includes('lock') || e?.message?.includes('stole'));

      if (isLockError && retryCount < 3) {
        const delay = (retryCount + 1) * 1000;
        await new Promise(r => setTimeout(r, delay));
        return fetchData(retryCount + 1);
      }

      if (setRes.data) {
        const merged = { ...defaultSettings };
        Object.keys(setRes.data).forEach(key => {
          if (setRes.data[key] !== null && setRes.data[key] !== undefined) {
            (merged as any)[key] = setRes.data[key];
          }
        });
        setOriginalSettings(merged);
        
        if (!hasChangesRef.current) {
          setDraftSettings(merged);
        }
      } else {
        setOriginalSettings(defaultSettings);
        if (!hasChangesRef.current) setDraftSettings(defaultSettings);
      }

      // Sync projects
      if (projRes.data) {
        setProjects(projRes.data.length > 0 ? projRes.data : fallbackProjects);
      }

      // Sync team members - PRIORITY
      if (teamRes.data) {
        setTeamMembers(teamRes.data.length > 0 ? teamRes.data : fallbackTeamMembers);
      }

      if (highRes.data) {
        setHighlights(highRes.data.length > 0 ? highRes.data : fallbackHighlights);
      }

      if (usersRes.data) {
        setAllowedUsers(usersRes.data);
      }
    } catch (error) {
      console.error('Error fetching site data in Dashboard:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (!isVideo && !isImage) {
      toast.error('Formato no válido', {
        description: 'Por favor, sube solo imágenes o vídeos.'
      });
      e.target.value = '';
      return;
    }

    const maxSizeInMB = isVideo ? 100 : 20;
    const fileSizeInMB = file.size / (1024 * 1024);

    if (fileSizeInMB > maxSizeInMB) {
      toast.error('Archivo demasiado grande', {
        description: `Tu archivo pesa ${fileSizeInMB.toFixed(2)}MB. El límite es de ${maxSizeInMB}MB para ${isVideo ? 'vídeos' : 'imágenes'}.`
      });
      e.target.value = '';
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    formData.append('cloud_name', 'debywjrlg');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/debywjrlg/auto/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.secure_url) {
        callback(data.secure_url);
      } else {
        throw new Error(data.error?.message || 'Error al subir el archivo');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.message === 'Failed to fetch') {
        toast.error('Error de conexión', {
          description: 'No se pudo conectar con el servidor de subida. Verifica tu internet.'
        });
      } else {
        toast.error('Error de subida', {
          description: 'Hubo un problema al subir el archivo. Verifica la configuración de Cloudinary.'
        });
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Update Live Preview when draft changes
  useEffect(() => {
    // Combine saved projects with the currently editing project for live preview
    let previewProjects = [...projects];
    if (editingProject) {
      if (editingProject.id) {
        previewProjects = previewProjects.map(p => p.id === editingProject.id ? editingProject : p);
      } else {
        previewProjects = [editingProject, ...previewProjects];
      }
    }

    // Combine saved team members with the currently editing member for live preview
    let previewTeam = [...teamMembers];
    if (editingMember) {
      if (editingMember.id) {
        previewTeam = previewTeam.map(m => m.id === editingMember.id ? editingMember : m);
      } else {
        previewTeam = [editingMember, ...previewTeam];
      }
    }

    let previewHighlights = [...highlights];
    if (editingHighlight) {
      if (editingHighlight.id) {
        previewHighlights = previewHighlights.map(h => h.id === editingHighlight.id ? editingHighlight : h);
      } else {
        previewHighlights = [...previewHighlights, editingHighlight];
      }
    }

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'PREVIEW_UPDATE',
        payload: { 
          settings: draftSettings, 
          projects: previewProjects,
          teamMembers: previewTeam,
          highlights: previewHighlights
        }
      }, '*');
    }
    
    // Check if changed
    const isSettingsChanged = JSON.stringify(originalSettings) !== JSON.stringify(draftSettings);
    const isProjectEditing = editingProject !== null;
    const isTeamEditing = editingMember !== null;
    const isHighlightEditing = editingHighlight !== null;
    setHasChanges(isSettingsChanged || isProjectEditing || isTeamEditing || isHighlightEditing);
  }, [draftSettings, projects, originalSettings, editingProject, teamMembers, editingMember, highlights, editingHighlight]);

  const updateSetting = (key: string, value: any) => {
    setDraftSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const addFilter = () => {
    // Force a new array reference and ensure it's not empty
    const currentFilters = Array.isArray(draftSettings.project_filters) ? [...draftSettings.project_filters] : [...defaultSettings.project_filters];
    
    // Generate a shorter, cleaner ID
    const newId = `cat_${Math.random().toString(36).substr(2, 5)}`;
    const newFilter = { 
      id: newId, 
      label_en: 'New Category', 
      label_es: 'Nueva Categoría' 
    };
    
    const updatedFilters = [...currentFilters, newFilter];
    
    // updateSetting uses setDraftSettings which handles state updates correctly
    updateSetting('project_filters', updatedFilters);
    
    toast.success('Filtro añadido', {
      description: 'Ahora puedes asignar proyectos a esta categoría.'
    });
  };

  const removeFilter = (id: string) => {
    if (id === 'all') return; // Cannot remove 'all'
    const filters = (draftSettings.project_filters || []).filter((f: any) => f.id !== id);
    updateSetting('project_filters', filters);
  };

  const updateFilterEntry = (index: number, field: string, value: string) => {
    const filters = [...(draftSettings.project_filters || [])];
    filters[index] = { ...filters[index], [field]: value };
    updateSetting('project_filters', filters);
  };

  const addSocialLink = () => {
    const currentLinks = Array.isArray(draftSettings.social_links) ? [...draftSettings.social_links] : [];
    const newId = `social_${Math.random().toString(36).substr(2, 5)}`;
    const updatedLinks = [...currentLinks, { id: newId, label: 'Nueva Red Social', url: 'https://' }];
    updateSetting('social_links', updatedLinks);
  };

  const updateSocialLink = (index: number, field: 'label' | 'url', value: string) => {
    const currentLinks = [...(draftSettings.social_links || [])];
    currentLinks[index] = { ...currentLinks[index], [field]: value };
    updateSetting('social_links', currentLinks);
  };

  const removeSocialLink = (id: string) => {
    const currentLinks = (draftSettings.social_links || []).filter((l: any) => l.id !== id);
    updateSetting('social_links', currentLinks);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save settings if changed
      const isSettingsChanged = JSON.stringify(originalSettings) !== JSON.stringify(draftSettings);
      if (isSettingsChanged) {
        try {
          if (originalSettings.id) {
            const { error } = await supabase.from('site_settings').update(draftSettings).eq('id', originalSettings.id);
            if (error) throw error;
          } else {
            const { error } = await supabase.from('site_settings').insert([draftSettings]);
            if (error) throw error;
          }
          setOriginalSettings(draftSettings);
        } catch (settingsError: any) {
          if (settingsError.message?.includes('Could not find') || settingsError.message?.includes('column')) {
             toast.error('Faltan columnas en Supabase', {
                description: `Error: ${settingsError.message}. Por favor, verifica el SQL ejecutado.`
             });
             console.error("Supabase Settings Error:", settingsError);
             setIsSaving(false);
             return;
          } else {
             toast.error('Error al guardar ajustes', {
                description: settingsError.message
             });
             console.error("Supabase Settings Error:", settingsError);
             throw settingsError;
          }
        }
      }

      // Save project if editing
      if (editingProject) {
        if (!editingProject.title_en || !editingProject.title_es || !editingProject.category_en || !editingProject.category_es || !(editingProject.image_url || editingProject.image)) {
          toast.warning('Campos incompletos', {
            description: 'Por favor completa los campos requeridos del proyecto (Títulos en EN/ES, Categorías en EN/ES, Imagen).'
          });
          setIsSaving(false);
          return;
        }

        // Remove mock data mappings from the project object
        const { image, title, titleEs, category, categoryEs, description, descriptionEs, status, gallery, ...projectDataToSave } = editingProject;

        // If 'id' is present and is a valid UUID, we update. Otherwise insert.
        if (isUUID(projectDataToSave.id)) {
          const { error } = await supabase.from('projects').update(projectDataToSave).eq('id', projectDataToSave.id);
          if (error) throw error;
        } else {
          delete projectDataToSave.id;
          const { error } = await supabase.from('projects').insert([projectDataToSave]);
          if (error) throw error;
        }
        setEditingProject(null);
      }

      // Save team member if editing
      if (editingMember) {
        if (!editingMember.name || !editingMember.role_en || !editingMember.role_es || !(editingMember.image_url || editingMember.image)) {
          toast.warning('Campos incompletos', {
            description: 'Por favor completa los campos requeridos del miembro (Nombre, Rol en EN/ES, Imagen).'
          });
          setIsSaving(false);
          return;
        }

        // Prepare member data, ignore `image` and `role` (legacy frontend fields)
        const { image, role, ...memberDataToSave } = editingMember;

        if (isUUID(memberDataToSave.id)) {
          const { error } = await supabase.from('team_members').update(memberDataToSave).eq('id', memberDataToSave.id);
          if (error) throw error;
        } else {
          delete memberDataToSave.id;
          const { error } = await supabase.from('team_members').insert([memberDataToSave]);
          if (error) throw error;
        }
        setEditingMember(null);
      }

      // Save highlight if editing
      if (editingHighlight) {
        if (!editingHighlight.title_en || !editingHighlight.title_es || !editingHighlight.category_en || !editingHighlight.category_es || !(editingHighlight.image_url || editingHighlight.image)) {
          toast.warning('Campos incompletos', {
            description: 'Por favor completa los campos requeridos del highlight (Títulos en EN/ES, Categorías en EN/ES, Imagen).'
          });
          setIsSaving(false);
          return;
        }

        const { 
          image, title, titleEs, category, categoryEs, description, descriptionEs, body, role,
          id, // explicitly take id out to handle separately
          ...data 
        } = editingHighlight;

        const highlightDataToSave = {
          id: id,
          title_en: data.title_en,
          title_es: data.title_es,
          category_en: data.category_en,
          category_es: data.category_es,
          description_en: data.description_en,
          description_es: data.description_es,
          body_en: data.body_en,
          body_es: data.body_es,
          image_url: data.image_url,
          video_url: data.video_url,
          gallery_url_1: data.gallery_url_1,
          gallery_url_2: data.gallery_url_2,
          "order": data.order || 0
        };

        if (isUUID(highlightDataToSave.id)) {
          const { error } = await supabase.from('highlights').update(highlightDataToSave).eq('id', highlightDataToSave.id);
          if (error) throw error;
        } else {
          delete highlightDataToSave.id;
          const { error } = await supabase.from('highlights').insert([highlightDataToSave]);
          if (error) throw error;
        }
        setEditingHighlight(null);
      }

      await fetchData(); // Refresh all data
      setHasChanges(false);
      toast.success('Cambios guardados', {
        description: 'Todo el contenido se ha actualizado correctamente.'
      });
    } catch (error: any) {
      console.error('Save error:', error);
      if (error.message === 'Failed to fetch') {
        toast.error('Error de conexión', {
          description: 'No se pudieron guardar los cambios. Verifica tu conexión a internet.'
        });
      } else {
        toast.error('Error al guardar', {
          description: error.message || 'Ocurrió un error inesperado al intentar guardar.'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setDraftSettings(originalSettings);
    setEditingProject(null);
    setEditingMember(null);
    setHasChanges(false);
  };

  // Project Handlers (Direct save for simplicity in this view)
  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  const saveHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  const deleteProject = async (id: string) => {
    if (confirm('¿Eliminar proyecto?')) {
      try {
        if (isUUID(id)) {
          const { error, data } = await supabase.from('projects').delete().eq('id', id).select();
          if (error) throw error;
          
          if (!data || data.length === 0) {
             toast.error('No se pudo eliminar', { 
               description: 'Es posible que las políticas de seguridad (RLS) en Supabase estén bloqueando la acción de "Delete".' 
             });
             return;
          }
        }

        toast.success('Proyecto eliminado');
        fetchData();
      } catch (error: any) {
        toast.error('Error al eliminar', { description: error.message });
      }
    }
  };

  // Team Handlers
  const saveMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await handleSave();
  };

  const deleteMember = async (id: string) => {
    try {
      if (isUUID(id)) {
        const { error, data } = await supabase.from('team_members').delete().eq('id', id).select();
        if (error) throw error;

        if (!data || data.length === 0) {
           toast.error('No se pudo eliminar', { 
             description: 'Revisa las políticas RLS de Supabase. La base de datos no permitió borrar el elemento.' 
           });
           return;
        }
      }

      toast.success('Miembro eliminado');
      setTeamMembers(teamMembers.filter(m => String(m.id) !== String(id)));
      if (String(editingMember?.id) === String(id)) setEditingMember(null);
      if (String(activeEditor?.memberId) === String(id)) setActiveEditor(null);
      
      setMemberToDelete(null);
      fetchData(); // Sync up fully if there are any cascading effects, but updating local state is usually enough
    } catch (error: any) {
      toast.error('Error al eliminar', { description: error.message });
      setMemberToDelete(null);
    }
  };



  const addAllowedUser = async () => {
    if (!newUserEmail.trim()) return;
    
    // Check if it's already in the list
    if (allowedUsers.some(u => u.email === newUserEmail)) {
      toast.error('El usuario ya está en la lista');
      return;
    }

    try {
      const { error } = await supabase.from('allowed_users').insert([{
        email: newUserEmail,
        name: newUserName,
        role: 'editor'
      }]);
      
      if (error) throw error;
      
      toast.success('Acceso concedido');
      setNewUserEmail('');
      setNewUserName('');
      fetchData();
    } catch (error: any) {
      toast.error('Error al agregar usuario', { description: error.message });
    }
  };

  const removeAllowedUser = async (id: string) => {
    if (!confirm('¿Seguro que deseas revocar el acceso a este usuario?')) return;
    
    try {
      const { error } = await supabase.from('allowed_users').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Acceso revocado');
      fetchData();
    } catch (error: any) {
      toast.error('Error al eliminar usuario', { description: error.message });
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('etc_demo_session');
      // Clear all possible tokens to be sure
      const iframeToken = 'sb-etc-preview-token';
      const mainToken = 'sb-etc-main-token';
      localStorage.removeItem(iframeToken);
      localStorage.removeItem(mainToken);
      
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      // Force reload to state before session
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  const isDemo = localStorage.getItem('etc_demo_session') === 'true';

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR - CONTROLS */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 64 : 320 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-zinc-900 border-r border-white/10 flex flex-col z-10 shadow-2xl relative"
      >
        {isDemo && !isSidebarCollapsed && (
          <div className="bg-amber-500/20 border-b border-amber-500/30 px-6 py-2">
            <p className="text-[9px] uppercase tracking-widest text-amber-500 font-bold text-center">
              Modo Demostración Activo
            </p>
          </div>
        )}
        {/* Header */}
        <div className="h-14 px-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed ? (
              <motion.div 
                key="logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
              >
                <div className="w-6 h-6 bg-white rounded-sm flex-none flex items-center justify-center">
                  <span className="text-black font-black text-[10px]">ETC</span>
                </div>
                <span className="font-bold tracking-[0.2em] uppercase text-[10px]">CMS Panel</span>
              </motion.div>
            ) : (
              <motion.div 
                key="logo-small"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex-none w-full flex justify-center"
              >
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-black font-black text-[10px]">E</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsSidebarCollapsed(true)} 
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-all group"
                title="Contraer Lateral"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={handleLogout} 
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all active:scale-90" 
                title="Cerrar Sesión"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>

        {isSidebarCollapsed && (
          <div className="py-4 border-b border-white/10 flex flex-col items-center gap-4">
             <button 
                onClick={() => setIsSidebarCollapsed(false)} 
                className="p-2 text-gray-400 hover:text-white hover:bg-blue-500/10 hover:text-blue-400 rounded-full transition-all group"
                title="Expandir Panel"
              >
                <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={handleLogout} 
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all active:scale-90" 
                title="Salir"
              >
                <LogOut size={16} />
              </button>
          </div>
        )}

        {/* Vertical Navigation Menu */}
        <div className="flex-none bg-black/10">
          <div 
            className={`flex items-center justify-between px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group ${isSidebarCollapsed ? 'h-10' : ''}`}
            onClick={() => !isSidebarCollapsed && setIsNavExpanded(!isNavExpanded)}
          >
            {!isSidebarCollapsed && <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-bold group-hover:text-zinc-300">Menú de Navegación</span>}
            {!isSidebarCollapsed && (
              <motion.div animate={{ rotate: isNavExpanded ? 0 : -180 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
                <ChevronLeft size={14} className="text-zinc-600 group-hover:text-zinc-400" />
              </motion.div>
            )}
            {isSidebarCollapsed && <Menu size={14} className="mx-auto text-zinc-600" />}
          </div>
          
          <motion.nav 
            initial={false}
            animate={{ 
              height: !isSidebarCollapsed && !isNavExpanded ? 0 : 'auto',
              opacity: !isSidebarCollapsed && !isNavExpanded ? 0 : 1
            }}
            className="px-2 py-2 space-y-1 overflow-hidden"
          >
            <button 
              onClick={() => setActiveTab('home')} 
              className={`w-full h-10 px-2 rounded-md transition-all flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} ${activeTab === 'home' ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Layout size={16} className="flex-none"/>
              {!isSidebarCollapsed && <span className="text-[10px] uppercase tracking-widest overflow-hidden whitespace-nowrap">Inicio</span>}
            </button>
            <button 
              onClick={() => setActiveTab('projects')} 
              className={`w-full h-10 px-2 rounded-md transition-all flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} ${activeTab === 'projects' ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <FolderKanban size={16} className="flex-none"/>
              {!isSidebarCollapsed && <span className="text-[10px] uppercase tracking-widest overflow-hidden whitespace-nowrap">Proyectos</span>}
            </button>
            <button 
              onClick={() => setActiveTab('team')} 
              className={`w-full h-10 px-2 rounded-md transition-all flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} ${activeTab === 'team' ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Users size={16} className="flex-none"/>
              {!isSidebarCollapsed && <span className="text-[10px] uppercase tracking-widest overflow-hidden whitespace-nowrap">Equipo</span>}
            </button>
            <button 
              onClick={() => setActiveTab('highlights')} 
              className={`w-full h-10 px-2 rounded-md transition-all flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} ${activeTab === 'highlights' ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Layout size={16} className="flex-none"/>
              {!isSidebarCollapsed && <span className="text-[10px] uppercase tracking-widest overflow-hidden whitespace-nowrap">Highlights</span>}
            </button>
            <button 
              onClick={() => setActiveTab('services')} 
              className={`w-full h-10 px-2 rounded-md transition-all flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} ${activeTab === 'services' ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Layout size={16} className="flex-none"/>
              {!isSidebarCollapsed && <span className="text-[10px] uppercase tracking-widest overflow-hidden whitespace-nowrap">Servicios</span>}
            </button>
            <button 
              onClick={() => setActiveTab('contact')} 
              className={`w-full h-10 px-2 rounded-md transition-all flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} ${activeTab === 'contact' ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Phone size={16} className="flex-none"/>
              {!isSidebarCollapsed && <span className="text-[10px] uppercase tracking-widest overflow-hidden whitespace-nowrap">Contacto</span>}
            </button>

            {/* Special Section for Admin Access */}
            {(userEmail?.toLowerCase().trim() === 'it@corpocrea.com' || userEmail?.toLowerCase().trim() === 'j.montilla@corpocrea.com') && (
              <div className={`pt-2 mt-2 border-t border-white/5 ${isSidebarCollapsed ? 'flex flex-col items-center' : 'space-y-1'}`}>
                {!isSidebarCollapsed && <p className="px-3 text-[7px] uppercase tracking-[0.2em] text-blue-400 font-bold mb-1">Admin</p>}
                <button 
                  onClick={() => setActiveTab('access')} 
                  className={`w-full h-10 px-2 rounded-md transition-all flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} ${activeTab === 'access' ? 'bg-blue-600 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-blue-400/60 hover:text-blue-400 hover:bg-blue-600/10'}`}
                  title={isSidebarCollapsed ? "Gestionar Usuarios" : undefined}
                >
                  <Shield size={16} className="flex-none"/>
                  {!isSidebarCollapsed && <span className="text-[10px] uppercase tracking-widest overflow-hidden whitespace-nowrap">Usuarios</span>}
                </button>
              </div>
            )}
          </motion.nav>
        </div>

        {/* Form Area - ONLY VISIBLE IF NOT COLLAPSED OR IF EDITOR IS ACTIVE? */}
        {/* Actually, the user might want the sidebar to COMPLETELY collapse the form too. */}
        {/* But usually, sidebar means nav. If form area is also in sidebar, it should be hidden. */}
        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto p-6 custom-scrollbar"
            >
          
          {activeEditor && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  Editando: {
                    activeEditor.element === 'background' ? 'Fondo Principal' : 
                    activeEditor.element === 'pretitle' ? 'Pre-título Superior' : 
                    activeEditor.element === 'filters' ? 'Filtros de Proyectos' : 
                    activeEditor.element === 'member' ? 'Miembro del Equipo' : 
                    activeEditor.element === 'project' ? 'Proyecto Completo' : 
                    activeEditor.element === 'image' ? 'Imagen del Proyecto' : 
                    activeEditor.element === 'category' ? 'Categoría' : 
                    activeEditor.element === 'description' ? (activeEditor.section === 'services' ? 'Descripción Servicios' : activeEditor.section === 'contact' ? 'Descripción Contacto' : activeEditor.section === 'team' ? 'Descripción Equipo' : 'Descripción') : 
                    activeEditor.element === 'title' ? (
                      activeEditor.section === 'services' ? 'Título Servicios' : 
                      activeEditor.section === 'home' ? 'Título Principal' : 
                      activeEditor.section === 'contact' ? 'Título Contacto' : 
                      activeEditor.section === 'team' ? 'Título Equipo' : 
                      activeEditor.section === 'highlights' ? (activeEditor.projectId ? (activeEditor.element === 'body' ? 'Cuerpo del Highlight' : 'Título del Highlight') : 'Título de Highlights') :
                      'Título del Proyecto'
                    ) :
                    activeEditor.element === 'body' ? 'Cuerpo del Highlight' :
                    activeEditor.element === 'subtitle' ? (activeEditor.section === 'home' ? 'Subtítulo Principal' : activeEditor.section === 'contact' ? 'Subtítulo Contacto' : activeEditor.section === 'team' ? 'Subtítulo Equipo' : 'Subtítulo del Proyecto') :
                    activeEditor.element === 'buttons' ? 'Botones de Servicios' :
                    activeEditor.element === 'stats' ? 'Estadísticas de Servicios' :
                    activeEditor.element === 'video' ? 'Video de Servicios' :
                    activeEditor.element.startsWith('image_') ? 'Imagen de Servicios' :
                    activeEditor.element
                  }
                </h3>
                <button onClick={() => setActiveEditor(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
              </div>
              
              {activeEditor.element === 'logo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Logo (Imagen)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleFileUpload(e, url => updateSetting('logo_url', url))}
                      disabled={isUploading}
                      className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer disabled:opacity-50" 
                    />
                    {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest mt-2">Subiendo archivo...</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Texto Alt del Logo</label>
                    <input value={draftSettings.logo_alt || ''} onChange={e => updateSetting('logo_alt', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" placeholder="ETC PROYECTO" />
                  </div>
                </div>
              )}

              {/* Quick Editor for Project Elements (Integrated) */}
              {(activeEditor.section === 'projects' || activeEditor.element === 'project' || activeEditor.element === 'image') && editingProject && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/10 pb-2">Edición: {editingProject.title_es || editingProject.title || 'Proyecto'}</h3>
                  
                  {/* Show Image Upload if specifically editing image OR as part of project edit */}
                  {(activeEditor.element === 'image' || activeEditor.element === 'project') && (
                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Foto de Fondo del Proyecto</label>
                      <div className="space-y-3">
                        <div 
                          onClick={() => document.getElementById('quick-project-upload')?.click()}
                          className="w-full h-48 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer shadow-2xl"
                        >
                          {(editingProject.image_url || editingProject.image) ? (
                            <>
                              {String(editingProject.image_url || editingProject.image).match(/\.(mp4|webm|ogg)$/i) ? (
                                <video src={editingProject.image_url || editingProject.image} className="w-full h-full object-cover opacity-60" autoPlay muted loop />
                              ) : (
                                <img src={editingProject.image_url || editingProject.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="Preview" />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] uppercase tracking-widest bg-black/60 text-white px-4 py-2 rounded group-hover:bg-white group-hover:text-black transition-all font-bold">Cambiar Foto</span>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                              <Plus size={24} />
                              <span className="text-[9px] uppercase tracking-widest">Añadir Imagen</span>
                            </div>
                          )}
                        </div>
                        <input 
                          id="quick-project-upload"
                          type="file" 
                          accept="image/*,video/*"
                          onChange={e => handleFileUpload(e, url => setEditingProject({...editingProject, image_url: url}))}
                          disabled={isUploading}
                          className="hidden" 
                        />
                        {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest italic">Subiendo archivo...</p>}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {(activeEditor.element === 'title' || activeEditor.element === 'project') && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold text-blue-400">Título (ES)</label>
                        <input value={editingProject.title_es || ''} onChange={e=>setEditingProject({...editingProject, title_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                      </div>
                    )}
                    {(activeEditor.element === 'category' || activeEditor.element === 'project') && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold text-blue-400">Categoría (ES)</label>
                        <input value={editingProject.category_es || ''} onChange={e=>setEditingProject({...editingProject, category_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                      </div>
                    )}
                    {(activeEditor.element === 'description' || activeEditor.element === 'project') && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold text-blue-400">Descripción (ES)</label>
                        <textarea value={editingProject.description_es || ''} onChange={e=>setEditingProject({...editingProject, description_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 h-24 resize-none" />
                      </div>
                    )}
                    
                    {activeEditor.element === 'project' && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Asignar a Filtros</label>
                        <div className="flex flex-wrap gap-2">
                          {(draftSettings.project_filters || [])
                            .filter((f: any) => f.id !== 'all')
                            .map((f: any) => {
                              const isSelected = (editingProject.status || '').split(',').map((s:string)=>s.trim()).includes(f.id);
                              return (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => {
                                    let currentValue = editingProject.status || '';
                                    let current = currentValue.split(',').map((s:string)=>s.trim()).filter((s:string)=>s !== '');
                                    if (isSelected) {
                                      current = current.filter((s:string)=>s !== f.id);
                                    } else {
                                      current.push(f.id);
                                    }
                                    setEditingProject({...editingProject, status: current.join(',')});
                                  }}
                                  className={`px-3 py-1 rounded-full border text-[9px] uppercase tracking-widest transition-colors ${isSelected ? 'bg-white text-black border-white font-bold' : 'bg-black text-gray-500 border-white/10 hover:border-white/30'}`}
                                >
                                  {f.label_es}
                                </button>
                              );
                            })
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                    <button 
                      onClick={() => handleSave()}
                      disabled={isSaving}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded text-[10px] uppercase tracking-widest font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Cambios del Proyecto'}
                    </button>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed text-center">
                      Los cambios se verán reflejados al guardar. Puedes editar Detalles Avanzados en la pestaña "Proyectos".
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Editor for Highlight Elements (Integrated) */}
              {(activeEditor.section === 'highlights' || activeEditor.element === 'highlight') && editingHighlight && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/10 pb-2">Edición: {editingHighlight.title_es || editingHighlight.title || 'Highlight'}</h3>
                  
                  {/* Image & Video Edit */}
                  {(activeEditor.element === 'image' || activeEditor.element === 'highlight') && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold text-blue-400">Imagen de Portada (JPG/PNG)</label>
                        <div className="space-y-3">
                          <div 
                            onClick={() => document.getElementById('quick-highlight-upload')?.click()}
                            className="w-full h-48 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer shadow-2xl"
                          >
                            {(editingHighlight.image_url || editingHighlight.image) ? (
                              <>
                                <img src={editingHighlight.image_url || editingHighlight.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="Preview" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-[10px] uppercase tracking-widest bg-black/60 text-white px-4 py-2 rounded group-hover:bg-white group-hover:text-black transition-all font-bold">Cambiar Imagen</span>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10">
                                <Plus size={24} className="mb-2" />
                                <span className="text-[10px] uppercase tracking-widest">Subir Imagen</span>
                              </div>
                            )}
                          </div>
                          <input 
                            id="quick-highlight-upload"
                            type="file" 
                            accept="image/*"
                            onChange={e => handleFileUpload(e, url => setEditingHighlight({...editingHighlight, image_url: url, image: url}))}
                            disabled={isUploading}
                            className="hidden" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold text-blue-400">Video Principal (MP4)</label>
                        <div className="space-y-3">
                          <div 
                            onClick={() => document.getElementById('quick-highlight-video-upload')?.click()}
                            className="w-full h-32 bg-black border border-white/10 rounded flex flex-col items-center justify-center relative group cursor-pointer"
                          >
                            {editingHighlight.video_url ? (
                              <div className="flex flex-col items-center gap-2">
                                <Film size={20} className="text-emerald-500" />
                                <span className="text-[8px] text-gray-400 uppercase tracking-widest">Video Cargado</span>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-[10px] uppercase tracking-widest text-white font-bold">Cambiar Video</span>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Film size={24} className="mb-2 text-gray-600" />
                                <span className="text-[10px] uppercase tracking-widest text-gray-600">Subir Video</span>
                              </>
                            )}
                          </div>
                          <input 
                            id="quick-highlight-video-upload"
                            type="file" 
                            accept="video/*"
                            onChange={e => handleFileUpload(e, url => setEditingHighlight({...editingHighlight, video_url: url}))}
                            disabled={isUploading}
                            className="hidden" 
                          />
                        </div>
                      </div>

                      {/* Gallery Images */}
                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold text-blue-400">Mini Galería</label>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Gallery 1 */}
                          <div className="space-y-2">
                            <div 
                              onClick={() => document.getElementById('high-gal-1')?.click()}
                              className="aspect-square bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
                            >
                              {editingHighlight.gallery_url_1 ? (
                                <img src={editingHighlight.gallery_url_1} className="w-full h-full object-cover opacity-50" alt="Gal 1" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><Plus size={16} /></div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[8px] font-bold text-white uppercase">Upload</span>
                              </div>
                            </div>
                            <input id="high-gal-1" type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, url => setEditingHighlight({...editingHighlight, gallery_url_1: url}))} />
                            <p className="text-[8px] text-center text-gray-600 uppercase tracking-widest">Imagen 1</p>
                          </div>

                          {/* Gallery 2 */}
                          <div className="space-y-2">
                            <div 
                              onClick={() => document.getElementById('high-gal-2')?.click()}
                              className="aspect-square bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
                            >
                              {editingHighlight.gallery_url_2 ? (
                                <img src={editingHighlight.gallery_url_2} className="w-full h-full object-cover opacity-50" alt="Gal 2" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><Plus size={16} /></div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[8px] font-bold text-white uppercase">Upload</span>
                              </div>
                            </div>
                            <input id="high-gal-2" type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, url => setEditingHighlight({...editingHighlight, gallery_url_2: url}))} />
                            <p className="text-[8px] text-center text-gray-600 uppercase tracking-widest">Imagen 2</p>
                          </div>
                        </div>
                      </div>
                      
                      {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest italic">Subiendo archivo...</p>}
                    </div>
                  )}

                  <div className="space-y-4">
                    {(activeEditor.element === 'title' || activeEditor.element === 'highlight') && (
                      <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold text-blue-400">Título (ES)</label>
                          <input value={editingHighlight.title_es || ''} onChange={e=>setEditingHighlight({...editingHighlight, title_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold text-blue-400">Título (EN)</label>
                          <input value={editingHighlight.title_en || editingHighlight.title || ''} onChange={e=>setEditingHighlight({...editingHighlight, title_en: e.target.value, title: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                        </div>
                      </div>
                    )}
                    {(activeEditor.element === 'category' || activeEditor.element === 'highlight') && (
                      <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold text-blue-400">Categoría (ES)</label>
                          <input value={editingHighlight.category_es || ''} onChange={e=>setEditingHighlight({...editingHighlight, category_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold text-blue-400">Categoría (EN)</label>
                          <input value={editingHighlight.category_en || editingHighlight.category || ''} onChange={e=>setEditingHighlight({...editingHighlight, category_en: e.target.value, category: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                        </div>
                      </div>
                    )}
                    {(activeEditor.element === 'description' || activeEditor.element === 'highlight') && (
                      <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold text-blue-400">Descripción (ES)</label>
                          <textarea value={editingHighlight.description_es || ''} onChange={e=>setEditingHighlight({...editingHighlight, description_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 h-24 resize-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold text-blue-400">Descripción (EN)</label>
                          <textarea value={editingHighlight.description_en || editingHighlight.description || ''} onChange={e=>setEditingHighlight({...editingHighlight, description_en: e.target.value, description: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 h-24 resize-none" />
                        </div>
                      </div>
                    )}
                    {(activeEditor.element === 'body' || activeEditor.element === 'highlight') && (
                      <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold text-blue-400">Cuerpo / Texto Secundario (ES)</label>
                          <textarea value={editingHighlight.body_es || ''} onChange={e=>setEditingHighlight({...editingHighlight, body_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 h-32 resize-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold text-blue-400">Cuerpo / Texto Secundario (EN)</label>
                          <textarea value={editingHighlight.body_en || editingHighlight.body || ''} onChange={e=>setEditingHighlight({...editingHighlight, body_en: e.target.value, body: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 h-32 resize-none" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                    <button 
                      onClick={() => handleSave()}
                      disabled={isSaving}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded text-[10px] uppercase tracking-widest font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Cambios del Highlight'}
                    </button>
                  </div>
                </div>
              )}

              {activeEditor.element === 'pretitle' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Pre-título (EN)</label>
                    <input value={draftSettings.home_pretitle_en || ''} onChange={e => updateSetting('home_pretitle_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Pre-título (ES)</label>
                    <input value={draftSettings.home_pretitle_es || ''} onChange={e => updateSetting('home_pretitle_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'filters' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Gestiona las categorías de filtrado de proyectos.</p>
                    <button 
                      onClick={(e) => { e.preventDefault(); addFilter(); }}
                      className="flex items-center gap-1 text-[9px] uppercase tracking-widest bg-blue-500 text-white px-3 py-1.5 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <Plus size={12} /> Añadir Filtro
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {(draftSettings.project_filters || []).map((filter: any, index: number) => (
                      <div key={filter.id} className="p-4 bg-black/40 border border-white/5 rounded-lg space-y-3 relative group">
                        {filter.id !== 'all' && (
                          <button 
                            onClick={(e) => { e.preventDefault(); removeFilter(filter.id); }}
                            className="absolute top-2 right-2 text-red-500/50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-1">Nombre (EN)</label>
                            <input 
                              value={filter.label_en || ''} 
                              onChange={e => updateFilterEntry(index, 'label_en', e.target.value)}
                              className="w-full bg-black border border-white/10 rounded p-2 text-[10px] outline-none focus:border-white/30" 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-1">Nombre (ES)</label>
                            <input 
                              value={filter.label_es || ''} 
                              onChange={e => updateFilterEntry(index, 'label_es', e.target.value)}
                              className="w-full bg-black border border-white/10 rounded p-2 text-[10px] outline-none focus:border-white/30" 
                            />
                          </div>
                        </div>
                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest italic">
                          ID Técnico: {filter.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeEditor.element === 'title' && activeEditor.section === 'home' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Principal (EN)</label>
                    <input value={draftSettings.home_title_en || ''} onChange={e => updateSetting('home_title_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Principal (ES)</label>
                    <input value={draftSettings.home_title_es || ''} onChange={e => updateSetting('home_title_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'title' && activeEditor.section === 'team' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Equipo (EN)</label>
                    <textarea value={draftSettings.team_title_en || ''} onChange={e => updateSetting('team_title_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Equipo (ES)</label>
                    <textarea value={draftSettings.team_title_es || ''} onChange={e => updateSetting('team_title_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'subtitle' && activeEditor.section === 'team' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subtítulo Equipo (EN)</label>
                    <input value={draftSettings.team_subtitle_en || ''} onChange={e => updateSetting('team_subtitle_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subtítulo Equipo (ES)</label>
                    <input value={draftSettings.team_subtitle_es || ''} onChange={e => updateSetting('team_subtitle_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'description' && activeEditor.section === 'team' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción Equipo (EN)</label>
                    <textarea value={draftSettings.team_description_en || ''} onChange={e => updateSetting('team_description_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-32 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción Equipo (ES)</label>
                    <textarea value={draftSettings.team_description_es || ''} onChange={e => updateSetting('team_description_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-32 resize-none" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'tags' && activeEditor.section === 'team' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Tags Equipo (EN) - Separados por coma</label>
                    <input value={draftSettings.team_tags_en || ''} onChange={e => updateSetting('team_tags_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" placeholder="Engineering, Architecture, Design" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Tags Equipo (ES) - Separados por coma</label>
                    <input value={draftSettings.team_tags_es || ''} onChange={e => updateSetting('team_tags_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" placeholder="Ingeniería, Arquitectura, Diseño" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'title' && activeEditor.section === 'contact' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Contacto (EN)</label>
                    <textarea value={draftSettings.contact_title_en !== undefined ? draftSettings.contact_title_en : defaultSettings.contact_title_en} onChange={e => updateSetting('contact_title_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Contacto (ES)</label>
                    <textarea value={draftSettings.contact_title_es !== undefined ? draftSettings.contact_title_es : defaultSettings.contact_title_es} onChange={e => updateSetting('contact_title_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'subtitle' && activeEditor.section === 'contact' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subtítulo Contacto (EN)</label>
                    <input value={draftSettings.contact_subtitle_en !== undefined ? draftSettings.contact_subtitle_en : defaultSettings.contact_subtitle_en} onChange={e => updateSetting('contact_subtitle_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subtítulo Contacto (ES)</label>
                    <input value={draftSettings.contact_subtitle_es !== undefined ? draftSettings.contact_subtitle_es : defaultSettings.contact_subtitle_es} onChange={e => updateSetting('contact_subtitle_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'description' && activeEditor.section === 'contact' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción Contacto (EN)</label>
                    <textarea value={draftSettings.contact_description_en !== undefined ? draftSettings.contact_description_en : defaultSettings.contact_description_en} onChange={e => updateSetting('contact_description_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-32 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción Contacto (ES)</label>
                    <textarea value={draftSettings.contact_description_es !== undefined ? draftSettings.contact_description_es : defaultSettings.contact_description_es} onChange={e => updateSetting('contact_description_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-32 resize-none" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'title' && activeEditor.section === 'services' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título (EN)</label>
                    <textarea value={draftSettings.services_title_en !== undefined ? draftSettings.services_title_en : defaultSettings.services_title_en} onChange={e => updateSetting('services_title_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-16 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título (ES)</label>
                    <textarea value={draftSettings.services_title_es !== undefined ? draftSettings.services_title_es : defaultSettings.services_title_es} onChange={e => updateSetting('services_title_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-16 resize-none" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'description' && activeEditor.section === 'services' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción (EN)</label>
                    <textarea value={draftSettings.services_description_en !== undefined ? draftSettings.services_description_en : defaultSettings.services_description_en} onChange={e => updateSetting('services_description_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción (ES)</label>
                    <textarea value={draftSettings.services_description_es !== undefined ? draftSettings.services_description_es : defaultSettings.services_description_es} onChange={e => updateSetting('services_description_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'buttons' && activeEditor.section === 'services' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Botón 1 (EN)</label>
                    <input value={draftSettings.services_btn1_en !== undefined ? draftSettings.services_btn1_en : defaultSettings.services_btn1_en} onChange={e => updateSetting('services_btn1_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Botón 1 (ES)</label>
                    <input value={draftSettings.services_btn1_es !== undefined ? draftSettings.services_btn1_es : defaultSettings.services_btn1_es} onChange={e => updateSetting('services_btn1_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Botón 2 (EN)</label>
                    <input value={draftSettings.services_btn2_en !== undefined ? draftSettings.services_btn2_en : defaultSettings.services_btn2_en} onChange={e => updateSetting('services_btn2_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Botón 2 (ES)</label>
                    <input value={draftSettings.services_btn2_es !== undefined ? draftSettings.services_btn2_es : defaultSettings.services_btn2_es} onChange={e => updateSetting('services_btn2_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'video' && activeEditor.section === 'services' && (
                <div className="space-y-4">
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Video de Servicios</label>
                  <div 
                    className="w-full h-48 bg-black border border-white/10 rounded relative overflow-hidden group cursor-pointer"
                    onClick={() => document.getElementById('services_video_upload_quick')?.click()}
                  >
                    {draftSettings.services_video_url ? (
                        <video 
                          src={draftSettings.services_video_url} 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                          muted
                          loop
                          playsInline
                          autoPlay
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                          <Play size={24} className="opacity-50" />
                          <span className="text-[10px] uppercase tracking-widest">Sin video</span>
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] uppercase tracking-widest font-bold bg-black/60 px-3 py-2 rounded">
                          {isUploading ? 'Subiendo...' : 'Subir desde archivo'}
                        </span>
                    </div>
                  </div>
                  <input 
                    id="services_video_upload_quick"
                    type="file" 
                    accept="video/*"
                    onChange={e => handleFileUpload(e, url => updateSetting('services_video_url', url))}
                    disabled={isUploading}
                    className="hidden" 
                  />
                </div>
              )}

              {activeEditor.element.startsWith('image_') && activeEditor.section === 'services' && (
                <div className="space-y-4">
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Imagen de Servicios ({activeEditor.element})</label>
                  <div 
                    className="w-full h-48 bg-black border border-white/10 rounded relative overflow-hidden group cursor-pointer"
                    onClick={() => document.getElementById(`services_${activeEditor.element}_quick`)?.click()}
                  >
                    {draftSettings[`services_${activeEditor.element}`] !== undefined ? (
                      <img src={draftSettings[`services_${activeEditor.element}`] || defaultSettings[`services_${activeEditor.element}` as keyof typeof defaultSettings] as string} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    ) : (
                      <img src={defaultSettings[`services_${activeEditor.element}` as keyof typeof defaultSettings] as string} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] uppercase tracking-widest font-bold bg-black/60 px-2 py-1 rounded">Cambiar</span>
                    </div>
                  </div>
                  <input 
                      id={`services_${activeEditor.element}_quick`}
                      type="file" 
                      accept="image/*"
                      onChange={e => handleFileUpload(e, url => updateSetting(`services_${activeEditor.element}`, url))}
                      disabled={isUploading}
                      className="hidden" 
                  />
                </div>
              )}

              {activeEditor.element === 'stats' && activeEditor.section === 'services' && (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-3">
                      <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Estadística {num}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-1">Valor</label>
                          <input value={draftSettings[`services_stat${num}_value`] !== undefined ? draftSettings[`services_stat${num}_value`] : defaultSettings[`services_stat${num}_value` as keyof typeof defaultSettings]} onChange={e => updateSetting(`services_stat${num}_value`, e.target.value)} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-1">Etiq. (EN)</label>
                          <input value={draftSettings[`services_stat${num}_label_en`] !== undefined ? draftSettings[`services_stat${num}_label_en`] : defaultSettings[`services_stat${num}_label_en` as keyof typeof defaultSettings]} onChange={e => updateSetting(`services_stat${num}_label_en`, e.target.value)} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-1">Etiq. (ES)</label>
                          <input value={draftSettings[`services_stat${num}_label_es`] !== undefined ? draftSettings[`services_stat${num}_label_es`] : defaultSettings[`services_stat${num}_label_es` as keyof typeof defaultSettings]} onChange={e => updateSetting(`services_stat${num}_label_es`, e.target.value)} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeEditor.element === 'subtitle' && activeEditor.section !== 'team' && activeEditor.section !== 'contact' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subtítulo (EN)</label>
                    <textarea value={draftSettings.home_subtitle_en || ''} onChange={e => updateSetting('home_subtitle_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-20 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subtítulo (ES)</label>
                    <textarea value={draftSettings.home_subtitle_es || ''} onChange={e => updateSetting('home_subtitle_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-20 resize-none" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'title' && activeEditor.section === 'highlights' && !activeEditor.projectId && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título de Highlights (EN)</label>
                    <textarea value={draftSettings.highlights_title_en || ''} onChange={e => updateSetting('highlights_title_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título de Highlights (ES)</label>
                    <textarea value={draftSettings.highlights_title_es || ''} onChange={e => updateSetting('highlights_title_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                </div>
              )}

              {activeEditor.element === 'background' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Media Actual de Fondo</label>
                    <div className="space-y-3">
                      <div 
                        onClick={() => document.getElementById('home-bg-upload-input')?.click()}
                        className="w-full h-48 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
                      >
                        {draftSettings.home_bg_image ? (
                          <>
                            {draftSettings.home_bg_image.match(/\.(mp4|webm|ogg)$/i) ? (
                              <video src={draftSettings.home_bg_image} className="w-full h-full object-cover opacity-60" autoPlay muted loop />
                            ) : (
                              <img src={draftSettings.home_bg_image} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="Preview" />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-6 text-center">
                            <Video className="w-8 h-8 text-white/20 mb-2" />
                            <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Vídeo por Defecto Activo</p>
                            <p className="text-[8px] uppercase tracking-widest text-white/20">(YouTube Iframe)</p>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] uppercase tracking-widest bg-white text-black px-4 py-2 rounded-full font-bold">Subir Nueva Media</span>
                        </div>
                      </div>
                      
                      <input 
                        id="home-bg-upload-input"
                        type="file" 
                        accept="image/*,video/*"
                        onChange={e => handleFileUpload(e, url => updateSetting('home_bg_image', url))}
                        disabled={isUploading}
                        className="hidden" 
                      />
                      
                      {draftSettings.home_bg_image && (
                        <button 
                          onClick={() => updateSetting('home_bg_image', null)}
                          className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] uppercase tracking-widest rounded transition-colors"
                        >
                          Restaurar Vídeo Original
                        </button>
                      )}
                      
                      {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest">Subiendo archivo...</p>}
                    </div>
                  </div>
                  
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed border-t border-white/5 pt-4">
                    Puedes subir imágenes de alta resolución (JPG, PNG) o archivos de vídeo cortos (MP4) para el fondo.
                  </p>
                </div>
              )}

              {activeEditor.element === 'info' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Email</label>
                    <input value={draftSettings.contact_email || ''} onChange={e => updateSetting('contact_email', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Teléfono</label>
                    <input value={draftSettings.contact_phone || ''} onChange={e => updateSetting('contact_phone', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Dirección</label>
                    <textarea value={draftSettings.contact_address || ''} onChange={e => updateSetting('contact_address', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                </div>
              )}
              
              {/* Quick Editor for Team Members */}
              {activeEditor.element === 'member' && editingMember && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/10 pb-2">Edición Rápida: {editingMember.name || 'Miembro'}</h3>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Foto del Miembro</label>
                    <div className="space-y-3">
                      {(editingMember.image_url || editingMember.image) && (
                        <div 
                          onClick={() => document.getElementById('quick-member-upload')?.click()}
                          className="w-full h-40 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
                        >
                          <img src={editingMember.image_url || editingMember.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="Preview" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] uppercase tracking-widest bg-black/50 px-2 py-1 rounded group-hover:bg-white group-hover:text-black transition-colors">Cambiar Foto</span>
                          </div>
                        </div>
                      )}
                      <input 
                        id="quick-member-upload"
                        type="file" 
                        accept="image/*"
                        onChange={e => handleFileUpload(e, url => setEditingMember({...editingMember, image_url: url}))}
                        disabled={isUploading}
                        className="hidden" 
                      />
                      {!(editingMember.image_url || editingMember.image) && (
                        <button 
                          onClick={() => document.getElementById('quick-member-upload')?.click()}
                          className="w-full py-8 border border-dashed border-white/20 rounded flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-white/40 transition-all"
                        >
                          <Plus size={20} />
                          <span className="text-[10px] uppercase tracking-widest">Subir Foto</span>
                        </button>
                      )}
                      {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest">Subiendo foto...</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <input type="checkbox" id="is_ceo_quick" checked={editingMember.is_ceo || false} onChange={e => setEditingMember({...editingMember, is_ceo: e.target.checked})} className="rounded bg-black border-white/20 text-blue-500 focus:ring-blue-500" />
                       <label htmlFor="is_ceo_quick" className="text-[10px] uppercase tracking-widest text-gray-500">¿Es CEO? (Visible por defecto al abrir)</label>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Nombre</label>
                      <input value={editingMember.name || ''} onChange={e=>setEditingMember({...editingMember, name: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Rol (EN)</label>
                      <input value={editingMember.role_en || ''} onChange={e=>setEditingMember({...editingMember, role_en: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Rol (ES)</label>
                      <input value={editingMember.role_es || ''} onChange={e=>setEditingMember({...editingMember, role_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                    </div>
                  </div>

                  <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">
                    Para editar el orden de aparición o eliminar al miembro, usa la pestaña "Equipo" abajo.
                  </p>
                </div>
              )}
            </div>
          )}

          {(!activeEditor || ['project', 'member', 'filters', 'highlight', 'new_highlight'].includes(activeEditor.element)) && activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Principal (EN)</label>
                <input value={draftSettings.home_title_en || ''} onChange={e => updateSetting('home_title_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Principal (ES)</label>
                <input value={draftSettings.home_title_es || ''} onChange={e => updateSetting('home_title_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Pre-título Superior (EN)</label>
                <input value={draftSettings.home_pretitle_en || ''} onChange={e => updateSetting('home_pretitle_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Pre-título Superior (ES)</label>
                <input value={draftSettings.home_pretitle_es || ''} onChange={e => updateSetting('home_pretitle_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subtítulo (EN)</label>
                <textarea value={draftSettings.home_subtitle_en || ''} onChange={e => updateSetting('home_subtitle_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-20 resize-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subtítulo (ES)</label>
                <textarea value={draftSettings.home_subtitle_es || ''} onChange={e => updateSetting('home_subtitle_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-20 resize-none" />
              </div>
              <div className="pt-4 border-t border-white/10">
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Media de Fondo (Imagen o Vídeo)</label>
                <div className="space-y-3">
                  <div 
                    onClick={() => document.getElementById('home-bg-upload-main')?.click()}
                    className="w-full h-32 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
                  >
                    {draftSettings.home_bg_image ? (
                      <>
                        {draftSettings.home_bg_image.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={draftSettings.home_bg_image} className="w-full h-full object-cover opacity-50" autoPlay muted loop />
                        ) : (
                          <img src={draftSettings.home_bg_image} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="Preview" />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-4 text-center">
                        <Video className="w-6 h-6 text-white/20 mb-1" />
                        <p className="text-[8px] uppercase tracking-widest text-white/40">Vídeo por Defecto</p>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] uppercase tracking-widest bg-white text-black px-3 py-1.5 rounded font-bold">Cambiar Media</span>
                    </div>
                  </div>
                  
                  <input 
                    id="home-bg-upload-main"
                    type="file" 
                    accept="image/*,video/*"
                    onChange={e => handleFileUpload(e, url => updateSetting('home_bg_image', url))}
                    disabled={isUploading}
                    className="hidden" 
                  />
                  
                  {draftSettings.home_bg_image && (
                    <button 
                      onClick={() => updateSetting('home_bg_image', null)}
                      className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] uppercase tracking-widest rounded transition-colors"
                    >
                      Restaurar Vídeo Original
                    </button>
                  )}
                  {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest">Subiendo archivo...</p>}
                </div>
              </div>
            </div>
          )}

          {(!activeEditor || ['project', 'member', 'filters', 'highlight', 'new_highlight'].includes(activeEditor.element)) && activeTab === 'team' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              {editingMember ? (
                <form onSubmit={saveMember} className="space-y-4">
                  <button type="button" onClick={() => setEditingMember(null)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white mb-4 flex items-center gap-1"><X size={12}/> Descartar / Volver</button>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Nombre</label>
                    <input required value={editingMember.name || ''} onChange={e=>setEditingMember({...editingMember, name: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div className="flex items-center gap-2 mt-2 mb-4">
                     <input type="checkbox" id="is_ceo_main" checked={editingMember.is_ceo || false} onChange={e => setEditingMember({...editingMember, is_ceo: e.target.checked})} className="rounded bg-black border-white/20 text-blue-500 focus:ring-blue-500" />
                     <label htmlFor="is_ceo_main" className="text-[10px] uppercase tracking-widest text-gray-500">Es CEO (Visible inicialmente)</label>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Rol (EN)</label>
                    <input required value={editingMember.role_en || ''} onChange={e=>setEditingMember({...editingMember, role_en: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Rol (ES)</label>
                    <input required value={editingMember.role_es || ''} onChange={e=>setEditingMember({...editingMember, role_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Orden</label>
                    <input type="number" value={editingMember.order || 0} onChange={e=>setEditingMember({...editingMember, order: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Foto del Miembro</label>
                    <div className="space-y-3">
                      {(editingMember.image_url || editingMember.image) && (
                        <div 
                          onClick={() => document.getElementById('member-upload-input')?.click()}
                          className="w-full h-32 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
                        >
                          <img src={editingMember.image_url || editingMember.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="Preview" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] uppercase tracking-widest bg-black/50 px-2 py-1 rounded group-hover:bg-white group-hover:text-black transition-colors">Cambiar Foto</span>
                          </div>
                        </div>
                      )}
                      <input 
                        id="member-upload-input"
                        type="file" 
                        accept="image/*"
                        onChange={e => handleFileUpload(e, url => setEditingMember({...editingMember, image_url: url}))}
                        disabled={isUploading}
                        className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer disabled:opacity-50" 
                      />
                      {!(editingMember.image_url || editingMember.image) && (
                        <button 
                          onClick={() => document.getElementById('member-upload-input')?.click()}
                          className="w-full py-8 border border-dashed border-white/20 rounded flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-white/40 transition-all"
                        >
                          <Plus size={20} />
                          <span className="text-[10px] uppercase tracking-widest">Subir Foto</span>
                        </button>
                      )}
                      {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest">Subiendo foto...</p>}
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full bg-white text-black text-[10px] font-bold uppercase tracking-widest py-3 rounded hover:bg-gray-200 mt-4">Guardar Miembro</button>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Team Settings */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/10 pb-2">Ajustes de Sección</h3>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Equipo (ES)</label>
                      <textarea value={draftSettings.team_title_es || ''} onChange={e => updateSetting('team_title_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-20 resize-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción Equipo (ES)</label>
                      <textarea value={draftSettings.team_description_es || ''} onChange={e => updateSetting('team_description_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Tags Equipo (ES)</label>
                      <input value={draftSettings.team_tags_es || ''} onChange={e => updateSetting('team_tags_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                    </div>
                  </div>

                  {/* Team Members List */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/10 pb-2">Miembros del Equipo</h3>
                    <button onClick={() => setEditingMember({ order: teamMembers.length })} className="w-full border border-dashed border-white/20 rounded-lg p-4 text-xs text-gray-400 hover:text-white hover:border-white/50 flex flex-col items-center justify-center gap-2 transition-colors">
                      <Plus size={16} /> Nuevo Miembro
                    </button>
                    
                    <div className="space-y-3">
                      {teamMembers.map(m => (
                        <div key={m.id} className="bg-black border border-white/10 rounded p-3 flex flex-col group">
                          {memberToDelete === m.id ? (
                            <div className="flex flex-col gap-3">
                              <p className="text-xs text-center text-red-400 font-bold">¿Seguro que deseas eliminar este miembro?</p>
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => setMemberToDelete(null)} className="px-3 py-1.5 text-[10px] uppercase tracking-widest bg-white/10 rounded hover:bg-white/20 transition-colors">Cancelar</button>
                                <button onClick={() => deleteMember(m.id)} className="px-3 py-1.5 text-[10px] uppercase tracking-widest bg-red-500 text-white rounded hover:bg-red-600 transition-colors">Confirmar</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 truncate pr-4">
                                <img src={m.image_url || m.image} className="w-8 h-8 rounded-full object-cover border border-white/10" alt="" />
                                <div className="truncate">
                                  <p className="text-xs font-medium truncate">{m.name}</p>
                                  <p className="text-[10px] text-gray-500 truncate">{m.role_es || m.role}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setEditingMember(m)} className="p-1.5 bg-white/10 rounded hover:bg-white/20"><Edit2 size={12}/></button>
                                <button onClick={() => setMemberToDelete(m.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"><Trash2 size={12}/></button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {(!activeEditor || ['project', 'member', 'filters', 'highlight', 'new_highlight'].includes(activeEditor.element)) && activeTab === 'highlights' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="pb-6 border-b border-white/10 mb-6">
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4">Textos Principales</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Highlights (EN)</label>
                    <textarea value={draftSettings.highlights_title_en ?? ''} onChange={e => updateSetting('highlights_title_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Highlights (ES)</label>
                    <textarea value={draftSettings.highlights_title_es ?? ''} onChange={e => updateSetting('highlights_title_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">
                    Los proyectos mostrados en el carrusel de Highlights se administran a continuación independientemente.
                  </p>
                </div>
              </div>

              {editingHighlight ? (
                <form onSubmit={saveHighlight} className="space-y-4">
                  <button type="button" onClick={() => setEditingHighlight(null)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white mb-4 flex items-center gap-1"><X size={12}/> Descartar / Volver</button>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Título (EN)</label>
                    <input required value={editingHighlight.title_en || editingHighlight.title || ''} onChange={e=>setEditingHighlight({...editingHighlight, title_en: e.target.value, title: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Título (ES)</label>
                    <input required value={editingHighlight.title_es || ''} onChange={e=>setEditingHighlight({...editingHighlight, title_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Categoría (EN)</label>
                    <input required value={editingHighlight.category_en || editingHighlight.category || ''} onChange={e=>setEditingHighlight({...editingHighlight, category_en: e.target.value, category: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Categoría (ES)</label>
                    <input required value={editingHighlight.category_es || ''} onChange={e=>setEditingHighlight({...editingHighlight, category_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Descripción (EN)</label>
                    <textarea value={editingHighlight.description_en || editingHighlight.description || ''} onChange={e=>setEditingHighlight({...editingHighlight, description_en: e.target.value, description: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 h-20 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Descripción (ES)</label>
                    <textarea value={editingHighlight.description_es || ''} onChange={e=>setEditingHighlight({...editingHighlight, description_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 h-20 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Media del Highlight (Imagen)</label>
                    <div className="space-y-3">
                      {(editingHighlight.image_url || editingHighlight.image) && (
                        <div 
                          onClick={() => document.getElementById('highlight-upload-input')?.click()}
                          className="w-full h-32 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
                        >
                          <img src={editingHighlight.image_url || editingHighlight.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="Preview" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] uppercase tracking-widest bg-black/50 px-2 py-1 rounded group-hover:bg-white group-hover:text-black transition-colors">Cambiar Imagen</span>
                          </div>
                        </div>
                      )}
                      <input 
                        id="highlight-upload-input"
                        type="file" 
                        accept="image/*"
                        onChange={e => handleFileUpload(e, url => setEditingHighlight({...editingHighlight, image_url: url, image: url}))}
                        disabled={isUploading}
                        className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer disabled:opacity-50" 
                      />
                      {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest">Subiendo archivo...</p>}
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-white text-black text-[10px] font-bold uppercase tracking-widest py-3 rounded hover:bg-gray-200 mt-4">Guardar Highlight</button>
                </form>
              ) : (
                <div>
                  <button onClick={() => setEditingHighlight({})} className="w-full border border-dashed border-white/20 rounded-lg p-4 text-xs text-gray-400 hover:text-white hover:border-white/50 flex flex-col items-center justify-center gap-2 transition-colors mb-6">
                    <Plus size={16} /> Nuevo Highlight
                  </button>
                  
                  <div className="space-y-3">
                    {highlights.map(h => (
                      <div key={h.id} className="bg-black border border-white/10 rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#111] rounded overflow-hidden shrink-0">
                            {h.image_url || h.image ? (
                              <img src={h.image_url || h.image} alt={h.title_es || h.title} className="w-full h-full object-cover grayscale" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center"><Layout size={14} className="text-gray-500" /></div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white mb-0.5">{h.title_es || h.title}</h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{h.category_es || h.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button onClick={() => setEditingHighlight(h)} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] uppercase tracking-widest bg-white/5 hover:bg-white/10 rounded transition-colors text-white">Editar</button>
                          <button 
                            onClick={async () => {
                              if (confirm('¿Estás seguro de que deseas eliminar este highlight?')) {
                                try {
                                  if (isUUID(h.id)) {
                                    await supabase.from('highlights').delete().eq('id', h.id);
                                  }
                                  await fetchData();
                                  toast.success('Highlight eliminado');
                                } catch (e) {
                                  toast.error('Error al eliminar');
                                }
                              }
                            }}
                            className="p-1.5 text-red-500/50 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(!activeEditor || ['project', 'member', 'filters', 'highlight', 'new_highlight'].includes(activeEditor.element)) && activeTab === 'services' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="pb-6 border-b border-white/10 space-y-6">
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Textos de Servicios</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título (EN)</label>
                    <textarea value={draftSettings.services_title_en !== undefined ? draftSettings.services_title_en : defaultSettings.services_title_en} onChange={e => updateSetting('services_title_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-16 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título (ES)</label>
                    <textarea value={draftSettings.services_title_es !== undefined ? draftSettings.services_title_es : defaultSettings.services_title_es} onChange={e => updateSetting('services_title_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-16 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción (EN)</label>
                    <textarea value={draftSettings.services_description_en !== undefined ? draftSettings.services_description_en : defaultSettings.services_description_en} onChange={e => updateSetting('services_description_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción (ES)</label>
                    <textarea value={draftSettings.services_description_es !== undefined ? draftSettings.services_description_es : defaultSettings.services_description_es} onChange={e => updateSetting('services_description_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                </div>
              </div>

              <div className="pb-6 border-b border-white/10 space-y-6">
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Botones</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Botón 1 (EN)</label>
                    <input value={draftSettings.services_btn1_en !== undefined ? draftSettings.services_btn1_en : defaultSettings.services_btn1_en} onChange={e => updateSetting('services_btn1_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Botón 1 (ES)</label>
                    <input value={draftSettings.services_btn1_es !== undefined ? draftSettings.services_btn1_es : defaultSettings.services_btn1_es} onChange={e => updateSetting('services_btn1_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Botón 2 (EN)</label>
                    <input value={draftSettings.services_btn2_en !== undefined ? draftSettings.services_btn2_en : defaultSettings.services_btn2_en} onChange={e => updateSetting('services_btn2_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Botón 2 (ES)</label>
                    <input value={draftSettings.services_btn2_es !== undefined ? draftSettings.services_btn2_es : defaultSettings.services_btn2_es} onChange={e => updateSetting('services_btn2_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="pb-6 border-b border-white/10 space-y-6">
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Estadísticas</h3>
                
                {[1, 2, 3, 4].map(num => (
                  <div key={num} className="p-4 bg-black/40 border border-white/5 rounded-lg space-y-3">
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Estadística {num}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-1">Valor</label>
                        <input value={draftSettings[`services_stat${num}_value`] !== undefined ? draftSettings[`services_stat${num}_value`] : defaultSettings[`services_stat${num}_value` as keyof typeof defaultSettings]} onChange={e => updateSetting(`services_stat${num}_value`, e.target.value)} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-1">Etiqueta (EN)</label>
                        <input value={draftSettings[`services_stat${num}_label_en`] !== undefined ? draftSettings[`services_stat${num}_label_en`] : defaultSettings[`services_stat${num}_label_en` as keyof typeof defaultSettings]} onChange={e => updateSetting(`services_stat${num}_label_en`, e.target.value)} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-1">Etiqueta (ES)</label>
                        <input value={draftSettings[`services_stat${num}_label_es`] !== undefined ? draftSettings[`services_stat${num}_label_es`] : defaultSettings[`services_stat${num}_label_es` as keyof typeof defaultSettings]} onChange={e => updateSetting(`services_stat${num}_label_es`, e.target.value)} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pb-6 border-b border-white/10 space-y-6">
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Media (Imágenes o Video)</h3>
                
                <div className="space-y-4">
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Tipo de Visualización</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="media_type" 
                        value="collage" 
                        checked={draftSettings.services_media_type !== 'video'} 
                        onChange={() => updateSetting('services_media_type', 'collage')}
                        className="accent-blue-500"
                      />
                      <span className="text-[10px] uppercase tracking-widest text-white/70">Collage Imágenes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="media_type" 
                        value="video" 
                        checked={draftSettings.services_media_type === 'video'} 
                        onChange={() => updateSetting('services_media_type', 'video')}
                        className="accent-blue-500"
                      />
                      <span className="text-[10px] uppercase tracking-widest text-white/70">Video</span>
                    </label>
                  </div>
                </div>

                {draftSettings.services_media_type === 'video' ? (
                  <div className="space-y-4 mt-6">
                     <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Video</label>
                     <div 
                        className="w-full h-48 bg-black border border-white/10 rounded relative overflow-hidden group cursor-pointer mb-4"
                        onClick={() => document.getElementById('services_video_upload')?.click()}
                     >
                        {draftSettings.services_video_url ? (
                           <video 
                              src={draftSettings.services_video_url} 
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                              muted
                              loop
                              playsInline
                              autoPlay
                           />
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                              <Play size={24} className="opacity-50" />
                              <span className="text-[10px] uppercase tracking-widest">Sin video</span>
                           </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-[10px] uppercase tracking-widest font-bold bg-black/60 px-3 py-2 rounded">
                              {isUploading ? 'Subiendo...' : 'Subir desde archivo'}
                           </span>
                        </div>
                     </div>
                     <input 
                        id="services_video_upload"
                        type="file" 
                        accept="video/*"
                        onChange={e => handleFileUpload(e, url => updateSetting('services_video_url', url))}
                        disabled={isUploading}
                        className="hidden" 
                     />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {[1, 2, 3, 4].map(num => (
                      <div key={num} className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Imagen {num}</label>
                        <div 
                          className="w-full h-24 bg-black border border-white/10 rounded relative overflow-hidden group cursor-pointer"
                          onClick={() => document.getElementById(`services_img_${num}`)?.click()}
                        >
                          {draftSettings[`services_image_${num}`] !== undefined ? (
                            <img src={draftSettings[`services_image_${num}`] || defaultSettings[`services_image_${num}` as keyof typeof defaultSettings]} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                          ) : (
                            <img src={defaultSettings[`services_image_${num}` as keyof typeof defaultSettings] as string} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] uppercase tracking-widest font-bold bg-black/60 px-2 py-1 rounded">Cambiar</span>
                          </div>
                        </div>
                        <input 
                           id={`services_img_${num}`}
                           type="file" 
                           accept="image/*"
                           onChange={e => handleFileUpload(e, url => updateSetting(`services_image_${num}`, url))}
                           disabled={isUploading}
                           className="hidden" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {(!activeEditor || ['project', 'member', 'filters', 'highlight', 'new_highlight'].includes(activeEditor.element)) && activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              
              <div className="pb-6 border-b border-white/10 space-y-6">
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Textos Principales</h3>
                 <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Principal (EN)</label>
                    <textarea value={draftSettings.contact_title_en !== undefined ? draftSettings.contact_title_en : defaultSettings.contact_title_en} onChange={e => updateSetting('contact_title_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-16 resize-none" placeholder="LET'S\nCREATE" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Título Principal (ES)</label>
                    <textarea value={draftSettings.contact_title_es !== undefined ? draftSettings.contact_title_es : defaultSettings.contact_title_es} onChange={e => updateSetting('contact_title_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-16 resize-none" placeholder="VAMOS A\nCREAR" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subtítulo (EN)</label>
                    <input value={draftSettings.contact_subtitle_en !== undefined ? draftSettings.contact_subtitle_en : defaultSettings.contact_subtitle_en} onChange={e => updateSetting('contact_subtitle_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" placeholder="GET IN TOUCH" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subtítulo (ES)</label>
                    <input value={draftSettings.contact_subtitle_es !== undefined ? draftSettings.contact_subtitle_es : defaultSettings.contact_subtitle_es} onChange={e => updateSetting('contact_subtitle_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" placeholder="CONTÁCTANOS" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción (EN)</label>
                    <textarea value={draftSettings.contact_description_en !== undefined ? draftSettings.contact_description_en : defaultSettings.contact_description_en} onChange={e => updateSetting('contact_description_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción (ES)</label>
                    <textarea value={draftSettings.contact_description_es !== undefined ? draftSettings.contact_description_es : defaultSettings.contact_description_es} onChange={e => updateSetting('contact_description_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4">Información de Contacto</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Email</label>
                    <input value={draftSettings.contact_email || ''} onChange={e => updateSetting('contact_email', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Teléfono</label>
                    <input value={draftSettings.contact_phone || ''} onChange={e => updateSetting('contact_phone', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Instagram URL</label>
                    <input value={draftSettings.contact_instagram || ''} onChange={e => updateSetting('contact_instagram', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Dirección</label>
                    <textarea value={draftSettings.contact_address || ''} onChange={e => updateSetting('contact_address', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4">Pie de Página (Footer)</h3>
                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción (EN)</label>
                    <textarea value={draftSettings.footer_description_en !== undefined ? draftSettings.footer_description_en : defaultSettings.footer_description_en} onChange={e => updateSetting('footer_description_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Descripción (ES)</label>
                    <textarea value={draftSettings.footer_description_es !== undefined ? draftSettings.footer_description_es : defaultSettings.footer_description_es} onChange={e => updateSetting('footer_description_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-3 text-xs outline-none focus:border-white/30 transition-colors h-24 resize-none" />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Redes Sociales</h3>
                  <button 
                    onClick={(e) => { e.preventDefault(); addSocialLink(); }}
                    className="flex items-center gap-1 text-[9px] uppercase tracking-widest bg-blue-500 text-white px-3 py-1.5 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={12} /> Añadir Red Social
                  </button>
                </div>
                
                <div className="space-y-4">
                  {((draftSettings.social_links || [])).map((link: any, index: number) => (
                    <div key={link.id} className="p-4 bg-black border border-white/10 rounded-lg space-y-3 relative group">
                      <button 
                        onClick={(e) => { e.preventDefault(); removeSocialLink(link.id); }}
                        className="absolute top-3 right-3 text-red-500/50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                      
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Plataforma (Ej: Instagram)</label>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateSocialLink(index, 'label', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">URL del Perfil</label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(!activeEditor || ['project', 'member', 'filters', 'highlight', 'new_highlight'].includes(activeEditor.element)) && activeTab === 'access' && (userEmail?.toLowerCase().trim() === 'it@corpocrea.com' || userEmail?.toLowerCase().trim() === 'j.montilla@corpocrea.com') && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-blue-400" />
                  <h3 className="text-[11px] uppercase tracking-[0.2em] text-blue-400 font-bold">Panel de Seguridad e IT</h3>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest border-l-2 border-blue-500/30 pl-4">
                  Como administrador Maestro, puedes autorizar nuevos correos para que accedan al CMS con permisos de edición.
                </p>
              </div>

              {/* Add New User */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-4 shadow-xl">
                <div className="space-y-3">
                  <label className="block text-[8px] uppercase tracking-widest text-gray-500">Nuevo Usuario</label>
                  <input 
                    type="email" 
                    placeholder="CORREO ELECTRÓNICO"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors uppercase tracking-widest"
                  />
                  <input 
                    type="text" 
                    placeholder="NOMBRE (OPCIONAL)"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors uppercase tracking-widest"
                  />
                </div>
                <button 
                  onClick={addAllowedUser}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Plus size={14} /> Conceder Acceso
                </button>
              </div>

              {/* User List */}
              <div className="space-y-3 pt-6 border-t border-white/10">
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Usuarios Autorizados</label>
                <div className="space-y-2">
                  {allowedUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-lg group hover:border-white/20 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white font-bold tracking-widest uppercase">{u.email}</span>
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">{u.name || (u.email === 'it@corpocrea.com' || u.email === 'j.montilla@corpocrea.com' ? 'Super Admin' : 'Editor')}</span>
                      </div>
                      {(u.email !== 'it@corpocrea.com' && u.email !== 'j.montilla@corpocrea.com') && (
                        <button 
                          onClick={() => removeAllowedUser(u.id)}
                          className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {allowedUsers.length === 0 && (
                     <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">No hay usuarios adicionales</p>
                     </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && !activeEditor && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              {/* Filter Settings Area */}
              {!editingProject && (
                <div className="mb-8 space-y-6 pb-6 border-b border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Configuración de Filtros</h3>
                    <button 
                      onClick={(e) => { e.preventDefault(); addFilter(); }}
                      className="flex items-center gap-1 text-[9px] uppercase tracking-widest bg-blue-500 text-white px-3 py-1.5 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <Plus size={12} /> Añadir Filtro
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(draftSettings.project_filters || []).map((filter: any, index: number) => (
                      <div key={filter.id} className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-2 relative group">
                        {filter.id !== 'all' && (
                          <button 
                            onClick={(e) => { e.preventDefault(); removeFilter(filter.id); }}
                            className="absolute top-2 right-2 text-red-500/50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-1">ES</label>
                            <input value={filter.label_es || ''} onChange={e => updateFilterEntry(index, 'label_es', e.target.value)} className="w-full bg-black border border-white/10 rounded p-2 text-[10px] outline-none focus:border-white/30 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest text-gray-500 mb-1">EN</label>
                            <input value={filter.label_en || ''} onChange={e => updateFilterEntry(index, 'label_en', e.target.value)} className="w-full bg-black border border-white/10 rounded p-2 text-[10px] outline-none focus:border-white/30 transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editingProject ? (
                <form onSubmit={saveProject} className="space-y-4">
                  <button type="button" onClick={() => setEditingProject(null)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white mb-4 flex items-center gap-1"><X size={12}/> Descartar / Volver</button>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Título (EN)</label>
                    <input required value={editingProject.title_en || ''} onChange={e=>setEditingProject({...editingProject, title_en: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Título (ES)</label>
                    <input required value={editingProject.title_es || ''} onChange={e=>setEditingProject({...editingProject, title_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Categoría (EN)</label>
                    <input required value={editingProject.category_en || ''} onChange={e=>setEditingProject({...editingProject, category_en: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Categoría (ES)</label>
                    <input required value={editingProject.category_es || ''} onChange={e=>setEditingProject({...editingProject, category_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Descripción (EN)</label>
                    <textarea value={editingProject.description_en || ''} onChange={e=>setEditingProject({...editingProject, description_en: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 h-20 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Descripción (ES)</label>
                    <textarea value={editingProject.description_es || ''} onChange={e=>setEditingProject({...editingProject, description_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 h-20 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Año</label>
                    <input value={editingProject.year || ''} onChange={e=>setEditingProject({...editingProject, year: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Ubicación</label>
                    <input value={editingProject.location || ''} onChange={e=>setEditingProject({...editingProject, location: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Asignar a Filtros (Multiselect)</label>
                    <div className="flex flex-wrap gap-2">
                      {(draftSettings.project_filters || [])
                        .filter((f: any) => f.id !== 'all')
                        .map((f: any) => {
                          const isSelected = (editingProject.status || '').split(',').map((s:string)=>s.trim()).includes(f.id);
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => {
                                let currentValue = editingProject.status || '';
                                let current = currentValue.split(',').map((s:string)=>s.trim()).filter((s:string)=>s !== '');
                                if (isSelected) {
                                  current = current.filter((s:string)=>s !== f.id);
                                } else {
                                  current.push(f.id);
                                }
                                setEditingProject({...editingProject, status: current.join(',')});
                              }}
                              className={`px-3 py-1 rounded-full border text-[9px] uppercase tracking-widest transition-colors ${isSelected ? 'bg-white text-black border-white font-bold' : 'bg-black text-gray-500 border-white/10 hover:border-white/30'}`}
                            >
                              {f.label_es}
                            </button>
                          );
                        })
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Media del Proyecto (Imagen o Vídeo)</label>
                    <div className="space-y-3">
                      {editingProject.image_url && (
                        <div 
                          onClick={() => document.getElementById('project-upload-input')?.click()}
                          className="w-full h-32 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
                        >
                          {editingProject.image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video src={editingProject.image_url} className="w-full h-full object-cover opacity-50" autoPlay muted loop />
                          ) : (
                            <img src={editingProject.image_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="Preview" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] uppercase tracking-widest bg-black/50 px-2 py-1 rounded group-hover:bg-white group-hover:text-black transition-colors">Cambiar Media</span>
                          </div>
                        </div>
                      )}
                      <input 
                        id="project-upload-input"
                        type="file" 
                        accept="image/*,video/*"
                        onChange={e => handleFileUpload(e, url => setEditingProject({...editingProject, image_url: url}))}
                        disabled={isUploading}
                        className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer disabled:opacity-50" 
                      />
                      {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest">Subiendo archivo...</p>}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Galería de Imágenes</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {(editingProject.gallery || []).map((img: any, idx: number) => (
                        <div key={idx} className="relative group aspect-video bg-black border border-white/10 rounded overflow-hidden">
                          <img src={img.url} className="w-full h-full object-cover" alt="" />
                          <button 
                            type="button"
                            onClick={() => {
                              const newGallery = [...(editingProject.gallery || [])];
                              newGallery.splice(idx, 1);
                              setEditingProject({...editingProject, gallery: newGallery});
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => document.getElementById('gallery-upload-input')?.click()}
                        className="aspect-video border border-dashed border-white/20 rounded flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white hover:border-white/50 flex-col items-center justify-center gap-1 transition-all"
                      >
                        <Plus size={16} />
                        <span className="text-[8px] uppercase tracking-widest">Añadir Foto</span>
                      </button>
                    </div>
                    <input 
                      id="gallery-upload-input"
                      type="file" 
                      accept="image/*"
                      onChange={e => handleFileUpload(e, url => {
                        const newGallery = [...(editingProject.gallery || [])];
                        newGallery.push({ url, description: '', descriptionEs: '' });
                        setEditingProject({...editingProject, gallery: newGallery});
                      })}
                      disabled={isUploading}
                      className="hidden" 
                    />
                  </div>
                  
                  <button type="submit" className="w-full bg-white text-black text-[10px] font-bold uppercase tracking-widest py-3 rounded hover:bg-gray-200 mt-4">Guardar Proyecto</button>
                </form>
              ) : (
                <div>
                  <button onClick={() => setEditingProject({})} className="w-full border border-dashed border-white/20 rounded-lg p-4 text-xs text-gray-400 hover:text-white hover:border-white/50 flex flex-col items-center justify-center gap-2 transition-colors mb-6">
                    <Plus size={16} /> Nuevo Proyecto
                  </button>
                  
                  <div className="space-y-3">
                    {projects.map(p => (
                      <div key={p.id} className="bg-black border border-white/10 rounded p-3 flex items-center justify-between group">
                        <div className="truncate pr-4">
                          <p className="text-xs font-medium truncate">{p.title_es || p.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-gray-500 truncate">{p.category_es || p.category}</p>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <p className="text-[10px] text-zinc-400 font-bold tracking-tight uppercase">
                              {draftSettings.project_filters?.find((f: any) => f.id === p.status)?.label_es || (p.status === 'complete' ? 'Terminado' : p.status === 'build' ? 'En Obra' : 'Sin Estatus')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingProject(p)} className="p-1.5 bg-white/10 rounded hover:bg-white/20"><Edit2 size={12}/></button>
                          <button onClick={() => deleteProject(p.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"><Trash2 size={12}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>

        {!isSidebarCollapsed && (
          <div className="p-6 border-t border-white/10 bg-black/20">
            {hasChanges ? (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-95 disabled:opacity-50"
                >
                  <Save size={16} /> {isSaving ? 'Guardando...' : 'Publicar Cambios'}
                </button>
                <button 
                  onClick={handleDiscard} 
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 py-3 rounded-lg text-[10px] uppercase tracking-widest transition-colors border border-white/5"
                >
                  Descartar
                </button>
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-white/10 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Sin cambios pendientes</p>
              </div>
            )}
          </div>
        )}

      </motion.div>

      {/* RIGHT SIDE - LIVE PREVIEW */}
      <div className="flex-1 flex flex-col bg-black relative">
        
        {/* Topbar Actions */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-950 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${hasChanges ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[10px] uppercase tracking-widest text-gray-400">
              {hasChanges ? 'Cambios sin guardar' : 'Todo guardado'}
            </span>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleDiscard} 
              disabled={!hasChanges} 
              className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              Descartar
            </button>
            <button 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving} 
              className="px-6 py-2 bg-white text-black rounded text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 disabled:opacity-30 flex items-center gap-2 transition-colors"
            >
              <Save size={12} /> {isSaving ? 'Guardando...' : 'Publicar'}
            </button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 p-4 md:p-8 bg-zinc-950">
          <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black relative">
            {/* Overlay to prevent iframe capturing pointer events while dragging/resizing (if we add that later) */}
            <iframe 
              ref={iframeRef} 
              src="/?admin_preview=true" 
              className="w-full h-full border-0"
              title="Live Preview"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
