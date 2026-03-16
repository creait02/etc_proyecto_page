import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pkijakomomhjlvybhohz.supabase.co';
const supabaseKey = 'sb_publishable_QnjAaHb93-ugCYU8vLjb_g_s95FCSBz';

export const supabase = createClient(supabaseUrl, supabaseKey);
