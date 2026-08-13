import { createClient } from '@supabase/supabase-js';

// Palitan ang mga ito ng iyong totoong Supabase Project URL at Anon Key
const supabaseUrl = 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);