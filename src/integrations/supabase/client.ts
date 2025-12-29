// Modified to handle missing environment variables securely
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validate that required environment variables are present
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('❌ Supabase configuration error: Missing required environment variables');
  console.error('VITE_SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_PUBLISHABLE_KEY:', SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Missing');
  console.error('');
  console.error('To fix this:');
  console.error('1. For local development: Copy .env.example to .env and fill in your Supabase credentials');
  console.error('2. For production: Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in GitHub repository secrets');
  console.error('   See docs/CI_CD_SETUP.md for detailed instructions');
}

// Use fallback values to prevent immediate crash, but app won't function properly
const url = SUPABASE_URL || 'https://placeholder.supabase.co';
const key = SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(url, key, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'dogadopt' as any
  }
});

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);