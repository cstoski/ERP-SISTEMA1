# ========================================
#  ERP Sistema TAKT - Iniciar Aplicacao
# ========================================

$Host.UI.RawUI.WindowTitle = "ERP Sistema TAKT - Launcher"

Write-Host ""
Write-Host "========================================"
Write-Host "  ERP Sistema TAKT"
Write-Host "  Inicializador da Aplicacao"
Write-Host "========================================"
Write-Host ""
Write-Host "Este script ira abrir dois terminais:"
Write-Host "  1. Backend (FastAPI) - http://localhost:8000"
Write-Host "  2. Frontend (React + Vite) - http://localhost:5173"
Write-Host ""
Write-Host "========================================"
Write-Host ""

# Obter caminho do script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Verificar se está na pasta correta
if (-not (Test-Path "$scriptPath\backend")) {
    Write-Host "[ERRO] Pasta backend nao encontrada!" -ForegroundColor Red
    Write-Host "Execute este script da raiz do projeto."
    Read-Host "Pressione Enter para sair"
    exit 1
}

if (-not (Test-Path "$scriptPath\frontend")) {
    Write-Host "[ERRO] Pasta frontend nao encontrada!" -ForegroundColor Red
    Write-Host "Execute este script da raiz do projeto."
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Iniciar Backend em nova janela PowerShell
Write-Host "[1/2] Iniciando Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$scriptPath\start-backend.ps1`""
Start-Sleep -Seconds 2

# Iniciar Frontend em nova janela PowerShell
Write-Host "[2/2] Iniciando Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$scriptPath\start-frontend.ps1`""

Write-Host ""
Write-Host "========================================"
Write-Host "  Aplicacao Iniciada!"
Write-Host "========================================"
Write-Host ""
Write-Host "Dois terminais foram abertos:" -ForegroundColor Green
Write-Host "  - Backend: FastAPI (porta 8000)"
Write-Host "  - Frontend: React + Vite (porta 5173)"
Write-Host ""
Write-Host "Aguarde alguns segundos e acesse:"
Write-Host "  http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login:"
Write-Host "  Usuario: admin"
Write-Host "  Senha: admin123"
Write-Host ""
Write-Host "Pressione qualquer tecla para abrir o navegador..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir navegador
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Para parar os servidores, feche as janelas do PowerShell."
Write-Host ""
Read-Host "Pressione Enter para sair"
