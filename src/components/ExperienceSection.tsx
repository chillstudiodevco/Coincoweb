import Image from 'next/image';

export default function ExperienceSection() {
  const stats = [
    {
      number: "10+",
      label: "Años de Experiencia",
      icon: "fas fa-calendar-alt",
      color: "text-blue-500"
    },
    {
      number: "100+",
      label: "Proyectos Completados",
      icon: "fas fa-building",
      color: "text-coinco-green"
    },
    {
      number: "50+",
      label: "Clientes Satisfechos",
      icon: "fas fa-handshake",
      color: "text-purple-500"
    },
    {
      number: "99%",
      label: "Proyectos a Tiempo",
      icon: "fas fa-clock",
      color: "text-orange-500"
    }
  ];

  interface ClientItem {
    name: string;
    category: string;
    logo: string; // ruta dentro de /public o URL remota permitida en next.config
  }

  const clients: ClientItem[] = [
    {
      name: "Caja de la Vivienda Popular",
      category: "Entidad Pública",
      logo: "/cvp.png" // Reemplaza con /logos/caja-vivienda.png si agregas archivo
    },
    {
      name: "Fiduciaria Bogotá",
      category: "Sector Financiero",
      logo: "/fiduciaria_bogota.jpg" // Placeholder
    },
    {
      name: "Rama Judicial",
      category: "Entidad Pública",
      logo: "/rama_judicial.png"
    },
    {
      name: "Fuerza Aérea Colombiana",
      category: "Sector Defensa",
      logo: "/fac.jpg"
    },
    {
      name: "Secretaría Distrital del Hábitat",
      category: "Entidad Pública",
      logo: "/secretaria_habitat.jpg" // Temporal, reemplazar cuando tengas el logo real
    }
  ];

  return (
    <section id="experiencia" className="py-24 bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-20 w-64 h-64 bg-coinco-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-coinco-green/10 rounded-full mb-6">
            <i className="fas fa-trophy text-3xl text-coinco-green"></i>
          </div>
          <h2 className="text-4xl font-bold text-coinco-dark mb-4">
            Experiencia Comprobada
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Más de una década construyendo confianza y excelencia en cada proyecto
          </p>
          <div className="w-24 h-1 bg-coinco-green mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/30 text-center"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <div className={`${stat.color} text-4xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <i className={stat.icon}></i>
              </div>
              <div className="text-3xl font-bold text-coinco-dark mb-2 group-hover:text-coinco-green transition-colors duration-300">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Clientes */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/30">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-coinco-dark mb-2">Nuestros Contratantes</h3>
            <p className="text-gray-600">Hemos tenido el honor de trabajar con entidades de prestigio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {clients.map((client, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 rounded-full overflow-hidden ring-2 ring-coinco-green/30 bg-white flex items-center justify-center">
                    <Image
                      src={client.logo}
                      alt={`Logo ${client.name}`}
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-coinco-dark mb-1 group-hover:text-coinco-green transition-colors duration-300">
                    {client.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {client.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
