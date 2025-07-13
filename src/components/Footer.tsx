export default function Footer() {
  const socialLinks = [
    { icon: "fab fa-facebook-f", href: "#", name: "Facebook" },
    { icon: "fab fa-twitter", href: "#", name: "Twitter" },
    { icon: "fab fa-linkedin-in", href: "#", name: "LinkedIn" },
    { icon: "fab fa-instagram", href: "#", name: "Instagram" },
    { icon: "fab fa-youtube", href: "#", name: "YouTube" }
  ];

  const quickLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Nosotros", href: "#nosotros" },
    { name: "Servicios", href: "#servicios" },
    { name: "Proyectos", href: "#proyectos" },
    { name: "Contacto", href: "#contacto" }
  ];

  const services = [
    "Construcción de Obras Civiles",
    "Mejoramiento de Vivienda",
    "Mantenimiento Integral",
    "Reforzamiento Estructural"
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-coinco-dark to-black relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-coinco-green/5 to-transparent"></div>
        <div className="absolute top-10 right-20 w-32 h-32 bg-coinco-green/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Contenido principal del footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Información de la empresa */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <i className="fas fa-building mr-3 text-coinco-green"></i>
                COINCO S.A.S
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Más de 10 años construyendo confianza, calidad y compromiso en cada proyecto de ingeniería y construcción.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-gray-200">
                <i className="fas fa-map-marker-alt mr-3 text-coinco-green"></i>
                <span className="text-sm">Bogotá, Colombia</span>
              </div>
              <div className="flex items-center text-gray-200">
                <i className="fas fa-phone mr-3 text-coinco-green"></i>
                <span className="text-sm">(+57) 300 123 4567</span>
              </div>
              <div className="flex items-center text-gray-200">
                <i className="fas fa-envelope mr-3 text-coinco-green"></i>
                <span className="text-sm">contacto@coinco.com.co</span>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 flex items-center">
              <i className="fas fa-link mr-3 text-coinco-green"></i>
              Enlaces Rápidos
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-200 hover:text-coinco-green transition-colors duration-300 flex items-center group cursor-pointer"
                  >
                    <i className="fas fa-chevron-right mr-2 text-xs group-hover:translate-x-1 transition-transform duration-300"></i>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 flex items-center">
              <i className="fas fa-cogs mr-3 text-coinco-green"></i>
              Nuestros Servicios
            </h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="text-gray-200 text-sm flex items-start">
                    <i className="fas fa-check mr-2 text-coinco-green text-xs mt-1"></i>
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes sociales y newsletter */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 flex items-center">
              <i className="fas fa-share-alt mr-3 text-coinco-green"></i>
              Síguenos
            </h4>
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  title={social.name}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-200 hover:text-white hover:bg-coinco-green transition-all duration-300 transform hover:scale-110 cursor-pointer"
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-gray-200 text-sm mb-3">
                Recibe noticias sobre nuestros proyectos
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-coinco-green"
                />
                <button className="px-4 py-2 bg-coinco-green text-white rounded-r-lg hover:bg-green-700 transition-all duration-300 cursor-pointer">
                  <i className="fas fa-paper-plane text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria con gradiente */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Copyright y enlaces adicionales */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-300 text-sm text-center md:text-left">
            <p>© 2025 Constructora De Infraestructura Colombiana COINCO S.A.S.</p>
            <p className="mt-1">Todos los derechos reservados. Hecho con ❤️ en Colombia</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-300 hover:text-coinco-green transition-colors duration-300 cursor-pointer">
              Política de Privacidad
            </a>
            <a href="#" className="text-gray-300 hover:text-coinco-green transition-colors duration-300 cursor-pointer">
              Términos de Uso
            </a>
            <a href="#" className="text-gray-300 hover:text-coinco-green transition-colors duration-300 cursor-pointer">
              Aviso Legal
            </a>
          </div>
        </div>

        {/* Botón de volver arriba */}
        <div className="absolute bottom-8 right-8">
          <a
            href="#inicio"
            className="w-12 h-12 bg-coinco-green hover:bg-green-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-pulse-glow cursor-pointer"
          >
            <i className="fas fa-chevron-up"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
