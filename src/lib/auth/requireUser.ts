import type { NextRequest } from 'next/server';
import supabaseAdmin from '@/lib/supabase/server';

/**
 * Verifica y obtiene el usuario a partir del header Authorization: Bearer <token>
 * Lanza Error en caso de token ausente o inválido.
 */
export async function requireUser(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    throw new Error('Invalid token');
  }

  return data.user;
}

export default requireUser;
