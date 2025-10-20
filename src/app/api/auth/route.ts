import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: 'La autenticación está en desarrollo y no está disponible actualmente.' },
    { status: 503 } // 503 Service Unavailable
  );
}

// Método GET para verificar el estado de la API
export async function GET() {
  return NextResponse.json({
    message: 'API de autenticación COINCO funcionando',
    timestamp: new Date().toISOString()
  });
}