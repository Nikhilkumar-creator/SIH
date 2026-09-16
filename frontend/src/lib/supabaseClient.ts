import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project') &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-anon-key') &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.info(
    'NCPOR Portal: Running with local resilient storage (Supabase live keys not configured or using placeholder).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
