/**
 * API Route para completar el registro de terceros
 * Hace de proxy entre el frontend y Salesforce para evitar CORS
 */

import { NextRequest, NextResponse } from 'next/server';
import { getValidToken } from '@/lib/salesforce/auth';

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    { message: 'El registro de terceros está en desarrollo y no está disponible actualmente.' },
    { status: 503 } // 503 Service Unavailable
  );
}
