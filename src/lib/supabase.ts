import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pkijakomomhjlvybhohz.supabase.co';
const supabaseKey = 'sb_publishable_QnjAaHb93-ugCYU8vLjb_g_s95FCSBz';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Global listener to handle invalid refresh tokens and clear them automatically
supabase.auth.onAuthStateChange((event, session) => {
  if ((event as any) === 'TOKEN_REFRESH_FAILED') {
    console.warn('Refresh token invalid or expired. Clearing session.');
    supabase.auth.signOut().catch(console.error);
    
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
