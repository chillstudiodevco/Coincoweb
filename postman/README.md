# 🧪 Probar Conexión Salesforce con Postman/cURL

Antes de configurar la aplicación, prueba tu conexión directamente con Postman o cURL.

---

## 📦 Opción 1: Postman (Recomendado)

### **Paso 1: Importar Colección**

1. Abre Postman
2. Click **Import** (arriba izquierda)
3. Selecciona el archivo: `postman/COINCO-Salesforce-Tests.postman_collection.json`
4. Click **Import**

### **Paso 2: Configurar Variables**

1. En Postman, selecciona la colección **"COINCO - Salesforce Integration Tests"**
2. Click en la pestaña **"Variables"**
3. Completa los valores:

```
SF_LOGIN_URL = https://login.salesforce.com
  (o https://test.salesforce.com si usas sandbox)

CONSUMER_KEY = 3MVG9...tu_consumer_key
  (Consumer Key de tu Connected App)

CONSUMER_SECRET = 876...tu_consumer_secret
  (Consumer Secret de tu Connected App)

SF_USERNAME = tu@email.com
  (Tu usuario de Salesforce)

SF_PASSWORD = TuPassword123!TokenABC
  (Password + Security Token, SIN ESPACIOS)

INSTANCE_URL = https://coinco.my.salesforce.com
  (URL de tu instancia)
```

4. Click **Save**

### **Paso 3: Ejecutar Requests en Orden**

#### **Request 1: Obtener Access Token**

1. Abre el request **"1. Obtener Access Token"**
2. Click **Send**
3. Si funciona, verás:
   ```json
   {
     "access_token": "00D5f000009aFVz!AQ...",
     "instance_url": "https://coinco.my.salesforce.com",
     "id": "https://login.salesforce.com/id/00D.../005...",
     "token_type": "Bearer",
     "issued_at": "1234567890",
     "signature": "abc123..."
   }
   ```

4. **Importante:** Postman automáticamente guarda el `access_token` en las variables

#### **Request 2: Obtener Usuario**

1. Abre **"2. Obtener Información del Usuario Actual"**
2. Click **Send**
3. Deberías ver tu información:
   ```json
   {
     "records": [{
       "Id": "0055f00000...",
       "Username": "tu@email.com",
       "Email": "tu@email.com",
       "Name": "Tu Nombre",
       "IsActive": true
     }]
   }
   ```

#### **Request 3-5: Probar otras funcionalidades**

Si los primeros 2 funcionan, ¡ya estás conectado! Los otros requests son opcionales.

---

## 💻 Opción 2: cURL (Terminal/PowerShell)

### **Request 1: Obtener Access Token**

**Linux/Mac (bash):**
```bash
curl -X POST https://login.salesforce.com/services/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=TU_CONSUMER_KEY" \
  -d "client_secret=TU_CONSUMER_SECRET" \
  -d "username=tu@email.com" \
  -d "password=TuPassword123!TokenABC"
```

**Windows PowerShell:**
```powershell
$body = @{
    grant_type = "password"
    client_id = "TU_CONSUMER_KEY"
    client_secret = "TU_CONSUMER_SECRET"
    username = "tu@email.com"
    password = "TuPassword123!TokenABC"
}

$response = Invoke-RestMethod -Uri "https://login.salesforce.com/services/oauth2/token" `
    -Method Post `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $body

$response | ConvertTo-Json
```

**Si funciona, verás:**
```json
{
  "access_token": "00D5f000009aFVz!AQ...",
  "instance_url": "https://coinco.my.salesforce.com",
  "id": "https://login.salesforce.com/id/00D.../005...",
  "token_type": "Bearer",
  "issued_at": "1234567890",
  "signature": "abc123..."
}
```

### **Request 2: Obtener Usuario (usa el token anterior)**

**PowerShell:**
```powershell
$token = "TU_ACCESS_TOKEN_AQUI"
$instance = "https://coinco.my.salesforce.com"
$username = "tu@email.com"

$headers = @{
    Authorization = "Bearer $token"
}

$query = "SELECT Id, Username, Email, Name FROM User WHERE Username = '$username' LIMIT 1"
$uri = "$instance/services/data/v59.0/query?q=$([System.Uri]::EscapeDataString($query))"

$response = Invoke-RestMethod -Uri $uri -Method Get -Headers $headers
$response | ConvertTo-Json
```

---

## ✅ Checklist de Pruebas

Antes de continuar con la app, verifica:

- [ ] Request 1 (Obtener Token) devuelve `access_token` ✅
- [ ] Request 2 (Obtener Usuario) devuelve tu información ✅
- [ ] `instance_url` coincide con tu instancia de Salesforce
- [ ] No hay errores 400 o 401

Si todo funciona, **copia los valores a `.env.local`** y continúa con la app.

---

## ❌ Troubleshooting

### Error: `"error": "invalid_client_id"`

**Causa:** Consumer Key incorrecto o Connected App no activa.

**Solución:**
1. Verifica el Consumer Key en Salesforce (Setup → App Manager → Tu App → View)
2. Espera 5-10 minutos después de crear la Connected App
3. Verifica que la app tenga OAuth habilitado

---

### Error: `"error": "invalid_grant"`

**Causa:** Credenciales de usuario incorrectas.

**Solución:**
1. Verifica que `password` sea: `contraseña + security_token` (sin espacios)
2. Ejemplo correcto: `Abc123!xyz789`
3. Ejemplo incorrecto: `Abc123! xyz789` ❌ (tiene espacio)
4. Resetea el Security Token si es necesario

---

### Error: `"error": "invalid_client"`

**Causa:** Consumer Secret incorrecto.

**Solución:**
1. Regenera el Consumer Secret en Salesforce
2. Copia el nuevo valor
3. Vuelve a intentar

---

### Error: `"error": "authentication failure"`

**Causa:** Usuario bloqueado, password expirado, o IP no autorizada.

**Solución:**
1. Verifica que el usuario esté activo
2. Resetea el password si está expirado
3. Revisa las IP Ranges en la Connected App (Setup → App Manager → Tu App → Manage → IP Relaxation = Relax IP restrictions)

---

## 📝 Siguiente Paso

Una vez que los requests funcionen:

1. ✅ Copia los valores a `.env.local`
2. ✅ Reinicia tu servidor: `npm run dev`
3. ✅ Prueba el login en: http://localhost:3000

---

## 💡 Tips Útiles

### Guardar el Token Automáticamente (Postman)

En el request **"1. Obtener Access Token"**, ve a la pestaña **"Tests"** y agrega:

```javascript
// Guardar access_token automáticamente
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.collectionVariables.set("ACCESS_TOKEN", jsonData.access_token);
    pm.collectionVariables.set("INSTANCE_URL", jsonData.instance_url);
    console.log("✅ Token guardado:", jsonData.access_token.substring(0, 20) + "...");
}
```

Ahora cada vez que obtengas un token, se guardará automáticamente para los siguientes requests.

---

### Decodificar Base64 para Archivos (PowerShell)

Para probar subida de archivos:

```powershell
# Convertir texto a Base64
$text = "Este es el contenido del documento de prueba"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
$base64 = [Convert]::ToBase64String($bytes)
Write-Output $base64
```

Usa ese `$base64` en el campo `VersionData` del request 5.

---

¿Te funcionó? ¡Avísame cuando tengas el token funcionando! 🚀
