import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '@/lib/salesforce/auth';
import { requireUser } from '@/lib/auth/requireUser';
import type { OrdenDeCompra, OrdenDeCompraCreatePayload, OrdenDeCompraUpdatePayload } from '@/types/dashboard';

const SALESFORCE_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL;

/**
 * GET /api/salesforce/ordenes-compra
 * Query params:
 *   - id: Get single orden by Id
 *   - participanteId: Get ordenes by participante (required if no id)
 *   - limit: Max records (default 100, max 500)
 *   - offset: Pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Validar usuario autenticado (token de Supabase)
    const user = await requireUser(request);
    
    // 2. Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const participanteId = searchParams.get('participanteId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // 3. Validar parámetros
    if (!id && !participanteId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Se requiere "id" o "participanteId" como parámetro' 
        },
        { status: 400 }
      );
    }

    // 4. Obtener token válido de Salesforce
    const salesforceToken = await getValidToken();

    // 5. Construir URL del endpoint de Salesforce
    let apexUrl = `${SALESFORCE_INSTANCE_URL}/services/apexrest/portal/ordenes`;
    
    if (id) {
      apexUrl += `?id=${encodeURIComponent(id)}`;
    } else if (participanteId) {
      apexUrl += `?participanteId=${encodeURIComponent(participanteId)}`;
      if (limit) apexUrl += `&limit=${encodeURIComponent(limit)}`;
      if (offset) apexUrl += `&offset=${encodeURIComponent(offset)}`;
    }

    console.log('[Ordenes Compra GET] Calling Salesforce:', apexUrl);

    // 6. Llamar a Salesforce
    const sfResponse = await fetch(apexUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${salesforceToken}`,
        'Content-Type': 'application/json',
      },
    });

    // 7. Manejar respuesta de Salesforce
    if (!sfResponse.ok) {
      const errorText = await sfResponse.text();
      console.error('[Ordenes Compra GET] Salesforce error:', sfResponse.status, errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al consultar órdenes en Salesforce',
          details: errorText 
        },
        { status: sfResponse.status }
      );
    }

    // 8. Parsear respuesta JSON
    let data: { orden?: OrdenDeCompra; ordenes?: OrdenDeCompra[] };
    try {
      const text = await sfResponse.text();
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('[Ordenes Compra GET] JSON parse error:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al parsear respuesta de Salesforce' 
        },
        { status: 502 }
      );
    }

    // 9. Retornar resultado exitoso
    console.log('[Ordenes Compra GET] Success for user:', user.email);
    return NextResponse.json({
      success: true,
      data: id ? { orden: data.orden } : { ordenes: data.ordenes || data || [] },
    });

  } catch (error: unknown) {
    console.error('[Ordenes Compra GET] Error:', error);
    
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

/**
 * POST /api/salesforce/ordenes-compra
 * Body: OrdenDeCompraCreatePayload { orden: {...}, partidas: [...] }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar usuario autenticado
    const user = await requireUser(request);

    // 2. Parsear body
    let body: OrdenDeCompraCreatePayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Body JSON inválido' },
        { status: 400 }
      );
    }

    // 3. Validar estructura y campos requeridos
    if (!body.orden || !body.partidas) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Se requiere objeto "orden" y array "partidas"' 
        },
        { status: 400 }
      );
    }

    if (!body.orden.Participante__c || !body.orden.Proyecto__c) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Participante__c y Proyecto__c son requeridos en orden' 
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.partidas) || body.partidas.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Se requiere al menos una partida' 
        },
        { status: 400 }
      );
    }

    // 4. Obtener token de Salesforce
    const salesforceToken = await getValidToken();

    // 5. Llamar a Salesforce para crear orden
    const apexUrl = `${SALESFORCE_INSTANCE_URL}/services/apexrest/portal/ordenes`;
    
    console.log('[Ordenes Compra POST] Creating orden for user:', user.email);

    const sfResponse = await fetch(apexUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${salesforceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 6. Manejar respuesta
    if (!sfResponse.ok) {
      const errorText = await sfResponse.text();
      console.error('[Ordenes Compra POST] Salesforce error:', sfResponse.status, errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al crear orden en Salesforce',
          details: errorText 
        },
        { status: sfResponse.status }
      );
    }

    // 7. Parsear respuesta
    let data: { orden?: OrdenDeCompra };
    try {
      const text = await sfResponse.text();
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('[Ordenes Compra POST] JSON parse error:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al parsear respuesta de Salesforce' 
        },
        { status: 502 }
      );
    }

    // 8. Retornar resultado
    console.log('[Ordenes Compra POST] Success. Created orden:', data.orden?.Id);
    return NextResponse.json(
      {
        success: true,
        data: data.orden,
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('[Ordenes Compra POST] Error:', error);
    
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

/**
 * PATCH /api/salesforce/ordenes-compra
 * Body: OrdenDeCompraUpdatePayload (must include Id)
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. Validar usuario autenticado
    await requireUser(request);

    // 2. Parsear body
    let body: OrdenDeCompraUpdatePayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Body JSON inválido' },
        { status: 400 }
      );
    }

    // 3. Validar que incluya Id
    if (!body.Id) {
      return NextResponse.json(
        { success: false, error: 'El campo Id es requerido' },
        { status: 400 }
      );
    }

    console.log('[Ordenes Compra PATCH] Updating orden:', body.Id);

    // 4. Obtener token de Salesforce
    const salesforceToken = await getValidToken();

    // 5. Llamar a Salesforce PATCH
    const apexUrl = `${SALESFORCE_INSTANCE_URL}/services/apexrest/portal/ordenes`;

    const sfResponse = await fetch(apexUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${salesforceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 6. Manejar respuesta
    if (!sfResponse.ok) {
      const errorText = await sfResponse.text();
      console.error('[Ordenes Compra PATCH] Salesforce error:', sfResponse.status, errorText);
      
      if (sfResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Orden no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al actualizar orden en Salesforce',
          details: errorText 
        },
        { status: sfResponse.status }
      );
    }

    // 7. Parsear respuesta
    let data: { orden?: OrdenDeCompra };
    try {
      const text = await sfResponse.text();
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('[Ordenes Compra PATCH] JSON parse error:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al parsear respuesta de Salesforce' 
        },
        { status: 502 }
      );
    }

    // 8. Retornar resultado
    console.log('[Ordenes Compra PATCH] Success. Updated orden:', body.Id);
    return NextResponse.json(
      {
        success: true,
        data: data.orden,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('[Ordenes Compra PATCH] Error:', error);
    
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

/**
 * DELETE /api/salesforce/ordenes-compra
 * Query params:
 *   - id: Orden Id to delete (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Validar usuario autenticado
    const user = await requireUser(request);

    // 2. Extraer parámetro id
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // 3. Validar que id esté presente
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'El parámetro id es requerido' },
        { status: 400 }
      );
    }

    console.log('[Ordenes Compra DELETE] Deleting orden:', id);

    // 4. Obtener token de Salesforce
    const salesforceToken = await getValidToken();

    // 5. Llamar a Salesforce DELETE
    const apexUrl = `${SALESFORCE_INSTANCE_URL}/services/apexrest/portal/ordenes?id=${encodeURIComponent(id)}`;

    const sfResponse = await fetch(apexUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${salesforceToken}`,
      },
    });

    // 6. Manejar respuesta
    if (!sfResponse.ok) {
      const errorText = await sfResponse.text();
      console.error('[Ordenes Compra DELETE] Salesforce error:', sfResponse.status, errorText);
      
      if (sfResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Orden no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al eliminar orden en Salesforce',
          details: errorText 
        },
        { status: sfResponse.status }
      );
    }

    // 7. Parsear respuesta (puede ser vacía)
    const text = await sfResponse.text();
    
    // Si no hay contenido o es respuesta vacía, considerar éxito
    if (!text || text.trim() === '') {
      console.log('[Ordenes Compra DELETE] Success. Deleted orden:', id);
      return NextResponse.json(
        {
          success: true,
          message: 'Orden eliminada exitosamente',
        },
        { status: 200 }
      );
    }

    // Intentar parsear respuesta JSON
    let data: { success?: boolean; error?: string };
    try {
      data = JSON.parse(text);
      
      // Si Salesforce retorna success: false
      if (data.success === false) {
        return NextResponse.json(
          { success: false, error: data.error || 'Error al eliminar orden' },
          { status: 400 }
        );
      }
    } catch {
      // Si no se puede parsear pero response.ok, considerar éxito
      console.log('[Ordenes Compra DELETE] Non-JSON response (OK). Deleted orden:', id);
    }

    // 8. Retornar resultado
    console.log('[Ordenes Compra DELETE] Success for user:', user.email);
    return NextResponse.json(
      {
        success: true,
        message: 'Orden eliminada exitosamente',
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('[Ordenes Compra DELETE] Error:', error);
    
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
