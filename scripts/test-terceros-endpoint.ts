/**
 * Script para probar el endpoint de validación de tokens de terceros
 * 
 * Uso:
 * 1. Configura las variables en .env.local
 * 2. Ejecuta: npx tsx scripts/test-terceros-endpoint.ts [TOKEN_AQUI]
 * 
 * Ejemplo:
 * npx tsx scripts/test-terceros-endpoint.ts asdqweq
 */

interface TerceroInfo {
  nombreProyecto: string;
  telefonoCuenta: string;
  emailCuenta: string;
  accountId: string;
  proyectoId: string;
  tipoTercero: string;
  email: string;
  nombreCuenta: string;
  jti: string;
  purpose: string;
  iat: number;
  exp: number;
}

interface ValidateTokenResponse {
  timestamp: string;
  success: boolean;
  message: string;
  data?: TerceroInfo;
}

async function testTercerosEndpoint(token: string) {

  // Leer variables de entorno
  const API_BASE = process.env.NEXT_PUBLIC_SALESFORCE_API_URL || process.env.SALESFORCE_INSTANCE_URL;
  const ACCESS_TOKEN = process.env.SALESFORCE_ACCESS_TOKEN;

  if (!API_BASE) {
    console.error('❌ Error: NEXT_PUBLIC_SALESFORCE_API_URL o SALESFORCE_INSTANCE_URL no está configurado');
    process.exit(1);
  }

  if (!ACCESS_TOKEN) {
    console.error('❌ Error: SALESFORCE_ACCESS_TOKEN no está configurado');
    process.exit(1);
  }


  try {
    // Construir URL completa
    const url = `${API_BASE}/terceros/validar?token=${token}`;

    // Hacer petición
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });


    // Parsear respuesta
    const data: ValidateTokenResponse = await response.json();

    if (response.ok && data.success) {
      
      if (data.data) {
        const expDate = new Date(data.data.exp);
        const now = new Date();
        const daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
      }

      
    } else {
      
      
    }

  } catch (error) {
    console.error('❌ Error de conexión:\n');
    if (error instanceof Error) {
      console.error(`   ${error.message}\n`);
    } else {
      console.error(`   ${error}\n`);
    }
    process.exit(1);
  }
}

// Main
const token = process.argv[2];

if (!token) {
  console.error('❌ Error: Debes proporcionar un token\n');
  process.exit(1);
}

testTercerosEndpoint(token);
