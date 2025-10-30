import { NextResponse } from 'next/server';

// POST /api/auth
// Body: { username, password }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'username and password required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    }

    const tokenUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('email', username);
    params.append('password', password);

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data?.error_description || data?.error || 'Invalid credentials';
      return NextResponse.json({ success: false, error: message }, { status: res.status });
    }

    // data contains access_token, refresh_token, expires_in, token_type, user
    return NextResponse.json({
      success: true,
      user: data.user,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message || 'Unexpected error' }, { status: 500 });
  }
}

// Método GET para verificar el estado de la API
export async function GET() {
  return NextResponse.json({
    message: 'API de autenticación COINCO funcionando',
    timestamp: new Date().toISOString()
  });
}