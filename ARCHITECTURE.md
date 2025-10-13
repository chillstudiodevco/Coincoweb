# Estructura del Proyecto COINCO Web

## 📂 Organización Actual

```
src/
├── app/                                 # Next.js App Router
│   ├── page.tsx                        # Página principal (home)
│   ├── layout.tsx                      # Layout raíz
│   ├── globals.css                     # Estilos globales
│   ├── api/                            # API Routes
│   │   ├── auth/
│   │   │   └── route.ts               # Autenticación con Salesforce
│   │   └── upload-document/
│   │       └── route.ts               # ✅ Subida de archivos a Salesforce
│   ├── dashboard/
│   │   └── page.tsx                   # Dashboard de proveedores
│   ├── registro-invitacion/
│   │   └── [token]/
│   │       └── page.tsx               # ✅ Registro con token dinámico
│   ├── registro-exitoso/
│   │   └── page.tsx                   # ✅ Confirmación de registro
│   └── registro-terceros/
│       └── page.tsx                   # Registro manual de terceros
│
├── components/                         # Componentes React
│   ├── AboutSection.tsx
│   ├── ContactSection.tsx
│   ├── ExperienceSection.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   ├── ProjectsSection.tsx
│   ├── ProviderDashboard.tsx
│   ├── ServicesSection.tsx
│   └── ThirdPartyRegistration.tsx
│
├── lib/                                # Lógica de negocio y utilidades
│   └── api/                           # ✅ Servicios de API
│       ├── invitation.service.ts      # ✅ Servicio de invitaciones
│       ├── index.ts                   # ✅ Exportaciones centralizadas
│       └── README.md                  # ✅ Documentación
│
├── types/                             # ✅ Tipos TypeScript compartidos
│   ├── auth.ts                        # ✅ Tipos de autenticación
│   ├── salesforce.ts                  # ✅ Tipos de Salesforce API
│   ├── terceros.ts                    # ✅ Tipos de terceros
│   └── index.ts                       # ✅ Exportaciones centralizadas
│
└── middleware.ts                      # Middleware de Next.js (placeholder)
```

## 🎯 Rutas Disponibles

### Páginas Públicas
- `/` - Home principal con todas las secciones
- `/registro-terceros` - Formulario de registro manual
- `/registro-exitoso` - Confirmación de registro

### Páginas Dinámicas
- `/registro-invitacion/[token]` - ✅ Registro con token de invitación

### Páginas Protegidas
- `/dashboard` - Dashboard de proveedores (requiere auth)

### API Routes
- `POST /api/auth` - Autenticación con Salesforce
- `POST /api/upload-document` - ✅ Subir documentos a Salesforce

## 📦 Servicios Disponibles

### `invitationService`
Gestiona tokens de invitación y registro de terceros.

**Ubicación:** `@/lib/api`

**Métodos:**
- `validateToken(token)` - Valida un token de invitación
- `completeRegistration(token, datos)` - Completa el registro
- `uploadFile(terceroId, file, tipo)` - Sube archivos
- `isTokenExpired(tokenData)` - Verifica expiración
- `getTokenTimeRemaining(tokenData)` - Obtiene tiempo restante

**Uso:**
```typescript
import { invitationService } from '@/lib/api';
const result = await invitationService.validateToken(token);
```

## 🔧 Tipos TypeScript

### Importar tipos
```typescript
// Todos desde un lugar
import type { AuthUser, TerceroInfo, SalesforceUser } from '@/types';

// O específicos
import type { LoginCredentials } from '@/types/auth';
import type { ContentVersion } from '@/types/salesforce';
import type { CompleteRegistrationPayload } from '@/types/terceros';
```

## 🔐 Variables de Entorno Requeridas

```env
# Salesforce OAuth
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=tu_consumer_key
SALESFORCE_CLIENT_SECRET=tu_consumer_secret
SALESFORCE_USERNAME=usuario@coinco.com.co.security
SALESFORCE_PASSWORD=contraseña

# Salesforce API
SALESFORCE_INSTANCE_URL=https://coinco.my.salesforce.com
SALESFORCE_ACCESS_TOKEN=tu_token_de_sesion
NEXT_PUBLIC_SALESFORCE_API_URL=https://coinco.my.salesforce.com/services/apexrest
SALESFORCE_API_TOKEN=tu_api_token

# JWT (futuro)
JWT_SECRET=tu_secreto_super_seguro_aqui
```

## 🚀 Próximos Pasos

### Pendientes Críticos
1. ✅ **Tipos TypeScript** - Completado parcialmente
2. ✅ **Servicios API** - invitation.service creado
3. ✅ **API Routes** - upload-document creado
4. ⏳ **Validación de env** - Crear lib/env.ts
5. ⏳ **AuthContext** - Crear contexto global
6. ⏳ **Middleware** - Implementar protección real

### Reorganización Pendiente
```
components/
├── layout/          # Header, Footer
├── forms/           # ThirdPartyRegistration
└── ui/              # Componentes reutilizables

lib/
├── api/            # ✅ Ya existe
├── hooks/          # useAuth, useForm, etc.
└── utils/          # Funciones helper
```

## 📝 Notas Importantes

1. **Seguridad**: El sistema actual usa localStorage para tokens (inseguro). Plan: migrar a httpOnly cookies.

2. **Middleware**: Existe pero no valida JWT. Pendiente implementar verificación real.

3. **Feature Flags**: 
   - `ENABLE_LOGIN_PORTAL` en Header.tsx
   - `ENABLE_THIRD_PARTY_REGISTRATION` en Header.tsx

4. **Formularios**: ThirdPartyRegistration usa validación manual. Plan: migrar a react-hook-form + zod.

5. **Tests**: No hay tests implementados. Pendiente setup de Vitest.

## 🔗 Referencias

- [Next.js App Router](https://nextjs.org/docs/app)
- [Salesforce REST API](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
