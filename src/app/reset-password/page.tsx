'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/set-password`,
        }
      );

      if (resetError) throw resetError;

      setMessage(
        '✅ Te hemos enviado un email con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada.'
      );
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Error al enviar el email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Recuperar Contraseña
        </h1>
        <p className="text-gray-600 mb-6">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="mt-6 text-center">
          
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}