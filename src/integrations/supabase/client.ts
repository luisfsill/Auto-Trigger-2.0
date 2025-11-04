import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.gen';

const SUPABASE_URL = "https://xtlcnppdnlvxlfjdxqzk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0bGNucHBkbmx2eGxmamR4cXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDc5ODksImV4cCI6MjA3NzYyMzk4OX0.d-Mc0Ob3WErMoEY0hC-7kc5UWV07JlKJoSTzNqSrG7c";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce',
    debug: import.meta.env.DEV
  },
  global: {
    headers: {
      'X-Client-Info': 'auto-trigger-web',
    }
  }
});
