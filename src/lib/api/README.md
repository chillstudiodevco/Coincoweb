# Servicios API

Esta carpeta contiene los servicios para comunicación con APIs externas.

## Estructura

```
lib/api/
├── invitation.service.ts  # Servicio de tokens de invitación de terceros
├── index.ts               # Exportaciones centralizadas
└── README.md             # Este archivo
```

## Uso

### Importar el servicio

```typescript
import { invitationService } from '@/lib/api';
```

### Importar tipos

```typescript
import type { TerceroInfo, ValidateTokenResponse } from '@/types/terceros';
```

## Servicios Disponibles

### `invitationService`

Gestiona tokens de invitación y registro de terceros con Salesforce.

**Métodos:**

- `validateToken(token: string)` - Valida un token de invitación
- `completeRegistration(token, datos)` - Completa el registro de un tercero
- `uploadFile(terceroId, file, tipo)` - Sube archivos a Salesforce
- `isTokenExpired(tokenData)` - Verifica si un token está expirado
- `getTokenTimeRemaining(tokenData)` - Obtiene días restantes del token

## Ejemplo de Uso

```typescript
'use client';
import { invitationService } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function ValidarInvitacion({ token }: { token: string }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    async function validar() {
      const resultado = await invitationService.validateToken(token);
      if (resultado.success) {
        setInfo(resultado.data);
      }
    }
    validar();
  }, [token]);

  return <div>{info?.nombre}</div>;
}
```

## Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SALESFORCE_API_URL=https://coinco.my.salesforce.com/services/apexrest
SALESFORCE_API_TOKEN=tu_token_aqui
```
