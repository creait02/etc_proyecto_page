import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Layout, Phone, FolderKanban, Save, X, Plus, Trash2, Edit2, Users } from 'lucide-react';
import { toast } from 'sonner';

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
  const [activeEditor, setActiveEditor] = useState<{ section: string, element: string, projectId?: string, memberId?: string } | null>(null);

  useEffect(() => {
    fetchData();

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
            const proj = projects.find(p => p.id === projectId);
            if (proj) setEditingProject(proj);
          }
        } else if (section === 'contact') {
          setActiveTab('contact');
        } else if (section === 'team') {
          setActiveTab('team');
          if (memberId) {
            const member = teamMembers.find(m => m.id === memberId);
            if (member) setEditingMember(member);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [projects, teamMembers]);

  const fetchData = async () => {
    try {
      const [setRes, projRes, teamRes] = await Promise.all([
        supabase.from('site_settings').select('*').single(),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('team_members').select('*').order('order', { ascending: true })
      ]);
      
      if (setRes.data) {
        setOriginalSettings(setRes.data);
        setDraftSettings(setRes.data);
      }
      if (projRes.data) {
        setProjects(projRes.data);
      }
      if (teamRes.data) {
        setTeamMembers(teamRes.data);
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

  const updateSetting = (key: string, value: string) => {
    setDraftSettings((prev: any) => ({ ...prev, [key]: value }));
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
        if (!editingProject.title_en || !editingProject.title_es || !editingProject.category_en || !editingProject.category_es || !editingProject.image_url) {
          toast.warning('Campos incompletos', {
            description: 'Por favor completa los campos requeridos del proyecto (Títulos, Categorías, Imagen URL).'
          });
          setIsSaving(false);
          return;
        }
        if (editingProject.id) {
          const { error } = await supabase.from('projects').update(editingProject).eq('id', editingProject.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('projects').insert([editingProject]);
          if (error) throw error;
        }
        setEditingProject(null);
      }

      // Save team member if editing
      if (editingMember) {
        if (!editingMember.name || !editingMember.role_es || !editingMember.image_url) {
          toast.warning('Campos incompletos', {
            description: 'Por favor completa los campos requeridos del miembro del equipo (Nombre, Rol ES, Imagen URL).'
          });
          setIsSaving(false);
          return;
        }
        if (editingMember.id) {
          const { error } = await supabase.from('team_members').update(editingMember).eq('id', editingMember.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('team_members').insert([editingMember]);
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
  const saveMember = async (e: React.FormEvent) => {
    e.preventDefault();
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
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">Editando: {activeEditor.element}</h3>
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
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Media de Fondo (Imagen o Vídeo)</label>
                  <div className="space-y-3">
                    {draftSettings.home_bg_image && (
                      <div 
                        onClick={() => document.getElementById('home-bg-upload-input')?.click()}
                        className="w-full h-32 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
                      >
                        {draftSettings.home_bg_image.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={draftSettings.home_bg_image} className="w-full h-full object-cover opacity-50" autoPlay muted loop />
                        ) : (
                          <img src={draftSettings.home_bg_image} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="Preview" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] uppercase tracking-widest bg-black/50 px-2 py-1 rounded group-hover:bg-white group-hover:text-black transition-colors">Cambiar Media</span>
                        </div>
                      </div>
                    )}
                    <input 
                      id="home-bg-upload-input"
                      type="file" 
                      accept="image/*,video/*"
                      onChange={e => handleFileUpload(e, url => updateSetting('home_bg_image', url))}
                      disabled={isUploading}
                      className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer disabled:opacity-50" 
                    />
                    {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest">Subiendo archivo...</p>}
                  </div>
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
              
              {/* Quick Editor for Projects */}
              {activeEditor.element === 'project' && editingProject && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/10 pb-2">Edición Rápida: {editingProject.title_es || 'Proyecto'}</h3>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Media del Proyecto</label>
                    <div className="space-y-3">
                      {editingProject.image_url && (
                        <div 
                          onClick={() => document.getElementById('quick-project-upload')?.click()}
                          className="w-full h-40 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
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
                        id="quick-project-upload"
                        type="file" 
                        accept="image/*,video/*"
                        onChange={e => handleFileUpload(e, url => setEditingProject({...editingProject, image_url: url}))}
                        disabled={isUploading}
                        className="hidden" 
                      />
                      {!editingProject.image_url && (
                        <button 
                          onClick={() => document.getElementById('quick-project-upload')?.click()}
                          className="w-full py-8 border border-dashed border-white/20 rounded flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-white/40 transition-all"
                        >
                          <Plus size={20} />
                          <span className="text-[10px] uppercase tracking-widest">Subir Media</span>
                        </button>
                      )}
                      {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest">Subiendo archivo...</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Título (ES)</label>
                      <input value={editingProject.title_es || ''} onChange={e=>setEditingProject({...editingProject, title_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Categoría (ES)</label>
                      <input value={editingProject.category_es || ''} onChange={e=>setEditingProject({...editingProject, category_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                    </div>
                  </div>
                  
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">
                    Para editar más detalles como el año, ubicación o descripción completa, usa la pestaña "Proyectos" abajo.
                  </p>
                </div>
              )}

              {/* Quick Editor for Team Members */}
              {activeEditor.element === 'member' && editingMember && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/10 pb-2">Edición Rápida: {editingMember.name || 'Miembro'}</h3>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Foto del Miembro</label>
                    <div className="space-y-3">
                      {editingMember.image_url && (
                        <div 
                          onClick={() => document.getElementById('quick-member-upload')?.click()}
                          className="w-full h-40 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
                        >
                          <img src={editingMember.image_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="Preview" />
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
                      {!editingMember.image_url && (
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
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Rol (ES)</label>
                      <input value={editingMember.role_es || ''} onChange={e=>setEditingMember({...editingMember, role_es: e.target.value})} className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30" />
                    </div>
                  </div>

                  <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">
                    Para editar el rol en inglés o el orden de aparición, usa la pestaña "Equipo" abajo.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Hide the general tabs content if we are focusing on a specific editor (except for projects/members which uses the main form) */}
          {(!activeEditor || activeEditor.element === 'project' || activeEditor.element === 'member') && activeTab === 'home' && (
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
                  {draftSettings.home_bg_image && (
                    <div className="w-full h-32 bg-black border border-white/10 rounded overflow-hidden relative group">
                      {draftSettings.home_bg_image.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={draftSettings.home_bg_image} className="w-full h-full object-cover opacity-50" autoPlay muted loop />
                      ) : (
                        <img src={draftSettings.home_bg_image} className="w-full h-full object-cover opacity-50" alt="Preview" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] uppercase tracking-widest bg-black/50 px-2 py-1 rounded">Media Actual</span>
                      </div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    onChange={e => handleFileUpload(e, url => updateSetting('home_bg_image', url))}
                    disabled={isUploading}
                    className="w-full bg-black border border-white/10 rounded p-2 text-xs outline-none focus:border-white/30 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer disabled:opacity-50" 
                  />
                  {isUploading && <p className="text-[10px] text-emerald-500 animate-pulse uppercase tracking-widest">Subiendo archivo...</p>}
                </div>
              </div>
            </div>
          )}

          {(!activeEditor || activeEditor.element === 'project' || activeEditor.element === 'member') && activeTab === 'team' && (
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
                      {editingMember.image_url && (
                        <div 
                          onClick={() => document.getElementById('member-upload-input')?.click()}
                          className="w-full h-32 bg-black border border-white/10 rounded overflow-hidden relative group cursor-pointer"
                        >
                          <img src={editingMember.image_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="Preview" />
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

          {(!activeEditor || activeEditor.element === 'project' || activeEditor.element === 'member') && activeTab === 'contact' && (
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

          {activeTab === 'projects' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
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
                          <p className="text-xs font-medium truncate">{p.title_es}</p>
                          <p className="text-[10px] text-gray-500 truncate">{p.category_es}</p>
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
