'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Feature flags: control independiente de funcionalidades
const ENABLE_LOGIN_PORTAL = false; // Portal de proveedores (login/dashboard)
const ENABLE_THIRD_PARTY_REGISTRATION = true; // Registro de terceros

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setLoginData({ username: '', password: '' });
    setError('');
  };
  const togglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
        closeModal();
        // Guardar información del usuario en localStorage si es necesario
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirigir al dashboard
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Error en el login');
      }
    } catch (err) {
      setError('Error de conexión. Inténtelo de nuevo.');
      console.error('Error en login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
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

      {/* Modal mejorado */}
      {ENABLE_LOGIN_PORTAL && !isLoggedIn && (
        <div className={`modal fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isModalOpen ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none bg-black/0'}`}>
          <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 relative overflow-hidden transform transition-all duration-300 ${isModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
            {/* Header del modal con gradiente */}
            <div className="p-8 text-white relative overflow-hidden" style={{backgroundColor: '#006935'}}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-400/20 rounded-full blur-lg"></div>
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300 cursor-pointer"
              >
                <i className="fas fa-times"></i>
              </button>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <i className="fas fa-user-shield text-2xl text-white"></i>
                </div>
                <h2 className="text-2xl font-bold text-center">Portal de Proveedores</h2>
                <p className="text-green-100 text-center mt-2">Acceda a su cuenta empresarial</p>
              </div>
            </div>
            
            {/* Contenido del formulario */}
            <div className="p-8">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {error}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                    <input 
                      type="text" 
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      placeholder="nombre.usuario" 
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                      style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = '#006935'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      required
                    />
                  </div>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="fas fa-lock text-gray-400"></i>
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      placeholder="••••••••" 
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                      style={{'--tw-ring-color': '#006935'} as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = '#006935'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-300 cursor-pointer"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-600" />
                    <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                  </label>
                  <a href="#" className="text-sm text-green-600 hover:text-green-700 transition-colors duration-300 font-medium">
                    ¿Olvidó su contraseña?
                  </a>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{backgroundColor: isLoading ? '#9ca3af' : '#006935'}}
                  onMouseEnter={(e) => !isLoading && ((e.target as HTMLElement).style.backgroundColor = '#004d26')}
                  onMouseLeave={(e) => !isLoading && ((e.target as HTMLElement).style.backgroundColor = '#006935')}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Autenticando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Iniciar Sesión
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-4">¿No tiene cuenta?</p>
                <button className="text-green-600 hover:text-green-700 font-medium transition-colors duration-300 flex items-center justify-center mx-auto cursor-pointer">
                  <i className="fas fa-user-plus mr-2"></i>
                  Solicitar Registro como Proveedor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
