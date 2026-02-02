/**
 * Sistema de autenticación con Salesforce
 * Utiliza Edge Config + caché en memoria para tokens de acceso
 */

import { get } from '@vercel/edge-config';

// Caché en memoria (fallback y escritura)
let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

/**
 * Valida si un token de Salesforce es válido haciendo una petición de prueba
 */
async function isTokenValid(token: string): Promise<boolean> {
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL;

  if (!instanceUrl) {
    console.warn('⚠️ [AUTH] SALESFORCE_INSTANCE_URL no configurada, no se puede validar token');
    return false;
  }

  try {
    console.log('🔍 [AUTH] Validando token de Salesforce...');

    // Hacer una petición ligera a Salesforce para verificar el token
    const response = await fetch(`${instanceUrl}/services/data/v59.0/limits`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const isValid = response.ok;
    console.log(isValid ? '✅ [AUTH] Token válido' : '❌ [AUTH] Token inválido o expirado');

    return isValid;
  } catch (error) {
    console.error('❌ [AUTH] Error al validar token:', error);
    return false;
  }
}

/**
 * Obtiene un nuevo token de Salesforce usando OAuth Password Flow
 */
async function getSalesforceToken(): Promise<string> {
  console.log('🔑 [AUTH] Obteniendo nuevo token de Salesforce...');

  const loginUrl = process.env.SALESFORCE_LOGIN_URL;
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;

  if (!loginUrl || !clientId || !clientSecret) {
    throw new Error('Faltan credenciales de Salesforce en variables de entorno');
  }



  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ [AUTH] Error al obtener token de Salesforce:', error);
    throw new Error(`Failed to get Salesforce token: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ [AUTH] Nuevo token obtenido exitosamente');

  return data.access_token;
}

/**
 * Obtiene un token válido de Salesforce
 * Intenta en este orden:
 * 1. Edge Config (si está configurado en Vercel) + valida
 * 2. Caché en memoria (si existe, no expiró y es válido)
 * 3. Obtiene uno nuevo de Salesforce
 */
export async function getValidToken(): Promise<string> {
  console.log('🚀 [AUTH] Iniciando proceso de obtención de token...');

  // 1. Intentar obtener de Edge Config (solo funciona en Vercel)
  try {
    const edgeToken = await get<string>('salesforce_access_token');
    if (edgeToken) {
      console.log('📦 [AUTH] Token encontrado en Edge Config, validando...');

      // Validar el token antes de usarlo
      const isValid = await isTokenValid(edgeToken);
      if (isValid) {
        console.log('✅ [AUTH] Token de Edge Config válido, usando...');
        // Guardar en caché local también
        cachedToken = edgeToken;
        tokenExpiresAt = Date.now() + (110 * 60 * 1000); // 110 minutos
        return edgeToken;
      } else {
        console.log('⚠️ [AUTH] Token de Edge Config inválido, obteniendo uno nuevo...');
      }
    }
  } catch {
    // Edge Config no está configurado o estamos en desarrollo local
    console.log('ℹ️ [AUTH] Edge Config no disponible, usando caché local');
  }

  // 2. Verificar caché en memoria
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    console.log('💾 [AUTH] Token en caché, validando...');

    // Validar el token en caché
    const isValid = await isTokenValid(cachedToken);
    if (isValid) {
      console.log('✅ [AUTH] Token en caché válido, usando...');
      return cachedToken;
    } else {
      console.log('⚠️ [AUTH] Token en caché inválido o expirado, obteniendo uno nuevo...');
      // Limpiar caché inválido
      cachedToken = null;
      tokenExpiresAt = null;
    }
  } else if (cachedToken) {
    console.log('⏰ [AUTH] Token en caché expiró, obteniendo uno nuevo...');
  }

  // 3. Token expirado o no existe, obtener uno nuevo
  const newToken = await getSalesforceToken();

  // Guardar en caché en memoria
  cachedToken = newToken;
  tokenExpiresAt = Date.now() + (110 * 60 * 1000); // 110 minutos (buffer de 10min)

  console.log('🎉 [AUTH] Nuevo token almacenado en caché');

  return newToken;
}

/**
 * Limpia el caché de tokens (útil para testing)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiresAt = null;
}

/**
 * Obtiene información sobre el estado del caché (útil para debugging)
 */
export function getTokenCacheInfo() {
  if (!cachedToken || !tokenExpiresAt) {
    return {
      cached: false,
      expiresAt: null,
      minutesLeft: 0,
    };
  }

  const minutesLeft = Math.floor((tokenExpiresAt - Date.now()) / 60000);

  return {
    cached: true,
    expiresAt: new Date(tokenExpiresAt).toISOString(),
    minutesLeft: minutesLeft > 0 ? minutesLeft : 0,
    expired: Date.now() >= tokenExpiresAt,
  };
}
