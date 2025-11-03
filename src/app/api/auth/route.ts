import { NextResponse } from 'next/server';

// POST /api/auth
// Body: { username, password }
export async function POST(req: Request) {
  try {
    console.info('[API /api/auth] POST called');
    const apiKeyHeader = req.headers.get('x-api-key');
    const validKey = process.env.SALESFORCE_API_KEY;

    console.info('[API /api/auth] x-api-key present:', !!apiKeyHeader);
    console.info('[API /api/auth] x-api-key matches env:', apiKeyHeader === validKey);

    if (apiKeyHeader !== validKey) {
      console.warn('[API /api/auth] Unauthorized request: invalid x-api-key');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const body = await req.json();
  const { username, password } = body || {};
  // log username only (do NOT log password)
  console.info('[API /api/auth] body received - username present:', !!username);

    if (!username || !password) {
      console.warn('[API /api/auth] Missing credentials');
      return NextResponse.json({ success: false, error: 'username and password required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    }

  const tokenUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/token`;
  console.info('[API /api/auth] tokenUrl:', tokenUrl);
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

    console.info('[API /api/auth] Supabase token fetch status:', res.status);
    console.info('[API /api/auth] Supabase response has access_token:', !!(data && data.access_token));

    if (!res.ok) {
      const message = data?.error_description || data?.error || 'Invalid credentials';
      console.warn('[API /api/auth] Supabase auth failed:', message);
      return NextResponse.json({ success: false, error: message }, { status: res.status });
    }

    // data contains access_token, refresh_token, expires_in, token_type, user
    console.info('[API /api/auth] Auth success for user:', data?.user?.email ?? data?.user?.id ?? '(unknown)');
    // Do not log tokens themselves
    return NextResponse.json({
      success: true,
      user: data.user,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[API /api/auth] Unexpected error:', message);
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