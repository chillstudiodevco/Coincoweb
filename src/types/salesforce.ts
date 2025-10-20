/**
 * Tipos relacionados con Salesforce API
 */

// Respuesta de autenticación OAuth
export interface SalesforceOAuthResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

// Usuario de Salesforce
export interface SalesforceUser {
  Id: string;
  Username: string;
  Email: string;
  Name: string;
  FirstName?: string;
  LastName?: string;
  IsActive: boolean;
  UserType?: string;
  CompanyName?: string;
  Division?: string;
  Department?: string;
  Title?: string;
  Phone?: string;
  MobilePhone?: string;
}

// Respuesta genérica de Salesforce
export interface SalesforceApiResponse<T = Record<string, unknown>> {
  records: T[];
  totalSize: number;
  done: boolean;
}

// Respuesta de creación/actualización de registro
export interface SalesforceCreateResponse {
  id: string;
  success: boolean;
  errors: SalesforceError[];
}

// Error de Salesforce
export interface SalesforceError {
  statusCode: string;
  message: string;
  fields: string[];
}

// ContentVersion (para archivos)
export interface ContentVersion {
  Id: string;
  Title: string;
  PathOnClient: string;
  VersionData?: string; // Base64
  ContentDocumentId?: string;
  FileType?: string;
  FileExtension?: string;
  ContentSize?: number;
  Description?: string;
}

// ContentDocumentLink (para asociar archivos con registros)
export interface ContentDocumentLink {
  Id: string;
  ContentDocumentId: string;
  LinkedEntityId: string;
  ShareType: 'V' | 'C' | 'I'; // V=Viewer, C=Collaborator, I=Inferred
  Visibility: 'AllUsers' | 'InternalUsers' | 'SharedUsers';
}

// Respuesta de subida de documento
export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  documentId?: string;
  versionId?: string;
}
