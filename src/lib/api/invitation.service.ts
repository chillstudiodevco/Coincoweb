/**
 * Servicio para gestionar tokens de invitación de terceros
 * Conecta con las API Routes de Next.js que actúan como proxy a Salesforce
 * Esto evita problemas de CORS y mantiene los tokens seguros en el servidor
 */

import type { 
  TerceroInfo, 
  ValidateTokenResponse, 
  CompleteRegistrationPayload 
} from '@/types/terceros';

class InvitationService {
  
  /**
   * Valida un token de invitación
   */
  async validateToken(token: string): Promise<ValidateTokenResponse> {
    
    try {
      // Construir URL completa (necesario para que funcione desde servidor y cliente)
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
      
      const url = `${baseUrl}/api/terceros/validar?token=${token}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('🔧 [SERVICE] Error en respuesta:', data.message);
        return {
          success: false,
          message: data.message || 'Error al validar el token',
        };
      }

      return data;
    } catch (error) {
      console.error('🔧 [SERVICE] Error en catch:', error);
      return {
        success: false,
        message: 'Error de conexión al validar el token',
      };
    }
  }

  /**
   * Completa el registro de un tercero
   */
  async completeRegistration(
    token: string,
    datosRegistro: CompleteRegistrationPayload
  ): Promise<ValidateTokenResponse> {
    
    try {
      // Construir URL completa (necesario para que funcione desde servidor y cliente)
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
      
      const url = `${baseUrl}/api/terceros/registro`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          datosRegistro,
        }),
      });

      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('🔧 [SERVICE] Error en respuesta:', data.message);
        return {
          success: false,
          message: data.message || 'Error al completar el registro',
        };
      }

      return data;
    } catch (error) {
      console.error('🔧 [SERVICE] Error en catch:', error);
      return {
        success: false,
        message: 'Error de conexión al completar el registro',
      };
    }
  }

  /**
   * Sube archivos a Salesforce (ContentVersion)
   */
  async uploadFile(
    terceroId: string,
    file: File,
    tipoDocumento: string
  ): Promise<{ success: boolean; documentId?: string; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('terceroId', terceroId);
      formData.append('tipoDocumento', tipoDocumento);

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      return {
        success: false,
        message: 'Error al subir el archivo',
      };
    }
  }

  /**
   * Verifica si un token está expirado sin hacer llamada al servidor
   */
  isTokenExpired(tokenData: TerceroInfo): boolean {
    const now = Date.now();
    return tokenData.exp < now;
  }

  /**
   * Obtiene el tiempo restante de un token en días
   */
  getTokenTimeRemaining(tokenData: TerceroInfo): number {
    const now = Date.now();
    const remaining = tokenData.exp - now;
    return Math.ceil(remaining / (1000 * 60 * 60 * 24));
  }
}

export const invitationService = new InvitationService();
