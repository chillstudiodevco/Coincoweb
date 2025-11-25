import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '@/lib/salesforce/auth';
import { requireUser } from '@/lib/auth/requireUser';

const SALESFORCE_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL;

/**
 * PATCH /api/salesforce/ordenes-compra/{ordenId}/aprobar
 * 
 * Aprueba una orden de compra desde el portal del contratista:
 * - Sube la cuenta de cobro en PDF (base64)
 * - Actualiza datos de entrega (dirección, nombre quien recibe, teléfono)
 * - Cambia estado a "Orden de compra en tramite"
 * - Registra fecha de aprobación
 * 
 * Body: {
 *   cuentaCobroBase64: string (required),
 *   cuentaCobroFileName: string (required),
 *   nombrePersonaRecibe?: string,
 *   telefonoPersonaRecibe?: string,
 *   direccionEntrega?: string
 * }
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validar usuario autenticado
    const user = await requireUser(request);
    
    // 2. Obtener ordenId de los parámetros
    const { id: ordenId } = await context.params;
    
    if (!ordenId || ordenId.length < 15) {
      return NextResponse.json(
        { success: false, error: 'Invalid ordenId format' },
        { status: 400 }
      );
    }

    // 3. Parsear body
    let body: {
      cuentaCobroBase64: string;
      cuentaCobroFileName: string;
      nombrePersonaRecibe?: string;
      telefonoPersonaRecibe?: string;
      direccionEntrega?: string;
    };
    
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Empty request body' },
        { status: 400 }
      );
    }

    // 4. Validar campos requeridos
    if (!body.cuentaCobroBase64) {
      return NextResponse.json(
        { success: false, error: 'cuentaCobroBase64 is required' },
        { status: 400 }
      );
    }

    if (!body.cuentaCobroFileName) {
      return NextResponse.json(
        { success: false, error: 'cuentaCobroFileName is required' },
        { status: 400 }
      );
    }

    console.log('[Aprobar Orden] Processing approval for orden:', ordenId);

    // 5. Obtener token de Salesforce
    const salesforceToken = await getValidToken();

    // 6. Llamar al endpoint de Salesforce /portal/ordenes/{ordenId}/aprobar
    const apexUrl = `${SALESFORCE_INSTANCE_URL}/services/apexrest/portal/ordenes/${ordenId}/aprobar`;

    const sfResponse = await fetch(apexUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${salesforceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ordenId: ordenId,
        cuentaCobroBase64: body.cuentaCobroBase64,
        cuentaCobroFileName: body.cuentaCobroFileName,
        nombrePersonaRecibe: body.nombrePersonaRecibe || '',
        telefonoPersonaRecibe: body.telefonoPersonaRecibe || '',
        direccionEntrega: body.direccionEntrega || '',
      }),
    });

    // 7. Manejar respuesta de Salesforce
    if (!sfResponse.ok) {
      const errorText = await sfResponse.text();
      console.error('[Aprobar Orden] Salesforce error:', sfResponse.status, errorText);
      
      // Intentar parsear el error como JSON
      let errorMessage = 'Error al aprobar la orden en Salesforce';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          details: errorText 
        },
        { status: sfResponse.status }
      );
    }

    // 8. Parsear respuesta exitosa
    let result: { success?: boolean; message?: string; orden?: unknown };
    try {
      const text = await sfResponse.text();
      result = JSON.parse(text);
    } catch (parseError) {
      console.error('[Aprobar Orden] JSON parse error:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al parsear respuesta de Salesforce' 
        },
        { status: 502 }
      );
    }

    // 9. Validar que Salesforce indique éxito
    if (result.success === false) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message || 'Error desconocido al aprobar la orden' 
        },
        { status: 400 }
      );
    }

    console.log('[Aprobar Orden] Success for user:', user.email, 'Orden:', ordenId);

    // 10. Retornar respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: result.message || 'Orden aprobada correctamente',
        data: {
          orden: result.orden,
        },
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('[Aprobar Orden] Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
        return NextResponse.json(
          { success: false, error: 'No autorizado' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
