# 🔐 Sistema de Autenticación con Salesforce

Este proyecto utiliza un sistema híbrido de autenticación que renueva automáticamente el access token de Salesforce.

---

## 📋 **Cómo Funciona**

1. **Edge Config (Producción en Vercel):** Almacena el token con baja latencia
2. **Caché en Memoria (Desarrollo Local):** Fallback automático sin configuración

El sistema intenta usar Edge Config primero, y si no está disponible (desarrollo local), usa caché en memoria.

---

## ⚙️ **Setup en Desarrollo Local**

### **1. Variables de Entorno Requeridas**

Crea un archivo `.env.local` con:

```bash
# Salesforce OAuth
SALESFORCE_LOGIN_URL=https://test.salesforce.com
SALESFORCE_CLIENT_ID=tu_consumer_key
SALESFORCE_CLIENT_SECRET=tu_consumer_secret
SALESFORCE_USERNAME=tu_usuario@coinco.com
SALESFORCE_PASSWORD=tu_password_y_security_token

# Salesforce Instance
SALESFORCE_INSTANCE_URL=https://coinco--qa.sandbox.my.salesforce.com
```

### **2. Ejecutar**

```bash
npm run dev
```

El sistema automáticamente:
- ✅ Obtiene un token de Salesforce
- ✅ Lo cachea en memoria por 110 minutos
- ✅ Lo renueva automáticamente cuando expira

**No necesitas** `SALESFORCE_ACCESS_TOKEN` en el `.env`. ¡Se obtiene automáticamente! 🎉

---

## 🚀 **Setup en Producción (Vercel)**

### **Opción A: Con Edge Config (Recomendado)**

#### **1. Crear Edge Config en Vercel**

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **"Storage"** (menú lateral)
3. Click en **"Create New"** → **"Edge Config"**
4. Nombre: `coinco-config` (o el que prefieras)
5. Click **"Create"**

#### **2. Agregar el Token Inicial**

En el Edge Config que acabas de crear:

1. Click en **"Items"**
2. Click en **"Add Item"**
3. Key: `salesforce_access_token`
4. Value: Obtén un token ejecutando en tu terminal local:

```bash
# PowerShell
$body = @{
    grant_type = "password"
    client_id = "TU_CLIENT_ID"
    client_secret = "TU_CLIENT_SECRET"
    username = "TU_USERNAME"
    password = "TU_PASSWORD"
}

$response = Invoke-RestMethod -Uri "https://test.salesforce.com/services/oauth2/token" -Method Post -ContentType "application/x-www-form-urlencoded" -Body $body

Write-Host $response.access_token
```

5. Pega el token en Value
6. Click **"Save"**

#### **3. Conectar Edge Config al Proyecto**

1. En tu proyecto Vercel, ve a **Settings** → **Environment Variables**
2. Vercel debería haber agregado automáticamente `EDGE_CONFIG`
3. Si no, cópiala desde el Edge Config (hay un botón "Copy Connection String")

#### **4. Configurar Variables de Entorno en Vercel**

En **Settings** → **Environment Variables**, agrega:

```
SALESFORCE_LOGIN_URL=https://test.salesforce.com
SALESFORCE_CLIENT_ID=tu_consumer_key
SALESFORCE_CLIENT_SECRET=tu_consumer_secret
SALESFORCE_USERNAME=tu_usuario@coinco.com
SALESFORCE_PASSWORD=tu_password_y_security_token
SALESFORCE_INSTANCE_URL=https://coinco--qa.sandbox.my.salesforce.com
```

#### **5. Deploy**

```bash
git push
```

Vercel automáticamente:
- ✅ Lee el token de Edge Config
- ✅ Si no existe o expiró, obtiene uno nuevo de Salesforce
- ✅ Usa caché en memoria entre invocaciones

---

### **Opción B: Solo Caché en Memoria (Sin Edge Config)**

Si no quieres configurar Edge Config:

1. Solo configura las variables de entorno en Vercel (paso 4 de arriba)
2. Deploy
3. **Listo**. Funciona automáticamente con caché en memoria.

**Diferencia:**
- Con Edge Config: Token compartido entre todas las instancias serverless
- Sin Edge Config: Cada instancia obtiene su propio token (pero funciona igual)

---

## 🔄 **Renovación Automática**

El sistema renueva el token automáticamente:

- **Duración del token:** ~2 horas (Salesforce)
- **Caché:** 110 minutos (buffer de 10 min)
- **Renovación:** Automática cuando expira

**Logs que verás:**

```
✅ [AUTH] Token encontrado en Edge Config
✅ [AUTH] Usando token en caché (válido por 95 min)
⚠️  [AUTH] Token en caché expirado, renovando...
🔐 [AUTH] Obteniendo nuevo token de Salesforce...
✅ [AUTH] Token obtenido exitosamente
✅ [AUTH] Nuevo token guardado en caché
```

---

## 🐛 **Debugging**

### **Ver estado del caché:**

```typescript
import { getTokenCacheInfo } from '@/lib/salesforce/auth';

const info = getTokenCacheInfo();
console.log(info);
// {
//   cached: true,
//   expiresAt: "2025-10-13T20:30:00.000Z",
//   minutesLeft: 95,
//   expired: false
// }
```

### **Limpiar caché manualmente:**

```typescript
import { clearTokenCache } from '@/lib/salesforce/auth';

clearTokenCache();
```

---

## 🔒 **Seguridad**

- ✅ Credenciales solo en variables de entorno (nunca en código)
- ✅ Token nunca expuesto al cliente (solo en servidor)
- ✅ Edge Config encriptado en tránsito y reposo
- ✅ Auto-renovación sin intervención manual

---

## ❓ **FAQ**

**P: ¿Necesito actualizar manualmente el token?**  
R: No. El sistema lo renueva automáticamente.

**P: ¿Funciona sin Edge Config?**  
R: Sí. Usa caché en memoria como fallback.

**P: ¿Qué pasa si múltiples requests llegan simultáneamente?**  
R: Cada uno obtiene su token. Edge Config ayuda a compartir entre instancias.

**P: ¿Cómo sé si está usando Edge Config o memoria?**  
R: Revisa los logs. Dirá "Token encontrado en Edge Config" o "usando caché local".

**P: ¿Cuánto cuesta?**  
R: Gratis. Edge Config tiene plan gratuito generoso.

---

## 📊 **Arquitectura**

```
┌─────────────────────────────────────────────┐
│  Cliente (Navegador)                        │
└───────────────┬─────────────────────────────┘
                │ HTTP Request
                ▼
┌─────────────────────────────────────────────┐
│  Next.js API Routes (/api/terceros/*)       │
│  ┌────────────────────────────────────────┐ │
│  │  getValidToken()                       │ │
│  │  1. Try Edge Config                    │ │
│  │  2. Try Memory Cache                   │ │
│  │  3. Get New from Salesforce            │ │
│  └────────────────────────────────────────┘ │
└───────┬─────────────────────┬───────────────┘
        │                     │
        ▼                     ▼
┌──────────────┐      ┌──────────────────┐
│ Edge Config  │      │ Salesforce OAuth │
│ (Vercel)     │      │ /oauth2/token    │
└──────────────┘      └──────────────────┘
```

---

¿Preguntas? Revisa los logs en la consola o contacta al equipo. 🚀
