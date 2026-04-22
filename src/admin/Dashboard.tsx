import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Layout, Phone, FolderKanban, Save, X, Plus, Trash2, Edit2, Users, Video } from 'lucide-react';
import { toast } from 'sonner';
import { fallbackTeamMembers } from '../constants';
import { defaultSettings } from '../contexts/SiteContext';
import { projects as fallbackProjects } from '../data/mockData';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Settings State
  const [originalSettings, setOriginalSettings] = useState<any>({});
  const [draftSettings, setDraftSettings] = useState<any>({});
  
  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any>(null);

  // Team State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [editingMember, setEditingMember] = useState<any>(null);

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
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
    fetchData();
  }, []); // Only fetch on mount

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ELEMENT_CLICKED') {
        const { section, element, projectId, memberId } = event.data.payload;
        setActiveEditor({ section, element, projectId, memberId });
        
        // Switch to the appropriate tab based on the section
        if (section === 'home' || section === 'header') {
          setActiveTab('home');
        } else if (section === 'projects') {
          setActiveTab('projects');
          if (projectId) {
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
        } else if (section === 'contact') {
          setActiveTab('contact');
        } else if (section === 'team') {
          setActiveTab('team');
          if (memberId) {
            let member = teamMembersRef.current.find(m => String(m.id) === String(memberId));
            if (!member) {
              // Check fallbacks if not in DB
              member = fallbackTeamMembers.find(m => String(m.id) === String(memberId));
            }
            if (member) {
              setEditingMember(member);
            }
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchData = async () => {
    try {
      const [setRes, projRes, teamRes] = await Promise.all([
        supabase.from('site_settings').select('*').single(),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('team_members').select('*').order('order', { ascending: true })
      ]);
      
      if (setRes.data) {
        // More robust merge to prevent null values from overwriting defaults (like filters)
        const merged = { ...defaultSettings };
        Object.keys(setRes.data).forEach(key => {
          if (setRes.data[key] !== null && setRes.data[key] !== undefined) {
            (merged as any)[key] = setRes.data[key];
          }
        });
        setOriginalSettings(merged);
        setDraftSettings(merged);
      } else {
        setOriginalSettings(defaultSettings);
        setDraftSettings(defaultSettings);
      }
      if (projRes.data && projRes.data.length > 0) {
        setProjects(projRes.data);
      } else {
        setProjects(fallbackProjects);
      }
      if (teamRes.data && teamRes.data.length > 0) {
        setTeamMembers(teamRes.data);
      } else {
        setTeamMembers(fallbackTeamMembers);
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

    // Límite de peso: 5MB para imágenes, 30MB para vídeos
    const maxSizeMB = isVideo ? 30 : 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      toast.error('Archivo demasiado grande', {
        description: `El límite es de ${maxSizeMB}MB para ${isVideo ? 'vídeos' : 'imágenes'}.`
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

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'PREVIEW_UPDATE',
        payload: { 
          settings: draftSettings, 
          projects: previewProjects,
          teamMembers: previewTeam
        }
      }, '*');
    }
    
    // Check if changed
    const isSettingsChanged = JSON.stringify(originalSettings) !== JSON.stringify(draftSettings);
    const isProjectEditing = editingProject !== null;
    const isTeamEditing = editingMember !== null;
    setHasChanges(isSettingsChanged || isProjectEditing || isTeamEditing);
  }, [draftSettings, projects, originalSettings, editingProject, teamMembers, editingMember]);

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

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save settings if changed
      const isSettingsChanged = JSON.stringify(originalSettings) !== JSON.stringify(draftSettings);
      if (isSettingsChanged) {
        if (originalSettings.id) {
          const { error } = await supabase.from('site_settings').update(draftSettings).eq('id', originalSettings.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('site_settings').insert([draftSettings]);
          if (error) throw error;
        }
        setOriginalSettings(draftSettings);
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

        // If 'id' is a string UUID, we update. If it's a number/fallback, we strip it to force insert and prevent UUID cast errors
        if (projectDataToSave.id && typeof projectDataToSave.id === 'string' && projectDataToSave.id.includes('-')) {
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

        if (memberDataToSave.id && typeof memberDataToSave.id === 'string' && memberDataToSave.id.includes('-')) {
          const { error } = await supabase.from('team_members').update(memberDataToSave).eq('id', memberDataToSave.id);
          if (error) throw error;
        } else {
          delete memberDataToSave.id;
          const { error } = await supabase.from('team_members').insert([memberDataToSave]);
          if (error) throw error;
        }
        setEditingMember(null);
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

  const deleteProject = async (id: string) => {
    if (confirm('¿Eliminar proyecto?')) {
      await supabase.from('projects').delete().eq('id', id);
      fetchData();
    }
  };

  // Team Handlers
  const saveMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await handleSave();
  };

  const deleteMember = async (id: string) => {
    if (confirm('¿Eliminar miembro del equipo?')) {
      await supabase.from('team_members').delete().eq('id', id);
      fetchData();
    }
  };



  const handleLogout = async () => {
    localStorage.removeItem('etc_demo_session');
    await supabase.auth.signOut();
    window.location.reload(); // Ensure clean state
  };

  const isDemo = localStorage.getItem('etc_demo_session') === 'true';

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR - CONTROLS */}
      <div className="w-80 bg-zinc-900 border-r border-white/10 flex flex-col z-10 shadow-2xl">
        {isDemo && (
          <div className="bg-amber-500/20 border-b border-amber-500/30 px-6 py-2">
            <p className="text-[9px] uppercase tracking-widest text-amber-500 font-bold text-center">
              Modo Demostración Activo
            </p>
          </div>
        )}
        {/* Header */}
        <div className="h-14 px-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <span className="font-bold tracking-widest uppercase text-[10px]">ETC Builder</span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors">
            <LogOut size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/10 overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveTab('home')} className={`flex-1 min-w-[70px] py-3 text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 transition-colors ${activeTab === 'home' ? 'bg-white/10 text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}><Layout size={12}/> Inicio</button>
          <button onClick={() => setActiveTab('projects')} className={`flex-1 min-w-[70px] py-3 text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 transition-colors ${activeTab === 'projects' ? 'bg-white/10 text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}><FolderKanban size={12}/> Proyectos</button>
          <button onClick={() => setActiveTab('team')} className={`flex-1 min-w-[70px] py-3 text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 transition-colors ${activeTab === 'team' ? 'bg-white/10 text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}><Users size={12}/> Equipo</button>
          <button onClick={() => setActiveTab('contact')} className={`flex-1 min-w-[70px] py-3 text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 transition-colors ${activeTab === 'contact' ? 'bg-white/10 text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}><Phone size={12}/> Contacto</button>
        </div>

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
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
                    activeEditor.element === 'description' ? 'Descripción' : 
                    activeEditor.element === 'title' ? (activeEditor.section === 'home' ? 'Título Principal' : 'Título del Proyecto') :
                    activeEditor.element === 'subtitle' ? (activeEditor.section === 'home' ? 'Subtítulo Principal' : 'Subtítulo del Proyecto') :
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

              {activeEditor.element === 'subtitle' && (
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

          {(!activeEditor || activeEditor.element === 'project' || activeEditor.element === 'member' || activeEditor.element === 'filters') && activeTab === 'home' && (
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

          {(!activeEditor || activeEditor.element === 'project' || activeEditor.element === 'member' || activeEditor.element === 'filters') && activeTab === 'team' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              {editingMember ? (
                <form onSubmit={saveMember} className="space-y-4">
                  <button type="button" onClick={() => setEditingMember(null)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white mb-4 flex items-center gap-1"><X size={12}/> Descartar / Volver</button>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Nombre</label>
                    <input required value={editingMember.name || ''} onChange={e=>setEditingMember({...editingMember, name: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
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
                        <div key={m.id} className="bg-black border border-white/10 rounded p-3 flex items-center justify-between group">
                          <div className="flex items-center gap-3 truncate pr-4">
                            <img src={m.image_url || m.image} className="w-8 h-8 rounded-full object-cover border border-white/10" alt="" />
                            <div className="truncate">
                              <p className="text-xs font-medium truncate">{m.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{m.role_es || m.role}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingMember(m)} className="p-1.5 bg-white/10 rounded hover:bg-white/20"><Edit2 size={12}/></button>
                            <button onClick={() => deleteMember(m.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"><Trash2 size={12}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {(!activeEditor || activeEditor.element === 'project' || activeEditor.element === 'member' || activeEditor.element === 'filters') && activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
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

        </div>
      </div>

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
