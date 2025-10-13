import Link from 'next/link';
import Image from 'next/image';

export default function RegistroExitosoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header con logo */}
        <div className="bg-green-600 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-white rounded-full p-4">
              <Image 
                src="/CoincoLogo.png" 
                alt="Logo COINCO" 
                width={80} 
                height={80} 
                className="h-20 w-auto" 
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ¡Registro Completado!
          </h1>
          <p className="text-green-100">
            Tu información ha sido recibida exitosamente
          </p>
        </div>

        {/* Contenido */}
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check text-green-600 text-5xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Gracias por completar tu registro
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              Hemos recibido correctamente toda tu información y documentación.
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg text-left mb-8">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center">
              <i className="fas fa-info-circle mr-2"></i>
              Próximos pasos
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <i className="fas fa-check-circle mt-1 mr-2 text-blue-600"></i>
                <span>Nuestro equipo revisará tu información en las próximas 24-48 horas</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle mt-1 mr-2 text-blue-600"></i>
                <span>Recibirás un correo electrónico con la confirmación de tu registro</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle mt-1 mr-2 text-blue-600"></i>
                <span>Si necesitamos información adicional, nos pondremos en contacto contigo</span>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-4">
              ¿Tienes alguna pregunta? Contáctanos:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
              <a 
                href="mailto:info@coinco.com.co" 
                className="flex items-center text-green-600 hover:text-green-700"
              >
                <i className="fas fa-envelope mr-2"></i>
                info@coinco.com.co
              </a>
              <span className="hidden sm:inline text-gray-300">|</span>
              <a 
                href="tel:+573001234567" 
                className="flex items-center text-green-600 hover:text-green-700"
              >
                <i className="fas fa-phone mr-2"></i>
                (601) 123 4567
              </a>
            </div>
          </div>

          {/* Botón */}
          <Link 
            href="/" 
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <i className="fas fa-home mr-2"></i>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
