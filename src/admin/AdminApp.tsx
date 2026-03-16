import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Login from './Login';
import Dashboard from './Dashboard';

export default function AdminApp() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force default cursor in admin area
    document.body.style.cursor = 'auto';

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
        <p className="text-sm uppercase tracking-[0.2em] animate-pulse">Cargando CMS...</p>
      </div>
    );
  }

  return session ? <Dashboard /> : <Login />;
}
