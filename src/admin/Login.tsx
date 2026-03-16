import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-white font-sans">
      <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-xl w-full max-w-md border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-light mb-8 uppercase tracking-[0.2em] text-center">ETC Admin</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-white/30 outline-none transition-colors" 
              required 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-white/30 outline-none transition-colors" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-white text-black font-medium uppercase tracking-widest text-xs py-4 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Ingresando...' : 'Ingresar al CMS'}
          </button>
        </div>
      </form>
    </div>
  );
}
