import Image from 'next/image';

export default function ProjectsSection() {
  const projects = [
    {
      src: "https://i.imgur.com/uNf8m5W.jpeg",
      alt: "Construcción de Edificaciones",
      title: "Construcción de Edificaciones"
    },
    {
      src: "https://i.imgur.com/6Yp3j2f.jpeg",
      alt: "Demarcación Vial",
      title: "Demarcación Vial"
    },
    {
      src: "https://i.imgur.com/1nQY5q4.jpeg",
      alt: "Reforzamiento Estructural",
      title: "Reforzamiento Estructural"
    },
    {
      src: "https://i.imgur.com/7tC8A9S.jpeg",
      alt: "Construcción de Alcantarillado",
      title: "Construcción de Alcantarillado"
    },
    {
      src: "https://i.imgur.com/r3b7Y2g.jpeg",
      alt: "Mantenimiento de Vías",
      title: "Mantenimiento de Vías"
    },
    {
      src: "https://i.imgur.com/P2D9dYh.jpeg",
      alt: "Mantenimiento de Edificaciones - Grupo Aéreo del Oriente",
      title: "Mantenimiento de Edificaciones"
    }
  ];

  return (
    <section id="proyectos" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-coinco-dark">Galería de Proyectos</h2>
          <p className="text-gray-600 mt-2 text-lg">Nuestro compromiso y calidad en imágenes.</p>
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
