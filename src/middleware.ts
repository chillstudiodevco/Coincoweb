import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard'];

// Lista de países permitidos (códigos ISO Alpha-2)
const allowedCountries = ['CO']; // Ejemplo: Colombia, México, Argentina

export async function middleware(request: NextRequest) {
  // Detect hostname + environment to allow bypass during development/local testing
  const hostname = request.nextUrl.hostname || '';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  const isDevEnv = process.env.NODE_ENV !== 'production';

  // Allow forcing middleware off via env var (useful for Preview or CI)
  const allowAll = (process.env.ALLOW_ALL_COUNTRIES || '').toLowerCase() === 'true';

  // Rutas que requieren autenticación
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Rutas que deben saltarse del chequeo geográfico (integraciones, webhooks, etc.)
  // Añade aquí los endpoints que llaman servicios externos como Salesforce
  const skipGeoPaths = [
    '/api/terceros',
    '/api/upload-document',
    '/api/auth',
    '/api/salesforce'
  ];
  const isSkipPath = skipGeoPaths.some(p => request.nextUrl.pathname.startsWith(p));

  // Si la ruta está en la lista de excepciones, permitirla inmediatamente
  if (isSkipPath) return NextResponse.next();

  // ✅ Para rutas protegidas, verificar autenticación con cookies
  if (isProtectedRoute) {
    try {
      // Crear cliente de Supabase que puede leer/escribir cookies
      const { supabase, response } = createMiddlewareClient(request);

      // Verificar si hay sesión válida
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Si no hay sesión, redirigir a home
      if (!session) {
        console.log('[Middleware] No session found, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Si hay sesión válida, permitir acceso
      console.log('[Middleware] Valid session for user:', session.user.email);
      return response;
    } catch (error) {
      console.error('[Middleware] Error verificando sesión:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If we're running locally or in dev, or ALLOW_ALL_COUNTRIES=true, skip geo-check
  if (isLocalhost || isDevEnv || allowAll) {
    return NextResponse.next();
  }

  // Production / non-local: enforce geo IP country header
  const country = request.headers.get('x-vercel-ip-country') || 'UNKNOWN';

  // 🚫 Bloquear si el país no está permitido
  if (!allowedCountries.includes(country)) {
    // Puedes redirigir a una página o devolver un error simple
    return NextResponse.json(
      { message: `Access denied from ${country}` },
      { status: 403 }
    );
  }

  return NextResponse.next();
}


export const config = {
  matcher: ['/:path*']
};
