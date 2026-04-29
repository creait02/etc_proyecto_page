import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import Login from './Login';
import Dashboard from './Dashboard';

export default function AdminApp() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Cache to avoid multiple DB hits for the same email in one session
  const [cachedAllowedEmail, setCachedAllowedEmail] = useState<string | null>(null);

  const checkUserAccess = async (userEmail: string, retryCount = 0): Promise<{ allowed: boolean; error: boolean }> => {
    if (!userEmail) return { allowed: false, error: false };
    
    const email = userEmail.toLowerCase().trim();

    // 1. Use Cache if available
    if (cachedAllowedEmail === email) {
      return { allowed: true, error: false };
    }
    
    // IT email is hardcoded as admin - ALWAYS ALLOWED
    if (email === 'it@corpocrea.com') {
      setCachedAllowedEmail(email);
      return { allowed: true, error: false };
    }
    
    try {
      // Use a shorter timeout for this specific query to prevent hanging
      const { data, error } = await supabase
        .from('allowed_users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        // Handle Supabase locks with exponential backoff
        if ((error.message?.includes('lock') || error.message?.includes('stole')) && retryCount < 3) {
          const delay = (retryCount + 1) * 1000;
          await new Promise(r => setTimeout(r, delay));
          return checkUserAccess(userEmail, retryCount + 1);
        }
        return { allowed: false, error: true }; 
      }
      
      const allowed = !!data;
      if (allowed) setCachedAllowedEmail(email); 
      return { allowed, error: false };
    } catch (e: any) {
      if ((e.message?.includes('lock') || e.message?.includes('stole')) && retryCount < 3) {
        const delay = (retryCount + 1) * 1000;
        await new Promise(r => setTimeout(r, delay));
        return checkUserAccess(userEmail, retryCount + 1);
      }
      return { allowed: false, error: true };
    }
  };

  useEffect(() => {
    // Force default cursor in admin area
    document.body.style.cursor = 'auto';

    const initAuth = async () => {
      if (verifying) return;
      setVerifying(true);

      const safetyTimeout = setTimeout(() => {
        setLoading(false);
        setVerifying(false);
      }, 5000);

      try {
        const isDemo = localStorage.getItem('etc_demo_session') === 'true';
        if (isDemo) {
          setSession({ user: { email: 'demo@etcproyecto.com' }, isDemo: true });
          setIsAllowed(true);
          setLoading(false);
          setVerifying(false);
          clearTimeout(safetyTimeout);
          return;
        }

        // Only get session if we don't have one to prevent lock stealing
        if (!session) {
          const { data: { session: currentSession } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
          if (currentSession) {
            const currentEmail = currentSession.user.email?.toLowerCase().trim();
            if (cachedAllowedEmail === currentEmail) {
              setSession(currentSession);
              setIsAllowed(true);
              setLoading(false);
            } else {
              const { allowed, error } = await checkUserAccess(currentEmail || '');
              if (!error) {
                setSession(currentSession);
                setIsAllowed(allowed);
              }
            }
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
        setVerifying(false);
        clearTimeout(safetyTimeout);
      }
    };

    initAuth();

    // Listen for auth changes but avoid redundant state updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAllowed(false);
        setCachedAllowedEmail(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session) {
          setSession(session);
          
          // Only check access if email changed or we don't have it allowed yet
          const currentEmail = session.user.email?.toLowerCase().trim();
          if (cachedAllowedEmail !== currentEmail) {
            const { allowed, error } = await checkUserAccess(currentEmail || '');
            if (!error) {
              setIsAllowed(allowed);
              if (!allowed && event === 'SIGNED_IN') {
                toast.error("No tienes acceso autorizado.");
                await supabase.auth.signOut().catch(() => {});
              }
            }
          } else {
            // If already cached, just ensure we are allowed
            setIsAllowed(true);
          }
          setLoading(false);
        }
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

  return (session && isAllowed) ? <Dashboard /> : <Login />;
}
