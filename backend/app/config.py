from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from datetime import datetime
import pytz
import secrets

class Settings(BaseSettings):
    # Ambiente: development, production
    ENVIRONMENT: str = Field(default="development", validation_alias="ENVIRONMENT")
    
    # Database - URLs específicas por ambiente
    DATABASE_URL_DEV: str = Field(default="sqlite:///./erp_dev.db", validation_alias="DATABASE_URL_DEV")
    DATABASE_URL_PROD: str = Field(default="sqlite:///./erp_prod.db", validation_alias="DATABASE_URL_PROD")
    # DATABASE_URL: Usado como fallback ou override manual
    DATABASE_URL: str = Field(default="", validation_alias="DATABASE_URL")
    
    # Security
    SECRET_KEY: str = Field(default="seu-secret-key-aqui-altere-em-producao", validation_alias="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - origens permitidas (separadas por vírgula)
    ALLOWED_ORIGINS: str = Field(default="http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173", validation_alias="ALLOWED_ORIGINS")

    # Email SMTP
    SMTP_HOST: str = Field(default="", validation_alias="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, validation_alias="SMTP_PORT")
    SMTP_USER: str = Field(default="", validation_alias="SMTP_USER")
    SMTP_PASSWORD: str = Field(default="", validation_alias="SMTP_PASSWORD")
    SMTP_FROM_EMAIL: str = Field(default="", validation_alias="SMTP_FROM_EMAIL")
    SMTP_USE_TLS: bool = Field(default=True, validation_alias="SMTP_USE_TLS")
    
    # Frontend
    FRONTEND_URL: str = Field(default="http://localhost:5174", validation_alias="FRONTEND_URL")
    LOGO_PATH: str = Field(default="", validation_alias="LOGO_PATH")
    
    # OneDrive Integration
    ONEDRIVE_ENABLED: bool = Field(default=False, validation_alias="ONEDRIVE_ENABLED")
    ONEDRIVE_CLIENT_ID: str = Field(default="", validation_alias="ONEDRIVE_CLIENT_ID")
    ONEDRIVE_CLIENT_SECRET: str = Field(default="", validation_alias="ONEDRIVE_CLIENT_SECRET")
    ONEDRIVE_TENANT_ID: str = Field(default="", validation_alias="ONEDRIVE_TENANT_ID")
    ONEDRIVE_USER_EMAIL: str = Field(default="", validation_alias="ONEDRIVE_USER_EMAIL")
    ONEDRIVE_ROOT_FOLDER: str = Field(default="ERP_PROJETOS", validation_alias="ONEDRIVE_ROOT_FOLDER")
    
    # Local Storage (alternativa ao OneDrive para testes)
    LOCAL_STORAGE_ENABLED: bool = Field(default=False, validation_alias="LOCAL_STORAGE_ENABLED")
    LOCAL_STORAGE_ROOT_PATH: str = Field(default="", validation_alias="LOCAL_STORAGE_ROOT_PATH")
    LOCAL_TEMPLATES_PATH: str = Field(default="templates", validation_alias="LOCAL_TEMPLATES_PATH")
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    def get_database_url(self) -> str:
        """
        Retorna a URL do banco de dados baseada no ambiente.
        Prioridade: DATABASE_URL (manual) > DATABASE_URL_PROD/DEV (por ambiente)
        """
        # Se DATABASE_URL foi explicitamente definido, usa ele (override manual)
        if self.DATABASE_URL:
            return self.DATABASE_URL
        
        # Caso contrário, seleciona baseado no ambiente
        if self.is_production():
            return self.DATABASE_URL_PROD
        else:
            return self.DATABASE_URL_DEV
    
    def get_allowed_origins(self) -> list:
        """Retorna lista de origens permitidas para CORS"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    def is_production(self) -> bool:
        """Verifica se está em ambiente de produção"""
        return self.ENVIRONMENT.lower() == "production"

settings = Settings()

# Função para obter horário local do Brasil
def get_local_now():
    """Retorna a data e hora atual no fuso horário de Brasília (America/Sao_Paulo)"""
    tz = pytz.timezone('America/Sao_Paulo')
    return datetime.now(tz).replace(tzinfo=None)  # Remove timezone info para compatibilidade com SQLite
