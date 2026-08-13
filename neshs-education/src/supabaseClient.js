import { createClient } from '@supabase/supabase-js';

// Replace these values with your actual Supabase Project URL and Anon Key
const supabaseUrl = 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);