import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-white/5">
        <h1 className="text-2xl text-white font-medium mb-6 text-center">ETC PROYECTO CMS</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium py-3 rounded-lg mt-6 hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
