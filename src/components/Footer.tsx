export default function Footer() {
  const socialLinks = [
    { icon: "fab fa-instagram", href: "https://www.instagram.com/coin.co.sas/", name: "Instagram" }
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
  {/* Separador superior minimal */}
  <div className="pt-8" />
  <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />

        {/* Copyright y enlaces adicionales */}
  <div className="py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-300 text-sm text-center md:text-left">
            <p>© 2025 Constructora De Infraestructura Colombiana COINCO S.A.S.</p>
            <p className="mt-1">Todos los derechos reservados. Hecho con ❤️ en Colombia por Chill Studio</p>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  title={social.name}
                  aria-label={social.name}
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-coinco-green transition-all duration-300 cursor-pointer"
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
            <a href="POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES COINCO SAS V1.pdf" className="text-gray-300 hover:text-coinco-green transition-colors duration-300 cursor-pointer">Política de Privacidad</a>
            <a href="Terminos y Condiciones Sitio Web Coinco V1.pdf" className="text-gray-300 hover:text-coinco-green transition-colors duration-300 cursor-pointer">Términos de Uso</a>
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
