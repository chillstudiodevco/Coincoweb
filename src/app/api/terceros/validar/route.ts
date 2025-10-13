/**
 * API Route para validar tokens de invitación
 * Hace de proxy entre el frontend y Salesforce para evitar CORS
 */

import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '@/lib/salesforce/auth';

export async function GET(request: NextRequest) {
  console.log('📡 [API] /api/terceros/validar - Request recibido');
  
  try {
    // Obtener el token de los query params
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      console.error('❌ [API] Token no proporcionado');
      return NextResponse.json(
        { success: false, message: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    console.log('🔑 [API] Token recibido:', token.substring(0, 50) + '...');

    // Obtener token de Salesforce (con auto-renovación)
    const salesforceToken = await getValidToken();
    const salesforceUrl = process.env.SALESFORCE_INSTANCE_URL;

    if (!salesforceUrl) {
      console.error('❌ [API] SALESFORCE_INSTANCE_URL no configurada');
      return NextResponse.json(
        { success: false, message: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    console.log('🔧 [API] Salesforce URL:', salesforceUrl);

    // Llamar a Salesforce
    const salesforceEndpoint = `${salesforceUrl}/services/apexrest/terceros/validar?token=${token}`;
    console.log('📡 [API] Llamando a Salesforce:', salesforceEndpoint);

    const response = await fetch(salesforceEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${salesforceToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 [API] Salesforce response status:', response.status);
    console.log('📡 [API] Salesforce response ok:', response.ok);
    console.log('📡 [API] Salesforce response headers:', Object.fromEntries(response.headers.entries()));

    // Intentar leer la respuesta como texto primero
    const responseText = await response.text();
    console.log('📡 [API] Salesforce response text:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📡 [API] Salesforce response data (parsed):', data);
    } catch (e) {
      console.error('❌ [API] No se pudo parsear respuesta como JSON:', e);
      return NextResponse.json(
        {
          success: false,
          message: 'Respuesta inválida de Salesforce: ' + responseText.substring(0, 200),
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('❌ [API] Error de Salesforce (status ' + response.status + '):', data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || data[0]?.message || 'Error al validar el token en Salesforce',
          salesforceError: data,
        },
        { status: response.status }
      );
    }

    console.log('✅ [API] Token validado exitosamente');
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [API] Error inesperado:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
