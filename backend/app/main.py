from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .database import engine, Base
from .routes import (
    pessoa_juridica,
    contato,
    projeto,
    funcionario,
    faturamento,
    auth,
    cronograma,
    produto_servico,
    despesa_projeto,
)
from fastapi import Depends
from .config import settings
from .logging_config import setup_logging, get_logger
from .middleware import LoggingMiddleware, ErrorLoggingMiddleware

# Configurar logging
setup_logging()
logger = get_logger(__name__)

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ERP Sistema TAKT",
    version="1.0.0",
    description="Sistema ERP completo com gestão de projetos, faturamentos e recursos",
    docs_url="/api/docs" if not settings.is_production() else None,
    redoc_url="/api/redoc" if not settings.is_production() else None,
)

# Middlewares de logging
app.add_middleware(ErrorLoggingMiddleware)
app.add_middleware(LoggingMiddleware)

# Configurar CORS com origens específicas
allowed_origins = settings.get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

logger.info(f"Aplicação iniciada - Ambiente: {settings.ENVIRONMENT}")
logger.info(f"CORS configurado para: {allowed_origins}")

app.include_router(
    pessoa_juridica.router, prefix="/api/pessoas-juridicas", tags=["Pessoas Jurídicas"]
)
app.include_router(contato.router, prefix="/api/contatos", tags=["Contatos"])
app.include_router(
    produto_servico.router, prefix="/api/produtos-servicos", tags=["Produtos/Serviços"]
)
# Protect main entity routes with authentication
app.include_router(
    projeto.router,
    prefix="/api/projetos",
    tags=["Projetos"],
    dependencies=[Depends(auth.get_current_user)],
)
app.include_router(
    funcionario.router,
    prefix="/api/funcionarios",
    tags=["Funcionários"],
    dependencies=[Depends(auth.get_current_user)],
)
app.include_router(
    faturamento.router,
    prefix="/api/faturamentos",
    tags=["Faturamentos"],
    dependencies=[Depends(auth.get_current_user)],
)
app.include_router(
    cronograma.router,
    prefix="/api/cronogramas",
    tags=["Cronogramas"],
    dependencies=[Depends(auth.get_current_user)],
)
app.include_router(
    despesa_projeto.router,
    prefix="/api",
    tags=["Despesas de Projetos"],
    dependencies=[Depends(auth.get_current_user)],
)
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])


@app.get("/")
def read_root():
    """Endpoint raiz da API"""
    logger.debug("Endpoint raiz acessado")
    return {"message": "ERP Sistema API", "version": "1.0.0", "status": "running"}


@app.get("/health")
def health_check():
    """
    Health check endpoint para monitoramento
    
    Returns:
        dict: Status da aplicação e dependências
    """
    from sqlalchemy import text
    
    health_status = {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }
    
    # Verificar conexão com banco de dados
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        logger.error(f"Health check - Database error: {str(e)}")
        health_status["status"] = "unhealthy"
        health_status["database"] = "disconnected"
    
    return health_status