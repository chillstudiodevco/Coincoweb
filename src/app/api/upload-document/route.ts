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
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { message: 'La subida de documentos está en desarrollo y no está disponible actualmente.' },
    { status: 503 } // 503 Service Unavailable
  );
}
