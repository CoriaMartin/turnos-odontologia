<#
.SYNOPSIS
  Checklist de seguridad de la entrega (C-20). Revisa SOLO los archivos versionados (git ls-files).

.DESCRIPTION
  1. Ningún archivo .env versionado, salvo los *.env.example.
  2. Ninguna línea MAIL_ENABLED=true / MAIL_ENABLED: true versionada (regla dura: nunca emails reales).
  3. En los *.env.example, las claves sensibles están vacías.
  4. Ningún archivo de configuración versionado (yml, yaml, properties, json) con contraseñas, secretos,
     tokens o claves con un valor literal. Se permiten referencias a variables (${...}).
     Excepción documentada: backend/src/test/resources/application-test.yml usa valores FICTICIOS
     públicos a propósito (solo funcionan contra turnos_test).
  5. .gitignore excluye .env, backend/target/ y frontend/node_modules/.

  Nunca imprime los valores encontrados: solo archivo y línea.
  Sale con 0 si todo está bien y con 1 si algo falla.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/verificar-entrega.ps1
#>

$ErrorActionPreference = 'Stop'
$raiz = (git rev-parse --show-toplevel).Trim()
Set-Location $raiz
$versionados = git ls-files
$fallas = 0

function Resultado([string]$nombre, [string[]]$problemas) {
    if ($problemas.Count -eq 0) {
        Write-Host "OK    $nombre"
    } else {
        Write-Host "FALLA $nombre"
        $problemas | ForEach-Object { Write-Host "        - $_" }
        $script:fallas++
    }
}

function Lineas([string]$archivo, [string]$patron) {
    if (-not (Test-Path -LiteralPath $archivo -PathType Leaf)) { return @() }
    Select-String -LiteralPath $archivo -Pattern $patron | ForEach-Object { "$($archivo):$($_.LineNumber)" }
}

# 1. Archivos .env versionados
$envVersionados = $versionados | Where-Object {
    $nombre = Split-Path $_ -Leaf
    ($nombre -eq '.env' -or $nombre -like '.env.*' -or $nombre -like '*.env') -and $nombre -notlike '*.env.example'
}
Resultado 'Sin archivos .env versionados (solo .env.example)' @($envVersionados)

# 2. MAIL_ENABLED=true versionado
$mail = @()
foreach ($a in $versionados) {
    if ($a -match '\.(png|jpe?g|pdf|docx|ico|svg)$' -or $a -eq 'scripts/verificar-entrega.ps1') { continue }
    $mail += Lineas $a '(?i)MAIL_ENABLED\s*[:=]\s*"?true'
}
Resultado 'Sin MAIL_ENABLED=true versionado' $mail

# 3. Claves sensibles vacías en los .env.example
$sensibles = '^(DB_PASSWORD|JWT_SECRET|ADMIN_PASSWORD|MAIL_USERNAME|MAIL_PASSWORD)\s*=\s*\S'
$ejemplos = @()
foreach ($a in ($versionados | Where-Object { $_ -like '*.env.example' })) {
    $ejemplos += Lineas $a $sensibles
}
Resultado 'Claves sensibles vacías en los .env.example' $ejemplos

# 4. Credenciales con valor literal en archivos de configuración
$excepciones = @('backend/src/test/resources/application-test.yml')
$credencial = '(?i)(password|passwd|secret|token|api[_-]?key)["'']?\s*[:=]\s*["'']?(?!\$\{)[^\s"''#,}]{4,}'
$config = @()
foreach ($a in ($versionados | Where-Object { $_ -match '\.(ya?ml|properties|json)$' -and $_ -notmatch 'package-lock\.json$' })) {
    if ($excepciones -contains $a) { continue }
    $config += Lineas $a $credencial
}
Resultado 'Sin credenciales con valor en archivos de configuración' $config

# 5. .gitignore
$requeridas = @('.env', 'backend/target/', 'frontend/node_modules/')
$ignore = if (Test-Path .gitignore) { Get-Content .gitignore } else { @() }
$faltantes = $requeridas | Where-Object { $ignore -notcontains $_ } | ForEach-Object { ".gitignore no incluye '$_'" }
Resultado '.gitignore excluye .env, backend/target/ y frontend/node_modules/' @($faltantes)

if ($fallas -gt 0) {
    Write-Host "`n$fallas chequeo(s) con problemas. Corregilos antes de entregar."
    exit 1
}
Write-Host "`nTodo en orden: la entrega no expone secretos."
exit 0
