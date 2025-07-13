export default function AboutSection() {
  return (
    <section id="nosotros" className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-coinco-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-yellow-400/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-coinco-green/10 rounded-full mb-4">
            <i className="fas fa-users text-3xl text-coinco-green"></i>
          </div>
          <h2 className="text-4xl font-bold text-coinco-dark">
            Ingeniería y Construcción con Compromiso
          </h2>
          <p className="text-gray-600 mt-2 text-lg">Más de una década de experiencia a su servicio.</p>
          <div className="w-24 h-1 bg-coinco-green mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <p className="text-gray-700 text-lg leading-relaxed">
                Somos una empresa dedicada al desarrollo de proyectos de ingeniería y construcción con un firme compromiso hacia la <strong className="text-coinco-green">responsabilidad social, la calidad y la mejora continua</strong> durante más de diez años.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <p className="text-gray-700 leading-relaxed">
                Contamos con un equipo humano altamente calificado que trabaja día a día para brindar soluciones eficientes, sostenibles y orientadas a la satisfacción de nuestros clientes.
              </p>
            </div>
          </div>
          
          <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/30">
              <div className="bg-coinco-green p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-bullseye text-white text-2xl"></i>
              </div>
              <h4 className="font-bold text-xl mb-3 text-coinco-dark">Misión</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Desarrollar proyectos de ingeniería y construcción basados en principios de alta responsabilidad social para la satisfacción de los clientes y el crecimiento de la sociedad.
              </p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/30">
              <div className="bg-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-eye text-white text-2xl"></i>
              </div>
              <h4 className="font-bold text-xl mb-3 text-coinco-dark">Visión</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Consolidarnos como una empresa líder a nivel nacional, cumpliendo con tiempos, calidad y respeto al medio ambiente para exportar nuestra experiencia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
