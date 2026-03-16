import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2, Edit } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchProjects();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
    }
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        alert('Error deleting project');
      } else {
        fetchProjects();
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <header className="border-b border-white/10 bg-zinc-900/50 p-6 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
        <h1 className="text-xl font-medium tracking-wide">ETC PROYECTO CMS</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-light">Projects</h2>
          <button 
            onClick={() => navigate('/admin/project/new')}
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors"
          >
            <Plus size={16} />
            Add Project
          </button>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-zinc-400 mb-4">No projects found.</p>
            <button 
              onClick={() => navigate('/admin/project/new')}
              className="text-white underline underline-offset-4 hover:text-zinc-300"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden group">
                <div className="aspect-video relative overflow-hidden bg-zinc-800">
                  {project.image_url && (
                    <img 
                      src={project.image_url} 
                      alt={project.title_en} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-medium text-lg mb-1">{project.title_en}</h3>
                  <p className="text-zinc-500 text-sm mb-6">{project.category_en}</p>
                  
                  <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                    <button 
                      onClick={() => navigate(`/admin/project/${project.id}`)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
