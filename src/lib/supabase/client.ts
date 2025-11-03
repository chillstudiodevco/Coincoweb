import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente para browser que usa cookies en lugar de localStorage
export const supabaseClient = createBrowserClient(url, anonKey);

export default supabaseClient;
