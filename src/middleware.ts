import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard'];

// Lista de países permitidos (códigos ISO Alpha-2)
const allowedCountries = ['CO']; // Ejemplo: Colombia, México, Argentina

export function middleware(request: NextRequest) {
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

  // If we're running locally or in dev, or ALLOW_ALL_COUNTRIES=true, skip geo-check
  if (isLocalhost || isDevEnv || allowAll) {
    // Only run protected-route auth checks if desired (left as placeholder)
    if (isProtectedRoute) {
      // Placeholder for JWT auth in the future
      // const token = request.cookies.get('token');
      // if (!token) return NextResponse.redirect(new URL('/login', request.url));
    }

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

  // ✅ Aquí podrías agregar tu lógica de autenticación JWT si aplica
  if (isProtectedRoute) {
    // Ejemplo placeholder
    // const token = request.cookies.get('token');
    // if (!token) return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: ['/:path*']
};
