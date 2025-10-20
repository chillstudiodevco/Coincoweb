/**
 * Sistema de autenticación con Salesforce
 * Utiliza Edge Config + caché en memoria para tokens de acceso
 */

import { get } from '@vercel/edge-config';

// Caché en memoria (fallback y escritura)
let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

/**
 * Obtiene un nuevo token de Salesforce usando OAuth Password Flow
 */
async function getSalesforceToken(): Promise<string> {

  const loginUrl = process.env.SALESFORCE_LOGIN_URL;
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
  const username = process.env.SALESFORCE_USERNAME;
  const password = process.env.SALESFORCE_PASSWORD;

  if (!loginUrl || !clientId || !clientSecret || !username || !password) {
    throw new Error('Faltan credenciales de Salesforce en variables de entorno');
  }

  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientSecret,
      username: username,
      password: password,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ [AUTH] Error al obtener token de Salesforce:', error);
    throw new Error(`Failed to get Salesforce token: ${response.status}`);
  }

  const data = await response.json();
  
  return data.access_token;
}

/**
 * Obtiene un token válido de Salesforce
 * Intenta en este orden:
 * 1. Edge Config (si está configurado en Vercel)
 * 2. Caché en memoria (si existe y no expiró)
 * 3. Obtiene uno nuevo de Salesforce
 */
export async function getValidToken(): Promise<string> {

  // 1. Intentar obtener de Edge Config (solo funciona en Vercel)
  try {
    const edgeToken = await get<string>('salesforce_access_token');
    if (edgeToken) {
      // Guardar en caché local también
      cachedToken = edgeToken;
      tokenExpiresAt = Date.now() + (110 * 60 * 1000); // 110 minutos
      return edgeToken;
    }
  } catch {
    // Edge Config no está configurado o estamos en desarrollo local
  }

  // 2. Verificar caché en memoria
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    const minutesLeft = Math.floor((tokenExpiresAt - Date.now()) / 60000);
    return cachedToken;
  }

  // 3. Token expirado o no existe, obtener uno nuevo
  if (cachedToken) {
  }

  const newToken = await getSalesforceToken();

  // Guardar en caché en memoria
  cachedToken = newToken;
  tokenExpiresAt = Date.now() + (110 * 60 * 1000); // 110 minutos (buffer de 10min)


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
