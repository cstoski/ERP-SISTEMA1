# ========================================
#  ERP Sistema TAKT - Iniciar Backend
# ========================================

Write-Host ""
Write-Host "========================================"
Write-Host "  ERP Sistema TAKT - Backend"
Write-Host "========================================"
Write-Host ""

# Navegar para a pasta backend
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\backend"

# Verificar se o ambiente virtual existe
if (-not (Test-Path "..\\.venv\Scripts\Activate.ps1")) {
    Write-Host "[ERRO] Ambiente virtual nao encontrado!" -ForegroundColor Red
    Write-Host "Por favor, execute a configuracao inicial primeiro."
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Ativar ambiente virtual
Write-Host "[1/3] Ativando ambiente virtual..." -ForegroundColor Cyan
& "..\\.venv\Scripts\Activate.ps1"

# Verificar se o uvicorn está instalado
Write-Host "[2/3] Verificando instalacao..." -ForegroundColor Cyan
$uvicornCheck = & python -c "import uvicorn" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Uvicorn nao instalado!" -ForegroundColor Red
    Write-Host "Execute: pip install -r requirements.txt"
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar conexão com banco
Write-Host "[3/3] Verificando banco de dados..." -ForegroundColor Cyan
$dbCheck = & python -c "from app.database import engine; engine.connect(); print('✓ Conexao OK')" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[AVISO] Nao foi possivel conectar ao banco de dados." -ForegroundColor Yellow
    Write-Host "Certifique-se de que o PostgreSQL esta rodando."
    Write-Host ""
}

Write-Host ""
Write-Host "========================================"
Write-Host "  Servidor rodando em:"
Write-Host "  http://localhost:8000"
Write-Host ""
Write-Host "  Documentacao API:"
Write-Host "  http://localhost:8000/api/docs"
Write-Host ""
Write-Host "  Pressione Ctrl+C para parar"
Write-Host "========================================"
Write-Host ""

# Iniciar servidor
& uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
