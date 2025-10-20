/**
 * Exportaciones centralizadas de tipos TypeScript
 */

// Tipos de autenticación
export type {
  AuthUser,
  LoginCredentials,
  AuthResponse,
  JWTPayload,
  AuthState,
  AuthContextType,
  SessionToken,
} from './auth';

// Tipos de Salesforce
export type {
  SalesforceOAuthResponse,
  SalesforceUser,
  SalesforceApiResponse,
  SalesforceCreateResponse,
  SalesforceError,
  ContentVersion,
  ContentDocumentLink,
  DocumentUploadResponse,
} from './salesforce';

// Tipos de terceros
export type {
  TerceroInfo,
  ValidateTokenResponse,
  CompleteRegistrationPayload,
} from './terceros';
