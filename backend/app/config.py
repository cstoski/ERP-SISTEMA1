from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from datetime import datetime
import pytz
import secrets

class Settings(BaseSettings):
    # Ambiente: development, production
    ENVIRONMENT: str = Field(default="development", validation_alias="ENVIRONMENT")
    
    # Database
    DATABASE_URL: str = "sqlite:///./erp.db"
    
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
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
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
