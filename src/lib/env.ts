/**
 * Validación y gestión de variables de entorno
 * Este archivo se ejecuta al iniciar la aplicación para asegurar
 * que todas las variables requeridas están configuradas
 */

interface EnvConfig {
  // Salesforce OAuth
  SALESFORCE_LOGIN_URL: string;
  SALESFORCE_CLIENT_ID: string;
  SALESFORCE_CLIENT_SECRET: string;
  SALESFORCE_USERNAME: string;
  SALESFORCE_PASSWORD: string;
  
  // Salesforce Instance
  SALESFORCE_INSTANCE_URL: string;
  
  // JWT
  JWT_SECRET?: string;
  
  // App
  NODE_ENV: string;
}

interface PublicEnvConfig {
  SALESFORCE_API_URL: string;
  APP_URL: string;
}

/**
 * Valida que una variable de entorno existe y no está vacía
 */
function validateEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `❌ Variable de entorno requerida no configurada: ${name}\n` +
      `Por favor, configura esta variable en tu archivo .env.local\n` +
      `Revisa .env.example para más información.`
    );
  }
  return value;
}

/**
 * Validación opcional (con warning en lugar de error)
 */
function validateOptionalEnvVar(name: string, value: string | undefined): string | undefined {
  if (!value || value.trim() === '') {
    console.warn(`⚠️  Variable de entorno opcional no configurada: ${name}`);
    return undefined;
  }
  return value;
}

/**
 * Variables de entorno del servidor (privadas)
 * Solo accesibles en API routes y server components
 */
export const serverEnv: EnvConfig = {
  // Salesforce OAuth
  SALESFORCE_LOGIN_URL: validateEnvVar(
    'SALESFORCE_LOGIN_URL',
    process.env.SALESFORCE_LOGIN_URL
  ),
  SALESFORCE_CLIENT_ID: validateEnvVar(
    'SALESFORCE_CLIENT_ID',
    process.env.SALESFORCE_CLIENT_ID
  ),
  SALESFORCE_CLIENT_SECRET: validateEnvVar(
    'SALESFORCE_CLIENT_SECRET',
    process.env.SALESFORCE_CLIENT_SECRET
  ),
  SALESFORCE_USERNAME: validateEnvVar(
    'SALESFORCE_USERNAME',
    process.env.SALESFORCE_USERNAME
  ),
  SALESFORCE_PASSWORD: validateEnvVar(
    'SALESFORCE_PASSWORD',
    process.env.SALESFORCE_PASSWORD
  ),
  
  // Salesforce Instance
  SALESFORCE_INSTANCE_URL: validateEnvVar(
    'SALESFORCE_INSTANCE_URL',
    process.env.SALESFORCE_INSTANCE_URL
  ),
  
  // JWT (opcional por ahora)
  JWT_SECRET: validateOptionalEnvVar(
    'JWT_SECRET',
    process.env.JWT_SECRET
  ),
  
  // Node
  NODE_ENV: process.env.NODE_ENV || 'development',
};

/**
 * Variables de entorno públicas (expuestas al cliente)
 * Solo variables con prefijo NEXT_PUBLIC_
 */
export const publicEnv: PublicEnvConfig = {
  SALESFORCE_API_URL: validateEnvVar(
    'NEXT_PUBLIC_SALESFORCE_API_URL',
    process.env.NEXT_PUBLIC_SALESFORCE_API_URL
  ),
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

/**
 * Verifica si estamos en modo desarrollo
 */
export const isDevelopment = serverEnv.NODE_ENV === 'development';

/**
 * Verifica si estamos en modo producción
 */
export const isProduction = serverEnv.NODE_ENV === 'production';

/**
 * Verifica si estamos en modo test
 */
export const isTest = serverEnv.NODE_ENV === 'test';

/**
 * Log de configuración (solo en desarrollo)
 */
if (isDevelopment) {
  console.log('🔧 Configuración de entorno:');
  console.log(`   NODE_ENV: ${serverEnv.NODE_ENV}`);
  console.log(`   Salesforce Instance: ${serverEnv.SALESFORCE_INSTANCE_URL}`);
  console.log(`   Salesforce User: ${serverEnv.SALESFORCE_USERNAME}`);
  console.log(`   App URL: ${publicEnv.APP_URL}`);
  console.log('✅ Variables de entorno validadas correctamente\n');
}
