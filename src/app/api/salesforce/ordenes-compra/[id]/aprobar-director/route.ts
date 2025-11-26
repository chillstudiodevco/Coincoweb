import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '@/lib/salesforce/auth';
import { requireUser } from '@/lib/auth/requireUser';

const SALESFORCE_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL;

/**
 * PATCH /api/salesforce/ordenes-compra/{ordenId}/aprobar-director
 * 
 * Aprueba una requisición por parte del Director de Obra (usuario con Aprobardor_de_ordenes__c = true)
 * - Cambia estado de "Requisición generada" a "Requisición aprobada"
 * - Registra fecha de aprobación por el director
 * - Opcionalmente puede incluir observaciones del director
 * 
 * IMPORTANTE: Este endpoint valida en Salesforce que el usuario actual tenga un participante
 * con Aprobardor_de_ordenes__c = true en el proyecto de la orden. Si no es aprobador, retornará error.
 * Un aprobador puede aprobar TODAS las órdenes de su proyecto, no solo las suyas.
 * 
 * Body: {
 *   observaciones?: string
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

    // 3. Parsear body (opcional)
    let body: {
      observaciones?: string;
    } = {};
    
    try {
      const requestBody = await request.json();
      body = requestBody;
    } catch {
      // Body es opcional, continuar sin error
    }

    console.log('[Aprobar Director] Processing approval for orden:', ordenId);
    console.log('[Aprobar Director] User:', user.email);
    console.log('[Aprobar Director] Observaciones:', body.observaciones);

    // 4. Obtener token de Salesforce
    const salesforceToken = await getValidToken();

    // 5. Llamar al endpoint de Salesforce /portal/ordenes/{ordenId}/aprobar-director
    const apexUrl = `${SALESFORCE_INSTANCE_URL}/services/apexrest/portal/ordenes/${ordenId}/aprobar-director`;
    
    const requestBody = {
      observaciones: body.observaciones || '',
    };

    console.log('[Aprobar Director] Salesforce URL:', apexUrl);
    console.log('[Aprobar Director] Sending to Salesforce:', requestBody);

    const sfResponse = await fetch(apexUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${salesforceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // 6. Manejar respuesta de Salesforce
    if (!sfResponse.ok) {
      const errorText = await sfResponse.text();
      console.error('[Aprobar Director] Salesforce error:', sfResponse.status, errorText);
      
      // Intentar parsear el error como JSON
      let errorMessage = 'Error al aprobar la requisición en Salesforce';
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

    // 7. Parsear respuesta exitosa
    let result: { success?: boolean; message?: string; orden?: unknown };
    try {
      const text = await sfResponse.text();
      result = JSON.parse(text);
    } catch (parseError) {
      console.error('[Aprobar Director] JSON parse error:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al parsear respuesta de Salesforce' 
        },
        { status: 502 }
      );
    }

    // 8. Validar que Salesforce indique éxito
    if (!result.success) {
      console.error('[Aprobar Director] Salesforce returned success=false:', result);
      return NextResponse.json(
        { 
          success: false, 
          error: result.message || 'Error al aprobar la requisición' 
        },
        { status: 400 }
      );
    }

    console.log('[Aprobar Director] Success. Orden approved by director:', ordenId);

    // 9. Retornar respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: result.message || 'Requisición aprobada exitosamente',
        data: {
          orden: result.orden,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Aprobar Director] Unexpected error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
