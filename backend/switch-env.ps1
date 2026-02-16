# Script PowerShell para alternar ambiente
# Usa o ambiente virtual Python automaticamente

# Ativa o ambiente virtual se existir
if (Test-Path ".venv\Scripts\Activate.ps1") {
    & .venv\Scripts\Activate.ps1
} elseif (Test-Path "venv\Scripts\Activate.ps1") {
    & venv\Scripts\Activate.ps1
}

# Executa o script Python com os argumentos
python switch_environment.py $args
