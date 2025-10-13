# 🚀 Setup para Vercel Preview con Edge Config

## ✅ Ya completaste: Crear Edge Config Store

---

## 📝 **Paso 1: Conectar Edge Config al Proyecto**

1. En Vercel Dashboard, ve a tu proyecto **coinco-web**
2. Ve a **Settings** → **Edge Config**
3. Click en **"Connect Edge Config"**
4. Selecciona el Edge Config Store que acabas de crear
5. Click **"Connect"**

Esto automáticamente agregará la variable `EDGE_CONFIG` a tu proyecto.

---

## 🔑 **Paso 2: Agregar Token Inicial a Edge Config**

### **Obtener un Access Token de Salesforce:**

1. Abre PowerShell y ejecuta:

```powershell
$body = @{
    grant_type = "password"
    client_id = "TU_SALESFORCE_CLIENT_ID"
    client_secret = "TU_SALESFORCE_CLIENT_SECRET"
    username = "TU_SALESFORCE_USERNAME"
    password = "TU_SALESFORCE_PASSWORD_CON_TOKEN"
}

$response = Invoke-RestMethod -Uri "https://test.salesforce.com/services/oauth2/token" -Method Post -ContentType "application/x-www-form-urlencoded" -Body $body

Write-Host "Access Token:"
Write-Host $response.access_token
```

2. Copia el `access_token` que aparece en la consola

### **Agregarlo a Edge Config:**

1. Ve a **Storage** → Tu Edge Config
2. Click en **"Items"** tab
3. Click en **"Add Item"**
4. **Key:** `salesforce_access_token`
5. **Value:** Pega el token que copiaste
6. Click **"Save"**

---

## 🔧 **Paso 3: Configurar Variables de Entorno en Vercel**

Ve a **Settings** → **Environment Variables** y agrega:

### **Para Preview (y Production):**

```
SALESFORCE_LOGIN_URL=https://test.salesforce.com
SALESFORCE_CLIENT_ID=3MVG9...tu_consumer_key
SALESFORCE_CLIENT_SECRET=tu_consumer_secret
SALESFORCE_USERNAME=usuario@coinco.com
SALESFORCE_PASSWORD=password+securitytoken
SALESFORCE_INSTANCE_URL=https://coinco--qa.sandbox.my.salesforce.com
```

**Importante:** En cada variable, selecciona los ambientes donde aplica:
- ✅ Production
- ✅ Preview
- ✅ Development (opcional)

---

## 🚀 **Paso 4: Deploy a Preview**

Desde tu terminal local:

```powershell
# Asegúrate de estar en la rama development
git status

# Commit los cambios recientes (si hay alguno)
git add .
git commit -m "feat: Edge Config authentication system"

# Push a development para generar Preview
git push origin development
```

Vercel automáticamente:
- ✅ Detectará el push
- ✅ Creará un Preview Deployment
- ✅ Usará Edge Config para el token

---

## 🧪 **Paso 5: Probar el Preview**

1. Ve a Vercel Dashboard → **Deployments**
2. Busca el deployment más reciente (dirá "Preview" y "development")
3. Click en el deployment
4. Click en **"Visit"** para abrir el preview
5. Prueba la URL: `https://tu-preview-url.vercel.app/api/terceros/validar?token=test`

### **Ver Logs:**

1. En el mismo deployment, click en **"Functions"** tab
2. Click en alguna función (ej: `/api/terceros/validar`)
3. Verás los logs en tiempo real con:
   ```
   ✅ [AUTH] Token encontrado en Edge Config
   ```

---

## 🔍 **Verificar que Edge Config Funciona**

En los logs deberías ver:

### **Primera request (token nuevo):**
```
🔐 [AUTH] Obteniendo nuevo token de Salesforce...
✅ [AUTH] Token obtenido exitosamente
✅ [AUTH] Nuevo token guardado en caché
```

### **Siguientes requests (usando caché):**
```
✅ [AUTH] Usando token en caché (válido por XX min)
```

### **Cuando esté configurado Edge Config:**
```
✅ [AUTH] Token encontrado en Edge Config
```

---

## ❌ **Solución de Problemas**

### **Error: "EDGE_CONFIG is not defined"**
- Verifica que conectaste el Edge Config al proyecto
- Redeploy después de conectarlo

### **Error: "Edge Config item not found"**
- Verifica que agregaste el item con key exacto: `salesforce_access_token`
- El key es case-sensitive

### **Error: "401 INVALID_SESSION_ID"**
- El token en Edge Config expiró
- Actualiza el token siguiendo el Paso 2 nuevamente
- Después de 2-3 requests, el sistema lo renovará automáticamente

### **No veo logs de Edge Config**
- Es normal al inicio. El sistema usa caché en memoria primero
- Después de 110 minutos, verás que usa Edge Config
- O puedes actualizar manualmente el token en Edge Config para verificar

---

## 🎯 **Checklist Final**

Antes de considerar completo:

- [ ] Edge Config Store creado
- [ ] Edge Config conectado al proyecto coinco-web
- [ ] Item `salesforce_access_token` agregado con token válido
- [ ] Variables de entorno configuradas (todas las SALESFORCE_*)
- [ ] Variable `EDGE_CONFIG` existe (automática)
- [ ] Push a development realizado
- [ ] Preview deployment exitoso
- [ ] Test de endpoint `/api/terceros/validar` funciona
- [ ] Logs muestran autenticación exitosa

---

## 📊 **Flujo de Autenticación en Preview**

```
┌────────────────────────────────────────────┐
│  Request a Preview URL                     │
│  https://coinco-web-xxx.vercel.app         │
└──────────────────┬─────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────┐
│  Next.js API Route                         │
│  /api/terceros/validar                     │
└──────────────────┬─────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────┐
│  getValidToken()                           │
│  1. Check Edge Config ← AQUÍ! 🎯          │
│  2. Check Memory Cache                     │
│  3. Get new from Salesforce                │
└──────────────────┬─────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────┐
│  Salesforce API Call                       │
│  Con token válido ✅                       │
└────────────────────────────────────────────┘
```

---

¿Listo para el deploy? 🚀
