'use client';

import { useState } from 'react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para enviar el formulario
    console.log('Formulario enviado:', formData);
  };

  const contactInfo = [
    {
      icon: "fas fa-map-marker-alt",
      title: "Ubicación",
      content: "Carrera 11 #92-20 oficina 302, Bogotá, Colombia",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: "fas fa-phone-alt", 
      title: "Teléfono",
      content: "(+57) 317 6816442",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: "fas fa-envelope",
      title: "Email",
      content: "administrativo@coincosas.com", 
      color: "from-coinco-green to-green-600"
    },
    {
      icon: "fas fa-clock",
      title: "Horarios",
      content: "Lun - Vie: 8:00 AM - 6:00 PM",
      color: "from-purple-500 to-violet-600"
    }
  ];

  return (
    <section id="contacto" className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
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
            <i className="fas fa-envelope text-4xl text-coinco-green"></i>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Contáctenos
          </h2>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            ¿Listo para empezar su próximo proyecto? Estamos aquí para ayudarle a hacerlo realidad.
          </p>
          <div className="w-24 h-1 bg-coinco-green mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Formulario */}
          <div className="lg:w-1/2">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
              <h3 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <i className="fas fa-paper-plane mr-3 text-coinco-green"></i>
                Enviar un Mensaje
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label className="block text-gray-300 mb-2 font-medium">Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Su nombre completo"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-coinco-green focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-gray-300 mb-2 font-medium">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="su.email@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-coinco-green focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-gray-300 mb-2 font-medium">Mensaje</label>
                  <textarea
                    name="message"
                    placeholder="Cuéntenos sobre su proyecto..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-coinco-green focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-coinco-green hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center cursor-pointer"
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="lg:w-1/2 space-y-6">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
              <h3 className="text-2xl font-semibold mb-6 text-white flex items-center">
                <i className="fas fa-info-circle mr-3 text-coinco-green"></i>
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => (
                  <div 
                    key={index}
                    className="group bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <i className={`${info.icon} text-white text-lg`}></i>
                    </div>
                    <h4 className="font-bold text-white mb-2">{info.title}</h4>
                    <p className="text-gray-300 text-sm">{info.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl">
              <h4 className="text-xl font-semibold mb-4 text-white flex items-center">
                <i className="fas fa-map mr-3 text-coinco-green"></i>
                Nuestra Ubicación
              </h4>
              <div className="rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d994.1376875508904!2d-74.04854598736819!3d4.6738760236567085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9a8e7f8e0bfd%3A0xe9aedeea054e0dd2!2sCra.%2011%20%2392-20%2C%20Bogot%C3%A1!5e0!3m2!1ses-419!2sco!4v1756824776506!5m2!1ses-419!2sco"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Ubicación de COINCO S.A.S"
                  className="grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
