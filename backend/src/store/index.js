import * as local from './local.js';

// Use local files only when Supabase is not configured at all.
const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL);
const hasSupabaseKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
if (hasSupabaseUrl !== hasSupabaseKey) {
  throw new Error('Configure both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or leave both unset to use local data.');
}
const useSupabase = hasSupabaseUrl;
const impl = useSupabase ? await import('./supabase.js') : local;
export const store = impl;
export const storeName = impl.name;
