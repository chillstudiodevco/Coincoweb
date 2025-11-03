import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // ✅ 1. Verificar la API key
    const apiKeyHeader = req.headers.get('x-api-key');
    const validKey = process.env.SALESFORCE_API_KEY;

    if (apiKeyHeader !== validKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ 2. Leer body
    const body = await req.json();
    const { salesforce_id, full_name, email, acceso_portal } = body || {};

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // ✅ 3. Verificar configuración de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // 🔥 4. USAR inviteUserByEmail EN VEZ DE createUser
    // Esto envía el email automáticamente
    const { data: invitedUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          salesforce_id,
          full_name,
          acceso_portal,
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,//cambiar por ENV
      }
    );

    if (inviteError) {
      console.error('❌ Supabase inviteUserByEmail error:', inviteError);
      return NextResponse.json({ 
        error: inviteError.message || 'Error inviting user' 
      }, { status: 500 });
    }

    // ✅ 5. Responder a Salesforce
    return NextResponse.json({
      success: true,
      message: 'User invited successfully. Email sent to user.',
      user: invitedUser ?? null,
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