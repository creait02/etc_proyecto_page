import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pkijakomomhjlvybhohz.supabase.co';
const supabaseKey = 'sb_publishable_QnjAaHb93-ugCYU8vLjb_g_s95FCSBz';

// Check if URL is a placeholder
if (supabaseUrl.includes('pkijakomomhjlvybhohz')) {
  console.warn('AVISO: Estás usando una URL de Supabase de ejemplo. Para que el CMS funcione correctamente, debes configurar tu propia instancia de Supabase en src/lib/supabase.ts');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Global listener to handle invalid refresh tokens and clear them automatically
supabase.auth.onAuthStateChange((event, session) => {
  if ((event as any) === 'TOKEN_REFRESH_FAILED') {
    console.warn('Refresh token invalid or expired. Clearing session.');
    supabase.auth.signOut().catch(() => {
      // Ignore sign out errors during token refresh failure
    });
    
    // Fallback: manually clear Supabase local storage keys if signOut fails
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }
});

// Global error handler for "Failed to fetch" to prevent it from showing as an unhandled error
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (event.reason.message === 'Failed to fetch' || event.reason.name === 'TypeError' && event.reason.message.includes('fetch'))) {
      console.warn('Capturado error de red (Failed to fetch). La aplicación continuará funcionando con datos de respaldo.');
      event.preventDefault();
    }
  });
}
