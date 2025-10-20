/**
 * Tipos relacionados con terceros e invitaciones
 */

export interface TerceroInfo {
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

export interface ValidateTokenResponse {
  timestamp?: string;
  success: boolean;
  message: string;
  data?: TerceroInfo;
}

export interface CompleteRegistrationPayload {
  // Información básica
  razonSocial?: string;
  nit?: string;
  digitoVerificacion?: string;
  tipoDocumento?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  
  // Información bancaria
  banco?: string;
  tipoCuenta?: string;
  numeroCuenta?: string;
  
  // Información tributaria
  regimenTributario?: string;
  granContribuyente?: boolean;
  autoretenedor?: boolean;
  
  // Representante legal (si aplica)
  nombreRepresentante?: string;
  documentoRepresentante?: string;
  telefonoRepresentante?: string;
  emailRepresentante?: string;
  
  // Archivos cargados
  documentos?: {
    rut?: File;
    camaraComercio?: File;
    cedulaRepresentante?: File;
    certificacionBancaria?: File;
  };
}

