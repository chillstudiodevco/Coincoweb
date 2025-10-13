/**
 * Tipos relacionados con autenticación y autorización
 */

// Estado de usuario autenticado
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  role?: string;
  permissions?: string[];
}

// Credenciales de login
export interface LoginCredentials {
  username: string;
  password: string;
}

// Respuesta de autenticación
export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
  message?: string;
}

// Payload del JWT
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

// Estado de autenticación en el cliente
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Contexto de autenticación
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Token de sesión
export interface SessionToken {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}
