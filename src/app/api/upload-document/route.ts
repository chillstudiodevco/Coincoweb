import { NextRequest, NextResponse } from 'next/server';

const SALESFORCE_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL || 'https://coinco.my.salesforce.com';
const SALESFORCE_ACCESS_TOKEN = process.env.SALESFORCE_ACCESS_TOKEN || '';

// Constantes de validación
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

interface UploadDocumentResponse {
  success: boolean;
  message: string;
  documentId?: string;
  versionId?: string;
}

/**
 * API Route para subir documentos a Salesforce como ContentVersion
 * POST /api/upload-document
 * 
 * FormData esperado:
 * - file: File (PDF, JPG, PNG)
 * - terceroId: string (ID del registro de Salesforce)
 * - tipoDocumento: string (ej: 'RUT', 'CamaraComercio', etc.)
 */
export async function POST(request: NextRequest): Promise<NextResponse<UploadDocumentResponse>> {
  try {
    // Validar token de Salesforce
    if (!SALESFORCE_ACCESS_TOKEN) {
      console.error('SALESFORCE_ACCESS_TOKEN no está configurado');
      return NextResponse.json(
        { success: false, message: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Obtener datos del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const terceroId = formData.get('terceroId') as string | null;
    const tipoDocumento = formData.get('tipoDocumento') as string | null;

    // Validaciones de entrada
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    if (!terceroId || !tipoDocumento) {
      return NextResponse.json(
        { success: false, message: 'Faltan parámetros requeridos (terceroId o tipoDocumento)' },
        { status: 400 }
      );
    }

    // Validar tamaño del archivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: `El archivo es demasiado grande (máximo ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Tipo de archivo no permitido. Solo PDF, JPG y PNG' },
        { status: 400 }
      );
    }

    // Convertir archivo a Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString('base64');

    // Preparar datos para Salesforce ContentVersion
    const contentVersionData = {
      Title: `${tipoDocumento}_${file.name}`,
      PathOnClient: file.name,
      VersionData: base64File,
      Description: `Documento tipo: ${tipoDocumento}`,
      // FirstPublishLocationId se puede establecer aquí si se conoce
    };

    // Paso 1: Crear ContentVersion en Salesforce
    const createResponse = await fetch(
      `${SALESFORCE_INSTANCE_URL}/services/data/v59.0/sobjects/ContentVersion`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SALESFORCE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentVersionData),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('Error creando ContentVersion:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          message: errorData[0]?.message || 'Error al subir el archivo a Salesforce' 
        },
        { status: 500 }
      );
    }

    const createResult = await createResponse.json();
    const contentVersionId = createResult.id;

    // Paso 2: Obtener el ContentDocumentId asociado
    const query = `SELECT ContentDocumentId FROM ContentVersion WHERE Id='${contentVersionId}'`;
    const queryResponse = await fetch(
      `${SALESFORCE_INSTANCE_URL}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${SALESFORCE_ACCESS_TOKEN}`,
        },
      }
    );

    if (!queryResponse.ok) {
      console.error('Error consultando ContentVersion');
      return NextResponse.json(
        { success: false, message: 'Error obteniendo información del documento' },
        { status: 500 }
      );
    }

    const queryResult = await queryResponse.json();
    const contentDocumentId = queryResult.records[0]?.ContentDocumentId;

    if (!contentDocumentId) {
      return NextResponse.json(
        { success: false, message: 'Error obteniendo el documento creado' },
        { status: 500 }
      );
    }

    // Paso 3: Crear ContentDocumentLink para asociar el documento con el tercero
    const linkData = {
      ContentDocumentId: contentDocumentId,
      LinkedEntityId: terceroId,
      ShareType: 'V', // V = Viewer permission
      Visibility: 'AllUsers',
    };

    const linkResponse = await fetch(
      `${SALESFORCE_INSTANCE_URL}/services/data/v59.0/sobjects/ContentDocumentLink`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SALESFORCE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
      }
    );

    if (!linkResponse.ok) {
      const errorData = await linkResponse.json();
      console.error('Error creando ContentDocumentLink:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          message: errorData[0]?.message || 'Error al asociar el documento con el registro' 
        },
        { status: 500 }
      );
    }

    // Éxito
    return NextResponse.json({
      success: true,
      message: 'Archivo subido exitosamente',
      documentId: contentDocumentId,
      versionId: contentVersionId,
    });

  } catch (error) {
    console.error('Error en upload-document:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
