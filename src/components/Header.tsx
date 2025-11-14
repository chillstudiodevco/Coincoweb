 'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import LoginModal from '@/components/LoginModal';
import supabaseClient from '@/lib/supabase/client';

// Feature flags: control independiente de funcionalidades
const ENABLE_LOGIN_PORTAL = true; // Portal de proveedores (login/dashboard)
const ENABLE_THIRD_PARTY_REGISTRATION = true; // Registro de terceros

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
  };
  // placeholder (login modal manages its own password toggle)

  // login handled by LoginModal component

  const handleLogout = () => {
    setIsLoggedIn(false);
    try { localStorage.removeItem('user'); } catch {}
    // Cerrar sesión de Supabase
    supabaseClient.auth.signOut().catch(() => {});
    window.location.href = '/';
  };

  return (
    <>
      <header id="header" className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-100">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" title="COINCO S.A.S" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
            <Image 
              src="/logo_coinco_vec.svg" 
              alt="Logo de COINCO S.A.S" 
              width={120} 
              height={120} 
              className="h-14 sm:h-16 lg:h-20 w-auto" 
              priority
            />
          </a>
          
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#inicio" className="text-gray-700 font-medium transition-colors duration-300 relative group hover:text-green-600">
              Inicio
              <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{backgroundColor: '#006935'}}></span>
            </a>
            <a href="#nosotros" className="text-gray-700 font-medium transition-colors duration-300 relative group hover:text-green-600">
              Nosotros
              <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{backgroundColor: '#006935'}}></span>
            </a>
            <a href="#servicios" className="text-gray-700 font-medium transition-colors duration-300 relative group hover:text-green-600">
              Servicios
              <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{backgroundColor: '#006935'}}></span>
            </a>
            <a href="#proyectos" className="text-gray-700 font-medium transition-colors duration-300 relative group hover:text-green-600">
              Proyectos
              <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{backgroundColor: '#006935'}}></span>
            </a>
            <a href="#experiencia" className="text-gray-700 font-medium transition-colors duration-300 relative group hover:text-green-600">
              Experiencia
              <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{backgroundColor: '#006935'}}></span>
            </a>
            <a href="#contacto" className="text-gray-700 font-medium transition-colors duration-300 relative group hover:text-green-600">
              Contacto
              <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{backgroundColor: '#006935'}}></span>
            </a>
            {ENABLE_THIRD_PARTY_REGISTRATION && (
              <Link href="/registro-terceros" className="text-gray-700 font-medium transition-colors duration-300 relative group hover:text-green-600 border border-gray-300 px-3 py-2 rounded-lg hover:border-green-600">
                <i className="fas fa-user-plus mr-2"></i>
                Registro Terceros
              </Link>
            )}
          </div>
          
          {ENABLE_LOGIN_PORTAL && (
            <div className="hidden lg:flex">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Bienvenido, Proveedor</span>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 transition-colors duration-300 flex items-center cursor-pointer"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Salir
                  </button>
                </div>
              ) : (
                <button 
                  onClick={openModal}
                  className="text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center cursor-pointer"
                  style={{backgroundColor: '#006935'}}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#004d26'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#006935'}
                >
                  <i className="fas fa-user-shield mr-2"></i>
                  Acceso Proveedores
                </button>
              )}
            </div>
          )}
          
          <div className="lg:hidden">
            <button onClick={toggleMenu} className="text-coinco-dark focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300">
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>
          </div>
        </nav>
        
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-4 bg-gray-50/95 backdrop-blur-sm border-t border-gray-200">
            <a href="#inicio" onClick={closeMenu} className="block py-3 text-gray-700 hover:text-green-600 transition-colors duration-300 border-b border-gray-200 hover:border-green-600">Inicio</a>
            <a href="#nosotros" onClick={closeMenu} className="block py-3 text-gray-700 hover:text-green-600 transition-colors duration-300 border-b border-gray-200 hover:border-green-600">Nosotros</a>
            <a href="#servicios" onClick={closeMenu} className="block py-3 text-gray-700 hover:text-green-600 transition-colors duration-300 border-b border-gray-200 hover:border-green-600">Servicios</a>
            <a href="#proyectos" onClick={closeMenu} className="block py-3 text-gray-700 hover:text-green-600 transition-colors duration-300 border-b border-gray-200 hover:border-green-600">Proyectos</a>
            <a href="#experiencia" onClick={closeMenu} className="block py-3 text-gray-700 hover:text-green-600 transition-colors duration-300 border-b border-gray-200 hover:border-green-600">Experiencia</a>
            <a href="#contacto" onClick={closeMenu} className="block py-3 text-gray-700 hover:text-green-600 transition-colors duration-300 border-b border-gray-200 hover:border-green-600">Contacto</a>
            {(ENABLE_THIRD_PARTY_REGISTRATION || ENABLE_LOGIN_PORTAL) && (
              <>
                {ENABLE_THIRD_PARTY_REGISTRATION && (
                  <Link href="/registro-terceros" onClick={closeMenu} className="block py-3 text-gray-700 hover:text-green-600 transition-colors duration-300 border-b border-gray-200 hover:border-green-600">
                    <i className="fas fa-user-plus mr-2"></i>
                    Registro Terceros
                  </Link>
                )}
                {ENABLE_LOGIN_PORTAL && (
                  <>
                    {isLoggedIn ? (
                      <button 
                        onClick={() => {closeMenu(); handleLogout();}}
                        className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center cursor-pointer"
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Cerrar Sesión
                      </button>
                    ) : (
                      <button 
                        onClick={() => {closeMenu(); openModal();}}
                        className="mt-4 w-full text-white font-bold py-3 px-4 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center cursor-pointer"
                        style={{backgroundColor: '#006935'}}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#004d26'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#006935'}
                      >
                        <i className="fas fa-user-shield mr-2"></i>
                        Acceso Proveedores
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Login modal extracted to component */}
      {ENABLE_LOGIN_PORTAL && (
        <LoginModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSuccess={(user) => {
            setIsLoggedIn(true);
            // persist user and redirect to dashboard like previous behavior
            try { localStorage.setItem('user', JSON.stringify(user)); } catch {};
            window.location.href = '/dashboard';
          }}
        />
      )}
    </>
  );
}
