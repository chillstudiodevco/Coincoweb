/**
 * Script de prueba de conexión con Salesforce
 * Ejecutar con: npx tsx scripts/test-salesforce.ts
 * o: node --loader ts-node/esm scripts/test-salesforce.ts
 */

import axios from 'axios';

// Cargar variables de entorno
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

interface SalesforceAuthResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
}

async function testSalesforceConnection() {
  console.log('\n🔧 Probando conexión con Salesforce...\n');

  // Validar variables
  const required = [
    'SALESFORCE_LOGIN_URL',
    'SALESFORCE_CLIENT_ID',
    'SALESFORCE_CLIENT_SECRET',
    'SALESFORCE_USERNAME',
    'SALESFORCE_PASSWORD',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Faltan variables de entorno:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n📝 Revisa SALESFORCE_SETUP.md para instrucciones\n');
    process.exit(1);
  }

  console.log('✅ Variables de entorno configuradas');
  console.log(`📍 Instance: ${process.env.SALESFORCE_INSTANCE_URL || 'No configurada'}`);
  console.log(`👤 Usuario: ${process.env.SALESFORCE_USERNAME}\n`);

  try {
    // Intentar autenticación
    console.log('🔐 Intentando autenticación...');
    
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: process.env.SALESFORCE_CLIENT_ID!,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
      username: process.env.SALESFORCE_USERNAME!,
      password: process.env.SALESFORCE_PASSWORD!,
    });

    const authResponse = await axios.post<SalesforceAuthResponse>(
      `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/token`,
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    console.log('✅ Autenticación exitosa!');
    console.log(`📌 Access Token: ${authResponse.data.access_token.substring(0, 20)}...`);
    console.log(`📌 Instance URL: ${authResponse.data.instance_url}\n`);

    // Intentar query a Salesforce
    console.log('🔍 Probando query de usuario...');
    
    const userQuery = await axios.get(
      `${authResponse.data.instance_url}/services/data/v59.0/query`,
      {
        params: {
          q: `SELECT Id, Username, Email, Name FROM User WHERE Username = '${process.env.SALESFORCE_USERNAME}' LIMIT 1`,
        },
        headers: {
          Authorization: `Bearer ${authResponse.data.access_token}`,
        },
      }
    );

    if (userQuery.data.records.length > 0) {
      const user = userQuery.data.records[0];
      console.log('✅ Usuario encontrado:');
      console.log(`   ID: ${user.Id}`);
      console.log(`   Nombre: ${user.Name}`);
      console.log(`   Email: ${user.Email}\n`);
    }

    // Test adicional: consultar organización
    console.log('🏢 Información de la organización...');
    
    const orgQuery = await axios.get(
      `${authResponse.data.instance_url}/services/data/v59.0/query`,
      {
        params: {
          q: 'SELECT Id, Name, OrganizationType, InstanceName FROM Organization LIMIT 1',
        },
        headers: {
          Authorization: `Bearer ${authResponse.data.access_token}`,
        },
      }
    );

    if (orgQuery.data.records.length > 0) {
      const org = orgQuery.data.records[0];
      console.log(`   Nombre: ${org.Name}`);
      console.log(`   Tipo: ${org.OrganizationType}`);
      console.log(`   Instance: ${org.InstanceName}\n`);
    }

    console.log('🎉 ¡Conexión con Salesforce completamente funcional!\n');
    console.log('📝 Próximos pasos:');
    console.log('   1. Iniciar servidor: npm run dev');
    console.log('   2. Probar login en: http://localhost:3000');
    console.log('   3. Verificar formularios de registro\n');

  } catch (error: any) {
    console.error('\n❌ Error en la conexión:\n');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Mensaje: ${JSON.stringify(error.response.data, null, 2)}\n`);
      
      if (error.response.status === 400) {
        console.error('💡 Posibles causas:');
        console.error('   - Consumer Key (CLIENT_ID) incorrecto');
        console.error('   - Consumer Secret (CLIENT_SECRET) incorrecto');
        console.error('   - Connected App no activada (espera 2-10 min después de crearla)\n');
      } else if (error.response.status === 401) {
        console.error('💡 Posibles causas:');
        console.error('   - Usuario o contraseña incorrectos');
        console.error('   - Security Token faltante o incorrecto');
        console.error('   - Password debe ser: contraseña + security_token (sin espacios)\n');
      }
    } else {
      console.error(error.message);
    }
    
    console.error('📖 Revisa SALESFORCE_SETUP.md para más ayuda\n');
    process.exit(1);
  }
}

// Ejecutar
testSalesforceConnection();
