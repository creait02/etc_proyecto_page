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

    // Check for demo session first
    const isDemo = localStorage.getItem('etc_demo_session') === 'true';
    if (isDemo) {
      setSession({ user: { email: 'demo@etcproyecto.com' }, isDemo: true });
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error:", error.message);
        if (error.message.includes('Refresh Token')) {
          supabase.auth.signOut(); // Clear invalid tokens
        }
        setSession(null);
      } else {
        setSession(session);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to get session:", err);
      setSession(null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event as any) === 'TOKEN_REFRESH_FAILED') {
        await supabase.auth.signOut();
        setSession(null);
      } else {
        setSession(session);
      }
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
