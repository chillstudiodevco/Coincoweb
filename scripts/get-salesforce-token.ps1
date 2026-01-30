# Script para obtener Access Token de Salesforce
# Uso: .\scripts\get-salesforce-token.ps1

Write-Host "[*] Obteniendo Access Token de Salesforce..." -ForegroundColor Cyan
Write-Host ""

# Cargar variables del .env o .env.local
$envFile = $null
if (Test-Path ".\.env.local") {
    $envFile = ".\.env.local"
} elseif (Test-Path ".\.env") {
    $envFile = ".\.env"
}

if ($envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Variable -Name $key -Value $value -Scope Script
        }
    }
    Write-Host "[OK] Variables cargadas desde $envFile" -ForegroundColor Green
} else {
    Write-Host "[ERROR] No se encontro .env o .env.local" -ForegroundColor Red
    Write-Host "Por favor crea el archivo .env con las credenciales de Salesforce" -ForegroundColor Yellow
    exit 1
}

# Verificar variables requeridas
$required = @(
    'SALESFORCE_LOGIN_URL',
    'SALESFORCE_CLIENT_ID',
    'SALESFORCE_CLIENT_SECRET',
    'SALESFORCE_USERNAME',
    'SALESFORCE_PASSWORD'
)

$missing = @()
foreach ($var in $required) {
    if (-not (Get-Variable -Name $var -ValueOnly -ErrorAction SilentlyContinue)) {
        $missing += $var
    }
}

if ($missing.Count -gt 0) {
    Write-Host "[ERROR] Faltan variables de entorno:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    exit 1
}

Write-Host ""
Write-Host "[*] Conectando a Salesforce..." -ForegroundColor Cyan
Write-Host "   URL: $SALESFORCE_LOGIN_URL" -ForegroundColor Gray
Write-Host "   Usuario: $SALESFORCE_USERNAME" -ForegroundColor Gray
Write-Host ""

try {
    $body = @{
        grant_type = "password"
        client_id = $SALESFORCE_CLIENT_ID
        client_secret = $SALESFORCE_CLIENT_SECRET
        username = $SALESFORCE_USERNAME
        password = $SALESFORCE_PASSWORD
    }

    $response = Invoke-RestMethod `
        -Uri "$SALESFORCE_LOGIN_URL/services/oauth2/token" `
        -Method Post `
        -ContentType "application/x-www-form-urlencoded" `
        -Body $body

    Write-Host "[OK] Token obtenido exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "COPIA ESTE TOKEN A EDGE CONFIG:" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host $response.access_token -ForegroundColor White
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[INSTRUCCIONES]" -ForegroundColor Cyan
    Write-Host "1. Ve a Vercel Dashboard -> Storage -> Tu Edge Config" -ForegroundColor Gray
    Write-Host "2. Click en 'Items' tab" -ForegroundColor Gray
    Write-Host "3. Click en 'Add Item'" -ForegroundColor Gray
    Write-Host "4. Key: salesforce_access_token" -ForegroundColor Gray
    Write-Host "5. Value: Pega el token de arriba" -ForegroundColor Gray
    Write-Host "6. Click 'Save'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "[INFO] Este token es valido por ~2 horas" -ForegroundColor Yellow
    Write-Host "[INFO] Despues se renovara automaticamente" -ForegroundColor Green
    Write-Host ""
    
    # Información adicional
    Write-Host "[INFO ADICIONAL]" -ForegroundColor Cyan
    Write-Host "   Instance URL: $($response.instance_url)" -ForegroundColor Gray
    Write-Host "   Token Type: $($response.token_type)" -ForegroundColor Gray
    Write-Host "   Issued At: $(Get-Date -UnixTimeSeconds ($response.issued_at.Substring(0,10)))" -ForegroundColor Gray
    
} catch {
    Write-Host "[ERROR] Error al obtener token:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "[TIP] Verifica que:" -ForegroundColor Yellow
    Write-Host "   - Las credenciales en .env.local sean correctas" -ForegroundColor Gray
    Write-Host "   - La Connected App este configurada correctamente" -ForegroundColor Gray
    Write-Host "   - El usuario tenga permisos de API Enabled" -ForegroundColor Gray
    Write-Host "   - El SALESFORCE_PASSWORD incluya el security token al final" -ForegroundColor Gray
    exit 1
}
