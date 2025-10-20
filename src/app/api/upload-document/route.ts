import { NextResponse } from 'next/server';

/**
 * API Route para subir documentos a Salesforce como ContentVersion
 * POST /api/upload-document
 * 
 * FormData esperado:
 * - file: File (PDF, JPG, PNG)
 * - terceroId: string (ID del registro de Salesforce)
 * - tipoDocumento: string (ej: 'RUT', 'CamaraComercio', etc.)
 */
export async function POST() {
  return NextResponse.json(
    { message: 'La subida de documentos está en desarrollo y no está disponible actualmente.' },
    { status: 503 } // 503 Service Unavailable
  );
}