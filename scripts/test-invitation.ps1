# Script para probar validación de token de invitación
# Uso: .\scripts\test-invitation.ps1 -Token "tu_token_aqui"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

Write-Host "🧪 Probando validación de token de invitación..." -ForegroundColor Cyan
Write-Host "Token: $Token`n" -ForegroundColor Yellow

# Leer variables de entorno desde .env
$envFile = Get-Content .env -ErrorAction SilentlyContinue
if ($envFile) {
    foreach ($line in $envFile) {
        if ($line -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$accessToken = $env:SALESFORCE_ACCESS_TOKEN
$instanceUrl = $env:SALESFORCE_INSTANCE_URL

if (-not $accessToken -or -not $instanceUrl) {
    Write-Host "❌ Error: Variables de entorno no encontradas" -ForegroundColor Red
    Write-Host "Asegúrate de tener SALESFORCE_ACCESS_TOKEN y SALESFORCE_INSTANCE_URL en tu .env" -ForegroundColor Yellow
    exit 1
}

# Hacer request al endpoint
$headers = @{
    Authorization = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

$uri = "$instanceUrl/services/apexrest/terceros/validar?token=$Token"

Write-Host "📡 Endpoint: $uri`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $uri -Method Get -Headers $headers
    
    Write-Host "✅ Token válido!" -ForegroundColor Green
    Write-Host "`n📋 Datos del tercero:" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    $data = $response.data
    Write-Host "Nombre: $($data.nombreCuenta)" -ForegroundColor White
    Write-Host "Email: $($data.email)" -ForegroundColor White
    Write-Host "Teléfono: $($data.telefonoCuenta)" -ForegroundColor White
    Write-Host "Proyecto: $($data.nombreProyecto)" -ForegroundColor White
    Write-Host "Tipo: $($data.tipoTercero)" -ForegroundColor White
    Write-Host "Account ID: $($data.accountId)" -ForegroundColor Gray
    Write-Host "Proyecto ID: $($data.proyectoId)" -ForegroundColor Gray
    Write-Host "`n⏰ Expiración:" -ForegroundColor Cyan
    
    # Convertir timestamps a fechas legibles
    $iat = [DateTimeOffset]::FromUnixTimeMilliseconds($data.iat).LocalDateTime
    $exp = [DateTimeOffset]::FromUnixTimeMilliseconds($data.exp).LocalDateTime
    
    Write-Host "Emitido: $iat" -ForegroundColor White
    Write-Host "Expira: $exp" -ForegroundColor White
    
    $timeLeft = $exp - (Get-Date)
    if ($timeLeft.TotalDays -gt 0) {
        Write-Host "⏳ Tiempo restante: $([math]::Floor($timeLeft.TotalDays)) días" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Token expirado" -ForegroundColor Red
    }
    
    Write-Host "`n🌐 Prueba en el navegador:" -ForegroundColor Cyan
    Write-Host "http://localhost:3000/registro-invitacion/$Token" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error al validar token" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "`n📄 Detalles:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
    }
}
