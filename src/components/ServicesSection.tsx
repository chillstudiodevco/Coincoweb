export default function ServicesSection() {
  const services = [
    {
      icon: "fas fa-hard-hat",
      title: "Construcción de Obras Civiles",
      description: "Ejecutamos proyectos a diversas escalas con metodologías modernas y control técnico riguroso.",
      color: "bg-orange-600",
      bgPattern: "bg-orange-50"
    },
    {
      icon: "fas fa-home-alt",
      title: "Mejoramiento de Vivienda",
      description: "Optimizamos edificaciones existentes, ampliando su funcionalidad, eficiencia y valor.",
      color: "bg-blue-600",
      bgPattern: "bg-blue-50"
    },
    {
      icon: "fas fa-tools",
      title: "Mantenimiento Integral",
      description: "Ofrecemos mantenimiento preventivo y correctivo para preservar la seguridad y estética de las infraestructuras.",
      color: "bg-purple-600",
      bgPattern: "bg-purple-50"
    },
    {
      icon: "fas fa-building-shield",
      title: "Reforzamiento Estructural",
      description: "Incrementamos la capacidad estructural de edificaciones para mejorar su resistencia sísmica y durabilidad.",
      color: "bg-coinco-green",
      bgPattern: "bg-green-50"
    }
  ];

  return (
    <section id="servicios" className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-coinco-green/10 to-transparent"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-coinco-green/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-white/10 rounded-full backdrop-blur-sm mb-6">
            <i className="fas fa-cogs text-4xl text-coinco-green"></i>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">Soluciones integrales en ingeniería y construcción con tecnología de vanguardia.</p>
          <div className="w-24 h-1 bg-coinco-green mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 text-center hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-4 hover:scale-105"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              {/* Icono con color sólido */}
              <div className={`relative mx-auto w-20 h-20 ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                <i className={`${service.icon} text-white text-3xl`}></i>
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <h3 className="text-xl font-bold mb-4 text-white group-hover:text-coinco-green transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                {service.description}
              </p>
              
              {/* Línea decorativa */}
              <div className={`w-0 h-1 ${service.color} mx-auto mt-6 rounded-full group-hover:w-16 transition-all duration-500`}></div>
            </div>
          ))}
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-16">
          <a 
            href="#proyectos" 
            className="inline-flex items-center bg-coinco-green hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
          >
            <span>Ver Nuestros Proyectos</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
