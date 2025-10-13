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
  console.log('🧪 Probando endpoint de validación de tokens de terceros\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Leer variables de entorno
  const API_BASE = process.env.NEXT_PUBLIC_SALESFORCE_API_URL || process.env.SALESFORCE_INSTANCE_URL;
  const ACCESS_TOKEN = process.env.SALESFORCE_ACCESS_TOKEN;

  if (!API_BASE) {
    console.error('❌ Error: NEXT_PUBLIC_SALESFORCE_API_URL o SALESFORCE_INSTANCE_URL no está configurado');
    console.log('\n💡 Configura en .env.local:');
    console.log('   NEXT_PUBLIC_SALESFORCE_API_URL=https://tu-instancia.my.salesforce.com/services/apexrest');
    console.log('   SALESFORCE_ACCESS_TOKEN=tu_access_token\n');
    process.exit(1);
  }

  if (!ACCESS_TOKEN) {
    console.error('❌ Error: SALESFORCE_ACCESS_TOKEN no está configurado');
    console.log('\n💡 Obtén tu access token con Postman o el script test-salesforce.ts\n');
    process.exit(1);
  }

  console.log('📋 Configuración:');
  console.log(`   API Base: ${API_BASE}`);
  console.log(`   Token: ${token}`);
  console.log(`   Access Token: ${ACCESS_TOKEN.substring(0, 20)}...`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Construir URL completa
    const url = `${API_BASE}/terceros/validar?token=${token}`;
    console.log(`🌐 Llamando a: ${url}\n`);

    // Hacer petición
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

    // Parsear respuesta
    const data: ValidateTokenResponse = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Token válido!\n');
      console.log('📦 Datos del tercero:');
      console.log(`   Proyecto: ${data.data?.nombreProyecto}`);
      console.log(`   Tipo: ${data.data?.tipoTercero}`);
      console.log(`   Cuenta: ${data.data?.nombreCuenta}`);
      console.log(`   Email: ${data.data?.email}`);
      console.log(`   Teléfono: ${data.data?.telefonoCuenta}`);
      console.log(`   Account ID: ${data.data?.accountId}`);
      console.log(`   Proyecto ID: ${data.data?.proyectoId}`);
      
      if (data.data) {
        const expDate = new Date(data.data.exp);
        const now = new Date();
        const daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`\n⏱️  Expiración:`);
        console.log(`   Fecha: ${expDate.toLocaleString('es-CO')}`);
        console.log(`   Días restantes: ${daysRemaining}`);
      }

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n✅ ¡Listo! Ahora puedes probar el formulario en:');
      console.log(`   http://localhost:3000/registro-invitacion/${token}\n`);
      
    } else {
      console.log('❌ Error en la validación:\n');
      console.log(`   Mensaje: ${data.message}`);
      console.log(`   Success: ${data.success}`);
      console.log(`   Timestamp: ${data.timestamp || 'N/A'}`);
      
      console.log('\n📝 Respuesta completa:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n💡 Posibles causas:');
      console.log('   • Token expirado (más de 7 días)');
      console.log('   • Token ya fue utilizado');
      console.log('   • Token inválido o malformado');
      console.log('   • Permisos insuficientes en Salesforce\n');
    }

  } catch (error) {
    console.error('❌ Error de conexión:\n');
    if (error instanceof Error) {
      console.error(`   ${error.message}\n`);
    } else {
      console.error(`   ${error}\n`);
    }
    console.log('💡 Verifica:');
    console.log('   • Que el servidor de desarrollo esté corriendo');
    console.log('   • Que la URL de Salesforce sea correcta');
    console.log('   • Que el Access Token no haya expirado');
    console.log('   • Tu conexión a internet\n');
    process.exit(1);
  }
}

// Main
const token = process.argv[2];

if (!token) {
  console.error('❌ Error: Debes proporcionar un token\n');
  console.log('Uso: npx tsx scripts/test-terceros-endpoint.ts [TOKEN]\n');
  console.log('Ejemplo:');
  console.log('  npx tsx scripts/test-terceros-endpoint.ts asdqweq\n');
  process.exit(1);
}

testTercerosEndpoint(token);
