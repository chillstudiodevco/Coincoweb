/**
 * API Route para completar el registro de terceros
 * Hace de proxy entre el frontend y Salesforce para evitar CORS
 */

import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '@/lib/salesforce/auth';

export async function PATCH(request: NextRequest) {
  console.log('📡 [API] /api/terceros/registro - Request recibido');
  
  try {
    // Obtener el body del request
    const body = await request.json();
    const { token, datosRegistro } = body;

    if (!token) {
      console.error('❌ [API] Token no proporcionado');
      return NextResponse.json(
        { success: false, message: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    if (!datosRegistro) {
      console.error('❌ [API] Datos de registro no proporcionados');
      return NextResponse.json(
        { success: false, message: 'Datos de registro no proporcionados' },
        { status: 400 }
      );
    }

    console.log('🔑 [API] Token recibido:', token.substring(0, 50) + '...');
    console.log('📝 [API] Datos de registro recibidos:', {
      razonSocial: datosRegistro.razonSocial,
      nit: datosRegistro.nit,
      tipoDocumento: datosRegistro.tipoDocumento
    });

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
    const salesforceEndpoint = `${salesforceUrl}/services/apexrest/terceros/registro/completar`;
    console.log('📡 [API] Llamando a Salesforce:', salesforceEndpoint);

    const response = await fetch(salesforceEndpoint, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${salesforceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        datosRegistro,
      }),
    });

    console.log('📡 [API] Salesforce response status:', response.status);

    const data = await response.json();
    console.log('📡 [API] Salesforce response data:', data);

    if (!response.ok) {
      console.error('❌ [API] Error de Salesforce:', data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Error al completar el registro en Salesforce',
        },
        { status: response.status }
      );
    }

    console.log('✅ [API] Registro completado exitosamente');
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
