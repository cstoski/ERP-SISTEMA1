@echo off
REM ========================================
REM  ERP Sistema TAKT - Iniciar Backend
REM ========================================

echo.
echo ========================================
echo   ERP Sistema TAKT - Backend
echo ========================================
echo.

REM Navegar para a pasta backend
cd /d "%~dp0backend"

REM Verificar se o ambiente virtual existe
if not exist "..\\.venv\Scripts\activate.bat" (
    echo [ERRO] Ambiente virtual nao encontrado!
    echo Por favor, execute a configuracao inicial primeiro.
    echo.
    pause
    exit /b 1
)

REM Ativar ambiente virtual
echo [1/3] Ativando ambiente virtual...
call ..\\.venv\Scripts\activate.bat

REM Verificar se o uvicorn está instalado
python -c "import uvicorn" 2>nul
if errorlevel 1 (
    echo [ERRO] Uvicorn nao instalado!
    echo Execute: pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

echo [2/3] Verificando banco de dados...
python -c "from app.database import engine; engine.connect(); print('✓ Conexao OK')" 2>nul
if errorlevel 1 (
    echo [AVISO] Nao foi possivel conectar ao banco de dados.
    echo Certifique-se de que o PostgreSQL esta rodando.
    echo.
)

echo [3/3] Iniciando servidor FastAPI...
echo.
echo ========================================
echo   Servidor rodando em:
echo   http://localhost:8000
echo.
echo   Documentacao API:
echo   http://localhost:8000/api/docs
echo.
echo   Pressione Ctrl+C para parar
echo ========================================
echo.

REM Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
