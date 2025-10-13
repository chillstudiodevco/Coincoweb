# 🚀 Quick Start: Conectar con Salesforce

Sigue estos pasos rápidos para empezar a probar formularios conectados a Salesforce.

## ⚡ Pasos Rápidos (5 minutos)

### 1. Crear App Conectada en Salesforce

1. Login a Salesforce → Setup (⚙️)
2. Busca: **"App Manager"** → **"New Connected App"**
3. Completa:
   - Name: `COINCO Web Portal`
   - Email: tu email
   - ✅ Enable OAuth Settings
   - Callback URL: `http://localhost:3000/api/auth/callback`
   - Scopes: **Full access** + **Perform requests at any time** + **Manage user data via APIs**
4. **Save** → Espera 5 minutos → **"View"** → Copia **Consumer Key** y **Consumer Secret**

### 2. Obtener Security Token

1. En Salesforce: Settings → Personal → **Reset Security Token**
2. Revisa tu email y copia el token
3. Tu password final será: `tuPassword + token` (sin espacios)
   - Ejemplo: Si password es `Abc123!` y token `xyz789` → `Abc123!xyz789`

### 3. Configurar .env.local

```bash
# Copia el ejemplo
cp .env.example .env.local
```

Edita `.env.local` y completa:

```env
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=3MVG9...tu_consumer_key
SALESFORCE_CLIENT_SECRET=876...tu_consumer_secret
SALESFORCE_USERNAME=tu@email.com
SALESFORCE_PASSWORD=tuPassword123!xyz789
SALESFORCE_INSTANCE_URL=https://coinco.my.salesforce.com
NEXT_PUBLIC_SALESFORCE_API_URL=https://coinco.my.salesforce.com/services/apexrest
JWT_SECRET=algun-secreto-aleatorio-largo
```

### 4. Probar Conexión

```bash
# Instala dependencias (si no lo has hecho)
npm install

# Inicia el servidor
npm run dev
```

Deberías ver:
```
✅ Variables de entorno validadas correctamente
```

### 5. ¡Probar!

1. Ve a http://localhost:3000
2. Click en **"Acceso Proveedores"**
3. Login con tus credenciales de Salesforce
4. ¡Listo! 🎉

## ❌ Si algo falla...

### Error: "invalid_client_id"
- Verifica que `SALESFORCE_CLIENT_ID` sea el **Consumer Key** correcto
- Espera 5-10 minutos después de crear la Connected App

### Error: "invalid_grant"  
- Tu password debe ser: `contraseña + security_token` (sin espacios)
- Resetea el Security Token y vuelve a intentar

### Error: "INVALID_LOGIN"
- Verifica usuario y contraseña
- Si usas Sandbox, cambia `SALESFORCE_LOGIN_URL` a `https://test.salesforce.com`

## 📚 ¿Necesitas más detalles?

Lee la guía completa: **[SALESFORCE_SETUP.md](./SALESFORCE_SETUP.md)**

---

## 🧪 Probar Formularios

Una vez conectado, puedes probar:

### Formulario de Registro (Manual)
- http://localhost:3000/registro-terceros

### Formulario con Token (Invitación)
- http://localhost:3000/registro-invitacion/TOKEN_AQUI
- (Necesitas generar un token válido desde Salesforce primero)

### Dashboard de Proveedores
- http://localhost:3000/dashboard
- (Requiere login)

---

**¿Problemas?** Abre un issue o revisa `SALESFORCE_SETUP.md` para troubleshooting detallado.
