'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { invitationService } from '@/lib/api';
import type { TerceroInfo, CompleteRegistrationPayload } from '@/types/terceros';

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function InvitationRegistrationPage({ params }: PageProps) {
  const router = useRouter();
  const [token, setToken] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [validatingToken, setValidatingToken] = useState(true);
  const [terceroInfo, setTerceroInfo] = useState<TerceroInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<CompleteRegistrationPayload>({
    razonSocial: '',
    nit: '',
    digitoVerificacion: '',
    tipoDocumento: 'NIT',
    telefono: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    banco: '',
    tipoCuenta: 'Ahorros',
    numeroCuenta: '',
    regimenTributario: 'Responsable de IVA',
    granContribuyente: false,
    autoretenedor: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    rut?: File;
    camaraComercio?: File;
    cedulaRepresentante?: File;
    certificacionBancaria?: File;
  }>({});

  // Obtener el token de params (Next.js 15 requiere await)
  useEffect(() => {
    async function loadToken() {
      const resolvedParams = await params;
      setToken(resolvedParams.token);
    }
    loadToken();
  }, [params]);

  // Validar token al cargar
  useEffect(() => {
    if (token) {
      validateInvitationToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const validateInvitationToken = async () => {
    
    setValidatingToken(true);
    setError(null);

    try {
      const response = await invitationService.validateToken(token);
      
        success: response.success,
        message: response.message,
        hasData: !!response.data
      });

      if (response.success && response.data) {
        setTerceroInfo(response.data);
        
        // Pre-llenar email si existe
        if (response.data?.email) {
          setFormData(prev => ({ ...prev, email: response.data!.email }));
        }
      } else {
        console.error('❌ [VALIDATION] Token inválido:', response.message);
        setError(response.message || 'Token inválido o expirado');
      }
    } catch (err) {
      console.error('❌ [VALIDATION] Error inesperado:', err);
      setError('Error al validar el token');
    }

    setValidatingToken(false);
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof typeof uploadedFiles) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [fileType]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Validar campos requeridos
      if (!formData.razonSocial || !formData.nit || !formData.telefono) {
        console.warn('⚠️  [SUBMIT] Faltan campos obligatorios');
        setError('Por favor completa todos los campos obligatorios');
        setIsSubmitting(false);
        return;
      }

      // Completar registro
      const response = await invitationService.completeRegistration(token, formData);
      
        success: response.success,
        message: response.message
      });

      if (response.success) {
        
        // Subir archivos si existen
        if (terceroInfo && Object.keys(uploadedFiles).length > 0) {
          
          for (const [tipo, file] of Object.entries(uploadedFiles)) {
            if (file) {
              await invitationService.uploadFile(terceroInfo.accountId, file, tipo);
            }
          }
        }

        setSubmitSuccess(true);
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push('/registro-exitoso');
        }, 3000);
      } else {
        console.error('❌ [SUBMIT] Error en el registro:', response.message);
        setError(response.message || 'Error al completar el registro');
      }
    } catch (err) {
      console.error('❌ [SUBMIT] Error inesperado:', err);
      setError('Error inesperado al procesar el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pantalla de carga
  if (loading || validatingToken) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando invitación...</p>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (error && !terceroInfo) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-red-500 text-6xl mb-4"></i>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Invitación Inválida</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-sm text-yellow-700">
                  Posibles razones:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                  <li>El enlace ha expirado (válido por 7 días)</li>
                  <li>El enlace ya fue utilizado</li>
                  <li>El enlace no es válido</li>
                </ul>
              </div>
              <Link 
                href="/" 
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de éxito
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <i className="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Registro Completado!</h2>
          <p className="text-gray-600 mb-6">
            Tu información ha sido registrada exitosamente. Serás redirigido en breve...
          </p>
          <div className="animate-pulse">
            <i className="fas fa-spinner fa-spin text-green-600 text-2xl"></i>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de registro
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Información del tercero */}
          {terceroInfo && (
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mb-6 shadow-sm">
              <h2 className="font-bold text-xl mb-2 text-green-800">
                Bienvenido al registro de terceros
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-green-700 font-semibold">Proyecto:</p>
                  <p className="text-green-900">{terceroInfo.nombreProyecto}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-semibold">Tipo de tercero:</p>
                  <p className="text-green-900">{terceroInfo.tipoTercero}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-semibold">Cuenta:</p>
                  <p className="text-green-900">{terceroInfo.nombreCuenta}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-semibold">Email:</p>
                  <p className="text-green-900">{terceroInfo.email}</p>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-4">
                <i className="fas fa-clock mr-1"></i>
                Este enlace expira el {new Date(terceroInfo.exp).toLocaleDateString('es-CO')}
              </p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 md:p-8">
            
            {/* Información Básica */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-600">
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="razonSocial"
                    value={formData.razonSocial}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nombre o razón social"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Documento
                  </label>
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="NIT">NIT</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIT/Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nit"
                    value={formData.nit}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Número sin puntos ni guiones"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dígito de Verificación
                  </label>
                  <input
                    type="text"
                    name="digitoVerificacion"
                    value={formData.digitoVerificacion}
                    onChange={handleInputChange}
                    maxLength={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="DV"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="3001234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Calle 123 # 45-67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Bogotá"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <input
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Cundinamarca"
                  />
                </div>
              </div>
            </section>

            {/* Información Bancaria */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-600">
                Información Bancaria
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banco
                  </label>
                  <select
                    name="banco"
                    value={formData.banco}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Seleccione un banco</option>
                    <option value="Bancolombia">Bancolombia</option>
                    <option value="Banco de Bogotá">Banco de Bogotá</option>
                    <option value="Davivienda">Davivienda</option>
                    <option value="BBVA">BBVA</option>
                    <option value="Colpatria">Colpatria</option>
                    <option value="Banco Popular">Banco Popular</option>
                    <option value="Banco de Occidente">Banco de Occidente</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cuenta
                  </label>
                  <select
                    name="tipoCuenta"
                    value={formData.tipoCuenta}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Ahorros">Ahorros</option>
                    <option value="Corriente">Corriente</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cuenta
                  </label>
                  <input
                    type="text"
                    name="numeroCuenta"
                    value={formData.numeroCuenta}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1234567890"
                  />
                </div>
              </div>
            </section>

            {/* Información Tributaria */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-600">
                Información Tributaria
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Régimen Tributario
                  </label>
                  <select
                    name="regimenTributario"
                    value={formData.regimenTributario}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Responsable de IVA">Responsable de IVA</option>
                    <option value="No responsable de IVA">No responsable de IVA</option>
                    <option value="Régimen Simple">Régimen Simple</option>
                  </select>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="granContribuyente"
                      checked={formData.granContribuyente}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Gran Contribuyente</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="autoretenedor"
                      checked={formData.autoretenedor}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Autoretenedor</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Documentos */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-600">
                Documentos Requeridos
              </h3>
              
              <div className="space-y-4">
                <FileUploadField
                  label="RUT actualizado"
                  fileType="rut"
                  file={uploadedFiles.rut}
                  onChange={handleFileChange}
                  required
                />
                
                <FileUploadField
                  label="Cámara de Comercio (si aplica)"
                  fileType="camaraComercio"
                  file={uploadedFiles.camaraComercio}
                  onChange={handleFileChange}
                />
                
                <FileUploadField
                  label="Cédula Representante Legal (si aplica)"
                  fileType="cedulaRepresentante"
                  file={uploadedFiles.cedulaRepresentante}
                  onChange={handleFileChange}
                />
                
                <FileUploadField
                  label="Certificación Bancaria"
                  fileType="certificacionBancaria"
                  file={uploadedFiles.certificacionBancaria}
                  onChange={handleFileChange}
                />
              </div>
            </section>

            {/* Error message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-red-700">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Completar Registro
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// Componente auxiliar para subida de archivos
type FileTypeKey = 'rut' | 'camaraComercio' | 'cedulaRepresentante' | 'certificacionBancaria';

interface FileUploadFieldProps {
  label: string;
  fileType: FileTypeKey;
  file?: File;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, fileType: FileTypeKey) => void;
  required?: boolean;
}

function FileUploadField({ label, fileType, file, onChange, required = false }: FileUploadFieldProps) {
  return (
    <div className="border rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="flex items-center space-x-4">
        <label
          htmlFor={`${fileType}-upload`}
          className="cursor-pointer flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <i className="fas fa-upload mr-2"></i>
          Seleccionar archivo
        </label>
        <input
          type="file"
          id={`${fileType}-upload`}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onChange(e, fileType)}
        />
        
        {file && (
          <div className="flex items-center text-sm text-green-600">
            <i className="fas fa-check-circle mr-2"></i>
            <span className="font-medium">{file.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
