import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Cliente con service role (para operaciones admin)
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// Cliente de servidor con cookies (para auth de usuarios)
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll se llama desde Server Component.
          // Puede ser ignorado si se lee una cookie establecida desde middleware
        }
      },
    },
  });
}

export default supabaseAdmin;
