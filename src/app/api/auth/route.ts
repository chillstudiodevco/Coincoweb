import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Tipos para Salesforce
interface SalesforceAuthResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

interface SalesforceUserResponse {
  Id: string;
  Username: string;
  Email: string;
  Name: string;
  IsActive: boolean;
}

interface LoginRequest {
  username: string;
  password: string;
}

export async function POST(request: NextRequest) {
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
