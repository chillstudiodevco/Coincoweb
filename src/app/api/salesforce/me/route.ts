import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/requireUser';
import { getValidToken } from '@/lib/salesforce/auth';

// GET /api/salesforce/me
export async function GET(request: NextRequest) {
  try {
    // Reuse centralized server-side auth helper (validates Bearer token and returns user)
    let user;
    try {
      user = await requireUser(request);
    } catch (authErr: unknown) {
      const msg = authErr instanceof Error ? authErr.message : String(authErr);
      // Map auth helper errors to 401 Unauthorized
      if (msg.includes('Unauthorized') || msg.includes('Invalid token')) {
        return NextResponse.json({ error: msg }, { status: 401 });
      }
      // Unexpected auth error -> propagate to outer catch
      throw authErr;
    }

    // Prepare Salesforce call
    const salesforceUrl = process.env.SALESFORCE_INSTANCE_URL;
    if (!salesforceUrl) {
      console.error('❌ [API] SALESFORCE_INSTANCE_URL no configurada');
      return NextResponse.json({ error: 'Salesforce not configured' }, { status: 500 });
    }

    const salesforceToken = await getValidToken();

    // Example: fetch orders by user email (adjust path/query according to your Apex endpoints)
    // Supabase stores custom metadata in `user_metadata`. Normalize to a record
    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    const salesforceId = typeof metadata.salesforce_id === 'string' ? metadata.salesforce_id : '';

    const sfEndpoint = `${salesforceUrl}/services/apexrest/portal/dashboard/account?id=${encodeURIComponent(
      salesforceId
    )}&includeProjects=true`;

    const sfRes = await fetch(sfEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${salesforceToken}`,
        'Content-Type': 'application/json',
      },
    });

    const sfText = await sfRes.text();
    let sfData: unknown;
    try {
      sfData = JSON.parse(sfText);
    } catch (e) {
      console.error('❌ [API] No se pudo parsear respuesta de Salesforce:', e);
      return NextResponse.json({ error: 'Invalid response from Salesforce', details: sfText }, { status: 502 });
    }

    if (!sfRes.ok) {
      console.error('❌ [API] Error de Salesforce:', sfData);
      return NextResponse.json({ error: 'Salesforce error', details: sfData }, { status: sfRes.status });
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email }, salesforce: sfData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ [API] Unexpected error in /api/salesforce/me:', message);
    return NextResponse.json({ error: message || 'Internal error' }, { status: 500 });
  }
}
