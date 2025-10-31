import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // ✅ 1. Verificar la API key que viene desde Salesforce
    const apiKeyHeader = req.headers.get('x-api-key');
    const validKey = process.env.SALESFORCE_API_KEY;

    if (apiKeyHeader !== validKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ 2. Leer el cuerpo de la petición (desde Salesforce)
    const body = await req.json();
    const { salesforce_id, full_name, email, acceso_portal } = body || {};

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // ✅ 3. Configuración de Supabase Admin API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // ✅ 4. Crear el usuario en Supabase Auth usando el cliente server (service role)
    const password = `${salesforce_id}-${Math.random().toString(36).slice(-8)}`; // contraseñas temporales
    const payload = {
      email,
      password,
      user_metadata: {
        salesforce_id,
        full_name,
        acceso_portal,
      },
      email_confirm: true,
    };

    // Usamos el cliente server `supabaseAdmin` (service role) en vez de hacer fetch manual.
    const { data: createdUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      user_metadata: payload.user_metadata,
      email_confirm: payload.email_confirm,
    });

    if (error) {
      console.error('❌ Supabase admin.createUser error:', error);
      return NextResponse.json({ error: error.message || 'Error creating user' }, { status: 500 });
    }

    // ✅ 5. Responder a Salesforce
    return NextResponse.json({
      success: true,
      message: 'User created successfully in Supabase',
      user: createdUser ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'API createUser is live' });
}
