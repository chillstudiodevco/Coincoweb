import Image from 'next/image';

export default function ProjectsSection() {
  const projects = [
    {
      src: "/CONSTRUCCION DE EDIFICACIONES.jpg",
      alt: "Construcción de Edificaciones",
      title: "Construcción de Edificaciones"
    },
    {
      src: "/MEJORAMIENTO DE VIVIENDA.jpg",
      alt: "Mejoramiento de vivienda",
      title: "Mejoramiento de vivienda"
    },
    {
      src: "/MANTENIMIENTO DE EDIFICACIONES.jpg",
      alt: "Mantenimiento de Edificaciones",
      title: "Mantenimiento de Edificaciones"
    },
    {
      src: "/REFORZAMIENTO ESTRUCTURAL.png",
      alt: "Reforzamiento estructural",
      title: "Reforzamiento estructural"
    },
    {
      src: "/MONTAJE DE CUBIERTAS.png",
      alt: "Montaje de cubiertas",
      title: "Montaje de cubiertas"
    },
    {
      src: "/INSTALACION DE PANELERIA ACUSTICA.jpg",
      alt: "Instalación de panelería acústica",
      title: "Instalación de panelería acústica"
    }
  ];


  return (
    <section id="proyectos" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-coinco-dark">Galería de Proyectos</h2>
          <p className="text-gray-600 mt-2 text-lg">Compromisos hechos realidad.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden group">
              <div className="relative h-64 w-full">
                <Image
                  src={project.src}
                  alt={project.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-center">{project.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
