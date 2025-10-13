# 🚀 Guía de Configuración: Conectar con Salesforce

Esta guía te llevará paso a paso para conectar tu aplicación Next.js con Salesforce.

---

## 📋 Prerrequisitos

- [ ] Acceso a Salesforce con permisos de administrador
- [ ] Node.js instalado (v18 o superior)
- [ ] Proyecto Next.js corriendo

---

## 🔐 Paso 1: Configurar App Conectada en Salesforce

### 1.1 Acceder a Setup

1. Inicia sesión en Salesforce
2. Click en el ⚙️ (engranaje) → **Setup**

### 1.2 Crear Connected App

1. En Quick Find, busca: **"App Manager"**
2. Click **"New Connected App"**

### 1.3 Completar Formulario

```
Basic Information:
  Connected App Name: COINCO Web Portal
  API Name: COINCO_Web_Portal  
  Contact Email: tu-email@coinco.com.co

API (Enable OAuth Settings):
  ✅ Enable OAuth Settings
  
  Callback URL:
    http://localhost:3000/api/auth/callback
    https://tu-dominio.vercel.app/api/auth/callback
  
  Selected OAuth Scopes:
    ✅ Full access (full)
    ✅ Perform requests at any time (refresh_token, offline_access)
    ✅ Manage user data via APIs (api)
```

### 1.4 Guardar y Obtener Credenciales

1. Click **Save**
2. Espera 2-10 minutos (Salesforce necesita activar la app)
3. Click **"Manage Consumer Details"** o **"View"**
4. **Copia y guarda:**
   - ✅ **Consumer Key** (lo usarás como `SALESFORCE_CLIENT_ID`)
   - ✅ **Consumer Secret** (lo usarás como `SALESFORCE_CLIENT_SECRET`)

---

## 👤 Paso 2: Configurar Usuario de Integración

### Opción A: Usar tu Usuario Actual (Desarrollo)

Si solo estás probando, puedes usar tu usuario actual.

**Obtener Security Token:**
1. Settings (Mi configuración) → Personal → Reset My Security Token
2. Recibirás un email con el token
3. Tu password será: `tuContraseña + SecurityToken`
   - Ejemplo: Si password es `Abc123!` y token `xyz789`
   - Usarás: `Abc123!xyz789`

### Opción B: Crear Usuario Dedicado (Recomendado para Producción)

1. **Setup → Users → Users → New User**
   ```
   First Name: API
   Last Name: Integration
   Email: api-integration@coinco.com.co
   Username: api@coinco.com.co.integration
   Profile: System Administrator (o uno personalizado)
   User License: Salesforce
   ```

2. **Resetear Password**
   - Click en el usuario → Reset Password
   - Anota la nueva contraseña

3. **Obtener Security Token**
   - Login como ese usuario
   - Settings → Personal → Reset Security Token
   - Copia el token del email

---

## 🔧 Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo .env.local

En la raíz de tu proyecto:

```bash
# En PowerShell
cp .env.example .env.local
```

### 3.2 Completar .env.local

Abre `.env.local` y completa con tus datos:

```env
# ========================================
# SALESFORCE - OAUTH
# ========================================
SALESFORCE_LOGIN_URL=https://login.salesforce.com
# Si usas SANDBOX: https://test.salesforce.com

SALESFORCE_CLIENT_ID=3MVG9...tu_consumer_key_aqui
# Consumer Key de la Connected App

SALESFORCE_CLIENT_SECRET=8765...tu_consumer_secret_aqui  
# Consumer Secret de la Connected App

# ========================================
# SALESFORCE - USER
# ========================================
SALESFORCE_USERNAME=api@coinco.com.co.integration
# Tu usuario de Salesforce

SALESFORCE_PASSWORD=MiPassword123!abc789xyz
# Password + Security Token (concatenados, SIN ESPACIOS)

# ========================================
# SALESFORCE - INSTANCE
# ========================================
SALESFORCE_INSTANCE_URL=https://coinco.my.salesforce.com
# URL de tu instancia (encuéntrala en Setup → Company Information)

NEXT_PUBLIC_SALESFORCE_API_URL=https://coinco.my.salesforce.com/services/apexrest
# Para llamadas a Apex REST

# ========================================
# JWT SECRET
# ========================================
JWT_SECRET=genera-un-secreto-aleatorio-largo-aqui
# Genera uno con: openssl rand -base64 32

# ========================================
# APP
# ========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3.3 Verificar que .env.local está en .gitignore

Asegúrate que `.gitignore` incluye:
```
.env*.local
.env
```

---

## 🧪 Paso 4: Probar la Conexión

### 4.1 Reiniciar servidor de desarrollo

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciar
npm run dev
```

Deberías ver en consola:
```
🔧 Configuración de entorno:
   NODE_ENV: development
   Salesforce Instance: https://coinco.my.salesforce.com
   Salesforce User: api@coinco.com.co.integration
   App URL: http://localhost:3000
✅ Variables de entorno validadas correctamente
```

### 4.2 Probar Login

1. Ve a `http://localhost:3000`
2. Click en **"Acceso Proveedores"**
3. Usa tus credenciales de Salesforce:
   - Usuario: tu username de Salesforce
   - Contraseña: tu password (sin el security token)

### 4.3 Verificar en Consola del Navegador

Abre DevTools (F12) → Console

Si hay errores, verás:
- ✅ `200` → Login exitoso
- ❌ `401` → Credenciales incorrectas
- ❌ `400` → App no configurada correctamente
- ❌ `500` → Error del servidor (revisa variables de entorno)

---

## 🐛 Troubleshooting: Problemas Comunes

### Error: "invalid_client_id"

**Causa:** El Consumer Key (Client ID) es incorrecto

**Solución:**
1. Ve a Setup → App Manager → Tu App
2. Click "View"
3. Verifica que el Consumer Key coincide con `SALESFORCE_CLIENT_ID`

---

### Error: "invalid_grant"

**Causa:** Password + Security Token incorrecto

**Solución:**
1. Resetea el Security Token (Settings → Reset Security Token)
2. Actualiza `SALESFORCE_PASSWORD` con: `password + token` (sin espacios)
3. Ejemplo: `Abc123!xyz789`

---

### Error: "INVALID_LOGIN"

**Causa:** Usuario o contraseña incorrectos

**Solución:**
1. Verifica que `SALESFORCE_USERNAME` es correcto (incluye `.sandbox` si aplica)
2. Verifica que `SALESFORCE_PASSWORD` incluye el Security Token al final

---

### Error: Variables de entorno no detectadas

**Causa:** El archivo se llama `.env` en lugar de `.env.local`

**Solución:**
```bash
# Renombrar archivo
mv .env .env.local

# Reiniciar servidor
npm run dev
```

---

### La app se conecta pero no trae datos

**Causa:** Permisos insuficientes del usuario

**Solución:**
1. Setup → Users → [Tu usuario]
2. Verifica que tiene permisos de:
   - Leer/Escribir en objetos necesarios
   - API Enabled
   - Modificar todos los datos (si es usuario de integración)

---

## 📝 Checklist Final

Antes de continuar, verifica:

- [ ] App Conectada creada en Salesforce
- [ ] Consumer Key y Secret copiados
- [ ] Security Token obtenido
- [ ] Archivo `.env.local` creado y completado
- [ ] `.env.local` está en `.gitignore`
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Mensaje de validación aparece en consola
- [ ] Puedes hacer login en la aplicación

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu aplicación está conectada a Salesforce.

**Próximos pasos:**
1. Probar el formulario de registro de terceros
2. Probar la subida de documentos
3. Verificar que los datos se guardan en Salesforce

**¿Problemas?** Revisa la sección de Troubleshooting o contáctame.

---

## 📚 Referencias

- [Salesforce Connected Apps](https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm)
- [OAuth 2.0 Password Flow](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_username_password_flow.htm)
- [Salesforce REST API](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)
