import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard'];

// Lista de países permitidos (códigos ISO Alpha-2)
const allowedCountries = ['CO']; // Ejemplo: Colombia, México, Argentina

export function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') || 'UNKNOWN';
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

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
