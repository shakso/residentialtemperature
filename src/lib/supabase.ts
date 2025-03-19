import { createClient } from '@supabase/supabase-js';

const getConfig = () => {
  const isBrowser = typeof window !== 'undefined';

  let url: string;
  let anonKey: string;

  if (isBrowser) {
    url = window.ENV?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
    anonKey = window.ENV?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  } else {
    url = process.env.SUPABASE_URL || '';
    anonKey = process.env.SUPABASE_ANON_KEY || '';
  }

  if (!url || !anonKey) {
    console.error('Missing Supabase configuration:', { url: !!url, anonKey: !!anonKey });
    throw new Error('Missing required Supabase configuration. Check your environment variables.');
  }

  return { url, anonKey };
};

const config = getConfig();

const supabase = createClient(config.url, config.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export { supabase };
export default supabase;
