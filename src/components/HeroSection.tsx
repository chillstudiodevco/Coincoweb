export default function HeroSection() {
  return (
    <section id="inicio" className="hero-bg h-screen flex items-center justify-center text-white relative overflow-hidden">
      {/* Overlay con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-coinco-green/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-32 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 right-20 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl"></div>
      
      <div className="text-center px-4 relative z-10 animate-fade-in-up">
        <div className="mb-6">
          <div className="inline-block p-4 bg-white/10 rounded-full backdrop-blur-sm mb-4">
            <i className="fas fa-building text-4xl text-coinco-green"></i>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 drop-shadow-2xl text-white">
          CONSTRUCTORA DE INFRAESTRUCTURA COLOMBIANA COINCO S.A.S
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
          Calidad, responsabilidad y mejora continua en cada proyecto.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="#servicios" 
            className="bg-coinco-green hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 text-lg shadow-lg hover:shadow-xl hover:scale-105 transform cursor-pointer"
          >
            <i className="fas fa-arrow-right mr-2"></i>
            Nuestros Servicios
          </a>
          <a 
            href="#nosotros" 
            className="border-2 border-white hover:border-white text-white font-bold py-4 px-8 rounded-full transition-all duration-300 text-lg backdrop-blur-sm hover:bg-white/20 cursor-pointer"
          >
            Conoce Más
          </a>
        </div>
      </div>
      
      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
