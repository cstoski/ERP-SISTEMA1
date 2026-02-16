# ========================================
#  ERP Sistema TAKT - Iniciar Frontend
# ========================================

Write-Host ""
Write-Host "========================================"
Write-Host "  ERP Sistema TAKT - Frontend"
Write-Host "========================================"
Write-Host ""

# Navegar para a pasta frontend
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\frontend"

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "[AVISO] Dependencias nao encontradas!" -ForegroundColor Yellow
    Write-Host "Instalando dependencias..."
    Write-Host ""
    
    & npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERRO] Falha ao instalar dependencias!" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

Write-Host "[1/2] Verificando dependencias..." -ForegroundColor Cyan

# Verificar se Vite está instalado
$viteCheck = & npm list vite --depth=0 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[AVISO] Vite nao encontrado. Instalando..." -ForegroundColor Yellow
    & npm install
}

Write-Host "[2/2] Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================"
Write-Host "  Aplicacao rodando em:"
Write-Host "  http://localhost:5173"
Write-Host ""
Write-Host "  Pressione Ctrl+C para parar"
Write-Host "========================================"
Write-Host ""

# Iniciar servidor
& npm run dev
