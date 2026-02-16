@echo off
REM Script batch para alternar ambiente no Windows
REM Usa o ambiente virtual Python automaticamente

setlocal

REM Ativa o ambiente virtual se existir
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
) else if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Executa o script Python com os argumentos
python switch_environment.py %*

endlocal
