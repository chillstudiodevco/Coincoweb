# 🚀 Cambios Implementados - Solución CORS

## 📋 Resumen

Se ha implementado una arquitectura de **API Routes como proxy** para evitar problemas de CORS al conectar con Salesforce desde `localhost`.

---

## ✅ Archivos Modificados/Creados

### **1. API Routes (Nuevos Endpoints)**

#### `src/app/api/terceros/validar/route.ts`
- **Método:** `GET`
- **Ruta:** `/api/terceros/validar?token=abc123`
- **Función:** Valida tokens de invitación llamando a Salesforce desde el servidor
- **Ventajas:** 
  - ✅ Evita CORS (server-to-server)
  - ✅ No expone credenciales de Salesforce en el navegador
  - ✅ Logging detallado para debugging

#### `src/app/api/terceros/registro/route.ts` *(Nuevo)*
- **Método:** `PATCH`
- **Ruta:** `/api/terceros/registro`
- **Función:** Completa el registro de terceros enviando datos a Salesforce
- **Body:**
  ```json
  {
    "token": "eyJ0eXAiOiJKV1Q...",
    "datosRegistro": {
      "razonSocial": "...",
      "nit": "...",
      ...
    }
  }
  ```

---

### **2. Servicio Actualizado**

#### `src/lib/api/invitation.service.ts`
**Cambios:**
- ❌ Antes: Llamaba directamente a Salesforce (causaba CORS)
- ✅ Ahora: Llama a `/api/terceros/validar` y `/api/terceros/registro`

**Métodos actualizados:**
- `validateToken()` → Ahora usa `/api/terceros/validar`
- `completeRegistration()` → Ahora usa `/api/terceros/registro`
- `uploadFile()` → Ya usaba `/api/upload-document` ✅

---

## 🔄 Flujo de Datos

### **Antes (❌ Con CORS)**
```
Navegador (localhost:3000)
    ↓
    └─→ Salesforce API ❌ CORS BLOQUEADO
```

### **Ahora (✅ Sin CORS)**
```
Navegador (localhost:3000)
    ↓
    └─→ Next.js API Route (/api/terceros/validar)
            ↓
            └─→ Salesforce API ✅ Server-to-Server
```

---

## 🔑 Variables de Entorno Requeridas

Tu archivo `.env` ya tiene todo configurado:

```bash
# Requerido para las API Routes
SALESFORCE_INSTANCE_URL=https://coinco--qa.sandbox.lightning.force.com
SALESFORCE_ACCESS_TOKEN=00Ddm000003oUxF!AQEAQL...

# Opcional (para referencia)
NEXT_PUBLIC_SALESFORCE_API_URL=https://coinco--qa.sandbox.lightning.force.com/services/apexrest
```

---

## 🧪 Cómo Probar

### **1. Asegúrate que el servidor esté corriendo:**
```powershell
npm run dev
```

### **2. Abre en el navegador:**
```
http://localhost:3000/registro-invitacion/TU_TOKEN_AQUI
```

Por ejemplo:
```
http://localhost:3000/registro-invitacion/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAi...
```

### **3. Revisa los logs:**

**En la consola del navegador (F12):**
```
🔍 [VALIDATION] Iniciando validación de token...
🔧 [SERVICE] validateToken - Iniciando...
🔧 [SERVICE] URL de API Route: /api/terceros/validar?token=...
✅ [VALIDATION] Token válido!
```

**En la terminal (donde corre npm run dev):**
```
📡 [API] /api/terceros/validar - Request recibido
🔑 [API] Token recibido: eyJ0eXAiOiJKV1Q...
📡 [API] Llamando a Salesforce: https://coinco--qa.sandbox.lightning.force.com/...
✅ [API] Token validado exitosamente
GET /api/terceros/validar?token=... 200 in 523ms
```

---

## 🎯 Beneficios de esta Arquitectura

### **Seguridad**
- ✅ No expones `SALESFORCE_ACCESS_TOKEN` en el navegador
- ✅ Las credenciales solo existen en el servidor
- ✅ El navegador solo conoce rutas `/api/*`

### **Desarrollo**
- ✅ No necesitas configurar CORS en Salesforce para cada `localhost`
- ✅ Funciona para todo el equipo sin configuración adicional
- ✅ Fácil de escalar a producción (solo cambias las variables de entorno)

### **Debugging**
- ✅ Logs detallados en ambos lados (navegador y servidor)
- ✅ Fácil identificar dónde falla (frontend vs backend vs Salesforce)
- ✅ Emojis y timestamps para mejor legibilidad

---

## ⚠️ Troubleshooting

### **Error: "Variables de entorno no configuradas"**
**Causa:** Falta `SALESFORCE_ACCESS_TOKEN` o `SALESFORCE_INSTANCE_URL` en `.env`

**Solución:**
```bash
# Verifica que existan en .env
SALESFORCE_INSTANCE_URL=https://coinco--qa.sandbox.lightning.force.com
SALESFORCE_ACCESS_TOKEN=00Ddm000003oUxF!AQEAQL...
```

### **Error: "Token expirado"**
**Causa:** El `SALESFORCE_ACCESS_TOKEN` tiene ~2 horas de validez

**Solución:**
1. Obtén un nuevo token desde Postman (request "Obtener Access Token")
2. Copia el nuevo token
3. Actualiza `.env`:
   ```bash
   SALESFORCE_ACCESS_TOKEN=NUEVO_TOKEN_AQUI
   ```
4. Reinicia el servidor: `npm run dev`

### **Error: Still getting CORS**
**Causa:** El servicio todavía está usando URLs viejas

**Solución:**
1. Detén el servidor (`Ctrl+C`)
2. Limpia la caché: `rm -rf .next` (o elimina la carpeta `.next`)
3. Reinicia: `npm run dev`

---

## 📊 Comparación

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **CORS** | ❌ Bloqueado | ✅ Sin problemas |
| **Seguridad** | ❌ Token expuesto | ✅ Token en servidor |
| **Localhost** | ❌ No funcionaba | ✅ Funciona |
| **Producción** | ❌ Necesita configuración | ✅ Lista para producción |
| **Debugging** | ❌ Difícil | ✅ Logs detallados |

---

## 🚀 Próximos Pasos

1. ✅ Prueba la validación de token
2. ✅ Completa el formulario de registro
3. ✅ Verifica que la subida de archivos funcione
4. 🔄 Si todo funciona, listo para desarrollar más funcionalidades

---

¿Necesitas ayuda con algo más? ¡Pruébalo y avísame cómo va! 🎉
