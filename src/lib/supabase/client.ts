import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Cliente para browser que usa cookies en lugar de localStorage
export const supabaseClient = createBrowserClient(url, anonKey);

export default supabaseClient;
