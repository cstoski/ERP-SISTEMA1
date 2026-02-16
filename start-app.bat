@echo off
REM ========================================
REM  ERP Sistema TAKT - Iniciar Aplicacao
REM ========================================

title ERP Sistema TAKT - Launcher

echo.
echo ========================================
echo   ERP Sistema TAKT
echo   Inicializador da Aplicacao
echo ========================================
echo.
echo Este script ira abrir dois terminais:
echo   1. Backend (FastAPI) - http://localhost:8000
echo   2. Frontend (React + Vite) - http://localhost:5173
echo.
echo ========================================
echo.

REM Verificar se está na pasta correta
if not exist "backend" (
    echo [ERRO] Pasta backend nao encontrada!
    echo Execute este script da raiz do projeto.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo [ERRO] Pasta frontend nao encontrada!
    echo Execute este script da raiz do projeto.
    pause
    exit /b 1
)

echo [1/2] Iniciando Backend...
start "ERP Sistema - Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 2 /nobreak >nul

echo [2/2] Iniciando Frontend...
start "ERP Sistema - Frontend" cmd /k "%~dp0start-frontend.bat"

echo.
echo ========================================
echo   Aplicacao Iniciada!
echo ========================================
echo.
echo Dois terminais foram abertos:
echo   - Backend: FastAPI (porta 8000)
echo   - Frontend: React + Vite (porta 5173)
echo.
echo Aguarde alguns segundos e acesse:
echo   http://localhost:5173
echo.
echo Login:
echo   Usuario: admin
echo   Senha: admin123
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

REM Abrir navegador
start http://localhost:5173

echo.
echo Para parar os servidores, feche as janelas do terminal.
echo.
pause
