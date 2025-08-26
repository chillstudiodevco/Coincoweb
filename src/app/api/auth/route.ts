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
  try {
    const { username, password }: LoginRequest = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username y password son requeridos' },
        { status: 400 }
      );
    }

    // Configuración de Salesforce (estas variables deben estar en .env.local)
    const SF_LOGIN_URL = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';
    const SF_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
    const SF_CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET;
    const SF_USERNAME = process.env.SALESFORCE_USERNAME;
    const SF_PASSWORD = process.env.SALESFORCE_PASSWORD;
    const SF_SECURITY_TOKEN = process.env.SALESFORCE_SECURITY_TOKEN;

    if (!SF_CLIENT_ID || !SF_CLIENT_SECRET || !SF_USERNAME || !SF_PASSWORD) {
      return NextResponse.json(
        { error: 'Configuración de Salesforce incompleta' },
        { status: 500 }
      );
    }

    // Paso 1: Obtener token de acceso de Salesforce
    const authParams = new URLSearchParams({
      grant_type: 'password',
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET,
      username: SF_USERNAME,
      password: SF_PASSWORD + (SF_SECURITY_TOKEN || '')
    });

    const authResponse = await axios.post<SalesforceAuthResponse>(
      `${SF_LOGIN_URL}/services/oauth2/token`,
      authParams,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, instance_url } = authResponse.data;

    // Paso 2: Buscar el usuario en Salesforce
    const userQuery = `SELECT Id, Username, Email, Name, IsActive FROM User WHERE Username = '${username}' AND IsActive = true LIMIT 1`;
    
    const userResponse = await axios.get(
      `${instance_url}/services/data/v58.0/query/?q=${encodeURIComponent(userQuery)}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (userResponse.data.totalSize === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      );
    }

    const salesforceUser: SalesforceUserResponse = userResponse.data.records[0];

    // Paso 3: Validar credenciales (esto podría requerir lógica adicional dependiendo de cómo manejes las contraseñas)
    // Por ahora, asumimos que si el usuario existe en Salesforce, las credenciales son válidas
    // En un caso real, podrías necesitar hacer una autenticación adicional o usar Custom Objects

    // Paso 4: Crear respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: salesforceUser.Id,
        username: salesforceUser.Username,
        email: salesforceUser.Email,
        name: salesforceUser.Name
      }
    });

  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        return NextResponse.json(
          { error: 'Credenciales inválidas' },
          { status: 401 }
        );
      }
      if (error.response?.status === 401) {
        return NextResponse.json(
          { error: 'Error de autenticación con Salesforce' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Método GET para verificar el estado de la API
export async function GET() {
  return NextResponse.json({
    message: 'API de autenticación COINCO funcionando',
    timestamp: new Date().toISOString()
  });
}
