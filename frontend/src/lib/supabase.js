import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// null when Supabase is not configured yet (the shop still works, only accounts are disabled)
export const supabase = url && key ? createClient(url, key) : null;
