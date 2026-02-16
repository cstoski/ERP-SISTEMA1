"""
Rotas relacionadas a informações do sistema e ambiente
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..config import settings
from ..database import database_url
from pathlib import Path

router = APIRouter(prefix="/system", tags=["system"])

class EnvironmentSwitch(BaseModel):
    environment: str  # "development" ou "production"

@router.get("/info")
async def get_system_info():
    """
    Retorna informações sobre o ambiente e banco de dados ativo.
    Útil para monitoramento e debug.
    """
    # Extrai tipo de banco (sqlite, postgresql, mysql, etc)
    db_type = "unknown"
    if database_url.startswith("sqlite"):
        db_type = "SQLite"
    elif database_url.startswith("postgresql"):
        db_type = "PostgreSQL"
    elif database_url.startswith("mysql"):
        db_type = "MySQL"
    elif database_url.startswith("mariadb"):
        db_type = "MariaDB"
    
    # Mascara a senha na URL para não expor
    safe_db_url = database_url
    if "@" in database_url and "://" in database_url:
        # Formato: tipo://usuario:senha@host/database
        parts = database_url.split("://")
        if len(parts) > 1 and "@" in parts[1]:
            credentials_and_rest = parts[1].split("@")
            if ":" in credentials_and_rest[0]:
                user = credentials_and_rest[0].split(":")[0]
                safe_db_url = f"{parts[0]}://{user}:***@{credentials_and_rest[1]}"
    
    return {
        "environment": settings.ENVIRONMENT,
        "database_type": db_type,
        "database_url": safe_db_url,
        "is_production": settings.is_production()
    }

@router.post("/switch-environment")
async def switch_environment(switch_data: EnvironmentSwitch):
    """
    Alterna o ambiente entre development e production.
    ATENÇÃO: Requer reinício do servidor para aplicar as mudanças!
    """
    env_file = Path(".env")
    
    if not env_file.exists():
        raise HTTPException(
            status_code=404,
            detail="Arquivo .env não encontrado. Copie .env.example para .env primeiro."
        )
    
    # Valida o ambiente
    new_env = switch_data.environment.lower()
    if new_env not in ["development", "production"]:
        raise HTTPException(
            status_code=400,
            detail="Ambiente inválido. Use 'development' ou 'production'."
        )
    
    try:
        # Lê o arquivo .env
        with open(env_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Atualiza a linha ENVIRONMENT
        updated = False
        new_lines = []
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('ENVIRONMENT='):
                new_lines.append(f'ENVIRONMENT={new_env}\n')
                updated = True
            else:
                new_lines.append(line)
        
        # Se não encontrou a linha, adiciona
        if not updated:
            new_lines.append(f'ENVIRONMENT={new_env}\n')
        
        # Escreve de volta
        with open(env_file, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        # Busca as URLs dos bancos para informar
        db_url_dev = "sqlite:///./erp_dev.db"
        db_url_prod = "sqlite:///./erp_prod.db"
        
        for line in new_lines:
            if line.strip().startswith('DATABASE_URL_DEV='):
                db_url_dev = line.split('=', 1)[1].strip()
            elif line.strip().startswith('DATABASE_URL_PROD='):
                db_url_prod = line.split('=', 1)[1].strip()
        
        active_db = db_url_prod if new_env == "production" else db_url_dev
        
        return {
            "success": True,
            "message": f"Ambiente alterado para {new_env.upper()}",
            "new_environment": new_env,
            "active_database": active_db,
            "requires_restart": True,
            "warning": "⚠️ REINICIE O SERVIDOR BACKEND para aplicar as mudanças!"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao alterar ambiente: {str(e)}"
        )
