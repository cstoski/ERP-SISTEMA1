@echo off
REM ========================================
REM  ERP Sistema TAKT - Iniciar Frontend
REM ========================================

echo.
echo ========================================
echo   ERP Sistema TAKT - Frontend
echo ========================================
echo.

REM Navegar para a pasta frontend
cd /d "%~dp0frontend"

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo [AVISO] Dependencias nao encontradas!
    echo Instalando dependencias...
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo [1/2] Verificando dependencias...
call npm list vite --depth=0 >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Vite nao encontrado. Instalando...
    call npm install
)

echo [2/2] Iniciando servidor de desenvolvimento...
echo.
echo ========================================
echo   Aplicacao rodando em:
echo   http://localhost:5173
echo.
echo   Pressione Ctrl+C para parar
echo ========================================
echo.

REM Iniciar servidor
call npm run dev

pause
