"use client";

import { useState } from 'react';
import supabaseClient from '@/lib/supabase/client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: unknown) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePassword = () => setShowPassword((s) => !s);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: loginData.username,
        password: loginData.password,
      });

      if (error) {
        setError(error.message || 'Error en el login');
        return;
      }

      // supabase-js persists the session in browser storage automatically
      // Get access token from session (adapt to supabase-js version)
  // Normalize access token from supabase-js response (avoid `any` lint)
  const sess = (data as unknown) as { session?: { access_token?: string }; access_token?: string } | null;
  const accessToken = sess?.session?.access_token ?? sess?.access_token ?? null;

      let salesforceData = null;
      try {
        if (accessToken) {
          const res = await fetch('/api/salesforce/me', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          });

          if (res.ok) {
            const payload = await res.json();
            salesforceData = payload.salesforce ?? null;
          } else {
            // don't block login on salesforce errors, but capture message
            console.warn('[LoginModal] /api/salesforce/me returned', res.status);
          }
        } else {
          console.warn('[LoginModal] no access token available to call /api/salesforce/me');
        }
      } catch (err) {
        console.error('[LoginModal] Error calling /api/salesforce/me:', err);
      }

      // Combine user + salesforce and notify parent
      const combined = { ...(data?.user ?? null), salesforce: salesforceData };
      try { onSuccess?.(combined); } catch {};
      onClose();
    } catch (err) {
      setError('Error de conexión. Inténtelo de nuevo.');
      console.error('Error en login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal fixed inset-0 z-50 flex items-center justify-center opacity-100 bg-black/60 backdrop-blur-sm`}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 relative overflow-hidden">
        <div className="p-8 text-white relative overflow-hidden" style={{ backgroundColor: '#006935' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300 cursor-pointer"
          >
            <i className="fas fa-times"></i>
          </button>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <i className="fas fa-user-shield text-2xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold text-center">Portal de Proveedores</h2>
            <p className="text-green-100 text-center mt-2">Acceda a su cuenta empresarial</p>
          </div>
        </div>

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
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="nombre.usuario"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  style={{ '--tw-ring-color': '#006935' } as React.CSSProperties}
                  onFocus={(e) => (e.target.style.borderColor = '#006935')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
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
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  style={{ '--tw-ring-color': '#006935' } as React.CSSProperties}
                  onFocus={(e) => (e.target.style.borderColor = '#006935')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
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
              style={{ backgroundColor: isLoading ? '#9ca3af' : '#006935' }}
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
  );
}
