import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/requireUser';
import { getValidToken } from '@/lib/salesforce/auth';

// GET /api/salesforce/me
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [API /salesforce/me] Request received');
    
    // Reuse centralized server-side auth helper (validates Bearer token and returns user)
    let user;
    try {
      console.log('🔐 [API] Validating user authentication...');
      user = await requireUser(request);
      console.log('✅ [API] User authenticated:', { id: user.id, email: user.email });
    } catch (authErr: unknown) {
      const msg = authErr instanceof Error ? authErr.message : String(authErr);
      console.error('❌ [API] Authentication failed:', msg);
      // Map auth helper errors to 401 Unauthorized
      if (msg.includes('Unauthorized') || msg.includes('Invalid token')) {
        return NextResponse.json({ error: msg }, { status: 401 });
      }
      // Unexpected auth error -> propagate to outer catch
      throw authErr;
    }

    // Prepare Salesforce call
    const salesforceUrl = process.env.SALESFORCE_INSTANCE_URL;
    console.log('🔧 [API] Salesforce URL:', salesforceUrl);
    
    if (!salesforceUrl) {
      console.error('❌ [API] SALESFORCE_INSTANCE_URL no configurada');
      return NextResponse.json({ error: 'Salesforce not configured' }, { status: 500 });
    }

    console.log('🔑 [API] Obteniendo token de Salesforce...');
    const salesforceToken = await getValidToken();
    console.log('✅ [API] Token de Salesforce obtenido:', salesforceToken ? '✓ (exists)' : '✗ (missing)');

    // Example: fetch orders by user email (adjust path/query according to your Apex endpoints)
    // Supabase stores custom metadata in `user_metadata`. Normalize to a record
    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    const salesforceId = typeof metadata.salesforce_id === 'string' ? metadata.salesforce_id : '';
    
    console.log('👤 [API] User metadata:', { 
      salesforceId, 
      fullName: metadata.full_name,
      accesoPortal: metadata.acceso_portal 
    });

    const sfEndpoint = `${salesforceUrl}/services/apexrest/portal/dashboard/account?id=${encodeURIComponent(
      salesforceId
    )}&includeProjects=true`;
    
    console.log('📡 [API] Calling Salesforce endpoint:', sfEndpoint);

    const sfRes = await fetch(sfEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${salesforceToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 [API] Salesforce response status:', sfRes.status, sfRes.statusText);

    const sfText = await sfRes.text();
    console.log('📄 [API] Salesforce raw response (first 200 chars):', sfText.substring(0, 200));
    
    let sfData: unknown;
    try {
      sfData = JSON.parse(sfText);
      console.log('✅ [API] Salesforce data parsed successfully');
    } catch (e) {
      console.error('❌ [API] No se pudo parsear respuesta de Salesforce:', e);
      console.error('📄 [API] Raw response:', sfText);
      return NextResponse.json({ error: 'Invalid response from Salesforce', details: sfText }, { status: 502 });
    }

    if (!sfRes.ok) {
      console.error('❌ [API] Error de Salesforce:', sfData);
      return NextResponse.json({ error: 'Salesforce error', details: sfData }, { status: sfRes.status });
    }

    console.log('🎉 [API] Success! Returning data to client');
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email }, salesforce: sfData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ [API] Unexpected error in /api/salesforce/me:', message);
    return NextResponse.json({ error: message || 'Internal error' }, { status: 500 });
  }
}
