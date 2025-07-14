'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FormData {
  // Información del tercero
  nombreCompleto: string;
  tipoDocumento: string;
  documento: string;
  telefono: string;
  email: string;
  
  // Información del servicio
  tipoServicio: string;
  descripcionServicio: string;
  codigoCiiu: string;
  municipio: string;
  tipoContrato: string;
  
  // Información de pago
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  formaPago: string;
  proyecto: string;
}

interface UploadedFiles {
  rut: File | null;
  certificacionBancaria: File | null;
  contratoOrden: File | null;
  cedula: File | null;
  certificadoEPS: File | null;
  certificadoAFP: File | null;
  polizas: File | null;
}

export default function ThirdPartyRegistration() {
  const [formData, setFormData] = useState<FormData>({
    nombreCompleto: '',
    tipoDocumento: '',
    documento: '',
    telefono: '',
    email: '',
    tipoServicio: '',
    descripcionServicio: '',
    codigoCiiu: '',
    municipio: '',
    tipoContrato: '',
    banco: '',
    tipoCuenta: '',
    numeroCuenta: '',
    formaPago: '',
    proyecto: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    rut: null,
    certificacionBancaria: null,
    contratoOrden: null,
    cedula: null,
    certificadoEPS: null,
    certificadoAFP: null,
    polizas: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (fileType: keyof UploadedFiles, file: File | null) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof UploadedFiles) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type === 'application/pdf') {
      handleFileUpload(fileType, file);
    } else if (file) {
      alert('Por favor, sube solo archivos en formato PDF.');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar campos obligatorios
      const requiredFields = [
        'nombreCompleto', 'tipoDocumento', 'documento', 'telefono', 'email',
        'tipoServicio', 'descripcionServicio', 'codigoCiiu', 'tipoCuenta'
      ];

      for (const field of requiredFields) {
        if (!formData[field as keyof FormData]) {
          alert(`El campo ${field} es obligatorio.`);
          setIsSubmitting(false);
          return;
        }
      }

      // Validar archivos obligatorios
      if (!uploadedFiles.rut || !uploadedFiles.certificacionBancaria) {
        alert('Los documentos RUT y Certificación Bancaria son obligatorios.');
        setIsSubmitting(false);
        return;
      }

      // Simular envío de formulario
      console.log('Datos del formulario:', formData);
      console.log('Archivos adjuntos:', uploadedFiles);

      // Simular delay de envío
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('¡Registro enviado exitosamente! Recibirás una confirmación por correo electrónico una vez sea revisado por nuestro equipo.');
      
      // Resetear formulario
      setFormData({
        nombreCompleto: '',
        tipoDocumento: '',
        documento: '',
        telefono: '',
        email: '',
        tipoServicio: '',
        descripcionServicio: '',
        codigoCiiu: '',
        municipio: '',
        tipoContrato: '',
        banco: '',
        tipoCuenta: '',
        numeroCuenta: '',
        formaPago: '',
        proyecto: ''
      });
      
      setUploadedFiles({
        rut: null,
        certificacionBancaria: null,
        contratoOrden: null,
        cedula: null,
        certificadoEPS: null,
        certificadoAFP: null,
        polizas: null
      });

    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert('Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadSection = ({ 
    title, 
    fileType, 
    isRequired = false 
  }: { 
    title: string; 
    fileType: keyof UploadedFiles; 
    isRequired?: boolean;
  }) => (
    <div className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div className="font-medium">
        {title}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </div>
      <div>
        <label 
          htmlFor={`${fileType}-upload`} 
          className="cursor-pointer flex items-center justify-center p-4 border-2 border-dashed rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors duration-300"
        >
          <i className="fas fa-upload mr-2"></i> 
          Cargar archivos <span className="mx-2">O</span> suelte archivos
        </label>
        <input 
          type="file" 
          id={`${fileType}-upload`} 
          className="hidden"
          accept=".pdf"
          onChange={(e) => handleFileChange(e, fileType)}
        />
        <p className="text-xs text-gray-500 mt-2">
          Archivo cargado: 
          <span className="font-medium text-gray-700 ml-1">
            {uploadedFiles[fileType]?.name || 'Ningún archivo seleccionado'}
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" title="COINCO S.A.S" className="flex items-center">
            <Image 
              src="/CoincoLogo.png" 
              alt="Logo de COINCO S.A.S" 
              width={48} 
              height={48} 
              className="h-12 w-auto" 
            />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-coinco-dark hidden sm:block">
            Portal de Terceros
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Información introductoria */}
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-6 rounded-r-lg mb-8 shadow-sm">
            <h2 className="font-bold text-xl mb-2">¡Bienvenido al formulario de registro de terceros!</h2>
            <p className="mb-4">
              Por favor, completa la siguiente información para registrar tus datos como proveedor, 
              contratista, profesional o tercero asociado.
            </p>
            <p className="font-semibold">Importante:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Asegúrate de diligenciar todos los campos obligatorios.</li>
              <li>Podrás registrar múltiples servicios si aplican.</li>
              <li>Al final del proceso, deberás cargar algunos documentos requeridos (RUT, certificación bancaria, contrato u orden de servicio y, si aplica, pólizas).</li>
            </ul>
            <p className="mt-4">
              Tu información será revisada por nuestro equipo de apoyo a gerencia y contabilidad. 
              Recibirás confirmación una vez tu registro sea aprobado.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-md">
            
            {/* Información del tercero */}
            <fieldset className="mb-8">
              <legend className="text-2xl font-bold text-coinco-dark border-b-2 pb-2 mb-6 w-full" style={{borderColor: '#006935'}}>
                Información del tercero
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombreCompleto" className="block mb-2 font-medium text-gray-700">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="nombreCompleto"
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tipoDocumento" className="block mb-2 font-medium text-gray-700">
                    Tipo de documento <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="tipoDocumento"
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  >
                    <option value="">--Seleccionar--</option>
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="NIT">Número de Identificación Tributaria (NIT)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="documento" className="block mb-2 font-medium text-gray-700">
                    Documento <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="documento"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="telefono" className="block mb-2 font-medium text-gray-700">
                    Número de teléfono o celular <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Información del servicio */}
            <fieldset className="mb-8">
              <legend className="text-2xl font-bold text-coinco-dark border-b-2 pb-2 mb-6 w-full" style={{borderColor: '#006935'}}>
                Información del servicio
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="tipoServicio" className="block mb-2 font-medium text-gray-700">
                    Tipo de servicio <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="tipoServicio"
                    name="tipoServicio"
                    value={formData.tipoServicio}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  >
                    <option value="">--Seleccionar--</option>
                    <option value="Consultoría">Consultoría</option>
                    <option value="Construcción">Construcción</option>
                    <option value="Suministros">Suministros</option>
                    <option value="Transporte">Transporte</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="codigoCiiu" className="block mb-2 font-medium text-gray-700">
                    Código CIIU <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="codigoCiiu"
                    name="codigoCiiu"
                    value={formData.codigoCiiu}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="descripcionServicio" className="block mb-2 font-medium text-gray-700">
                    Descripción del servicio <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="descripcionServicio"
                    name="descripcionServicio"
                    value={formData.descripcionServicio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="municipio" className="block mb-2 font-medium text-gray-700">
                    Municipio de realización del servicio
                  </label>
                  <input 
                    type="text" 
                    id="municipio"
                    name="municipio"
                    value={formData.municipio}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div>
                  <label htmlFor="tipoContrato" className="block mb-2 font-medium text-gray-700">
                    Tipo de contrato
                  </label>
                  <select 
                    id="tipoContrato"
                    name="tipoContrato"
                    value={formData.tipoContrato}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="">--Seleccionar--</option>
                    <option value="Prestación de Servicios">Prestación de Servicios</option>
                    <option value="Obra o Labor">Obra o Labor</option>
                    <option value="Término Fijo">Término Fijo</option>
                    <option value="Término Indefinido">Término Indefinido</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Información de pago */}
            <fieldset className="mb-8">
              <legend className="text-2xl font-bold text-coinco-dark border-b-2 pb-2 mb-6 w-full" style={{borderColor: '#006935'}}>
                Información de pago
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="banco" className="block mb-2 font-medium text-gray-700">
                    Banco
                  </label>
                  <input 
                    type="text" 
                    id="banco"
                    name="banco"
                    value={formData.banco}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div>
                  <label htmlFor="tipoCuenta" className="block mb-2 font-medium text-gray-700">
                    Tipo de cuenta <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="tipoCuenta"
                    name="tipoCuenta"
                    value={formData.tipoCuenta}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  >
                    <option value="">--Seleccionar--</option>
                    <option value="Ahorros">Ahorros</option>
                    <option value="Corriente">Corriente</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="numeroCuenta" className="block mb-2 font-medium text-gray-700">
                    Número de cuenta
                  </label>
                  <input 
                    type="text" 
                    id="numeroCuenta"
                    name="numeroCuenta"
                    value={formData.numeroCuenta}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div>
                  <label htmlFor="formaPago" className="block mb-2 font-medium text-gray-700">
                    Forma de pago
                  </label>
                  <select 
                    id="formaPago"
                    name="formaPago"
                    value={formData.formaPago}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#006935'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="">--Seleccionar--</option>
                    <option value="Transferencia Electrónica">Transferencia Electrónica</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="md:col-span-2 relative">
                  <label htmlFor="proyecto" className="block mb-2 font-medium text-gray-700">
                    Proyecto
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      id="proyecto"
                      name="proyecto"
                      value={formData.proyecto}
                      onChange={handleInputChange}
                      placeholder="Buscar Proyectos..."
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                      style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = '#006935'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    <i className="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Carga de documentos */}
            <fieldset className="mb-8">
              <legend className="text-2xl font-bold text-coinco-dark border-b-2 pb-2 mb-6 w-full" style={{borderColor: '#006935'}}>
                Carga de Documentos
              </legend>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-6 rounded-r-lg mb-8 shadow-sm">
                <p className="font-semibold">Para completar tu registro, por favor adjunta los siguientes documentos:</p>
                <div className="mt-4">
                  <p className="font-bold">Documentos obligatorios:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>RUT (Registro Único Tributario vigente)</li>
                    <li>Certificación bancaria (no mayor a 30 días)</li>
                    <li>Contrato u orden de servicio firmada (si aplica)</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <p className="font-bold">Documentos adicionales:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Pólizas (solo si eres un contratista de obra)</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <p className="font-bold">Indicaciones:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Los archivos deben estar en formato PDF.</li>
                    <li>Puedes cargar un archivo por cada categoría.</li>
                    <li>Asegúrate de que los documentos sean legibles y estén actualizados.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <FileUploadSection title="RUT" fileType="rut" isRequired />
                <FileUploadSection title="Certificación bancaria" fileType="certificacionBancaria" isRequired />
                <FileUploadSection title="Contrato u orden de servicio" fileType="contratoOrden" />
                <FileUploadSection title="Cédula" fileType="cedula" />
                <FileUploadSection title="Certificado afiliación EPS" fileType="certificadoEPS" />
                <FileUploadSection title="Certificado afiliación AFP" fileType="certificadoAFP" />
                <FileUploadSection title="Pólizas" fileType="polizas" />
              </div>
            </fieldset>

            {/* Botones de acción */}
            <div className="mt-10 flex justify-between items-center">
              <button 
                type="button" 
                onClick={() => window.history.back()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300 cursor-pointer"
              >
                Anterior
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`font-bold py-3 px-8 rounded-lg transition duration-300 cursor-pointer ${
                  isSubmitting 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'text-white hover:opacity-90'
                }`}
                style={!isSubmitting ? {backgroundColor: '#006935'} : {}}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Enviando...
                  </span>
                ) : (
                  'Finalizar'
                )}
              </button>
            </div>

          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center mt-8 py-6 border-t bg-white">
        <p className="text-sm text-gray-500">
          © 2025 Constructora De Infraestructura Colombiana COINCO S.A.S.
        </p>
      </footer>
    </div>
  );
}
