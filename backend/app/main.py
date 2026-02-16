from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .database import engine, Base
from .routes import pessoa_juridica, contato, projeto, funcionario, faturamento, auth, cronograma, produto_servico, despesa_projeto
from fastapi import Depends
from .config import settings

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ERP Sistema TAKT",
    version="1.0.0",
    docs_url="/api/docs" if not settings.is_production() else None,  # Desabilitar docs em produção
    redoc_url="/api/redoc" if not settings.is_production() else None,
)

# Configurar CORS com origens específicas
allowed_origins = settings.get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(pessoa_juridica.router, prefix="/api/pessoas-juridicas", tags=["Pessoas Jurídicas"])
app.include_router(contato.router, prefix="/api/contatos", tags=["Contatos"])
app.include_router(produto_servico.router, prefix="/api/produtos-servicos", tags=["Produtos/Serviços"])
# Protect main entity routes with authentication
app.include_router(projeto.router, prefix="/api/projetos", tags=["Projetos"], dependencies=[Depends(auth.get_current_user)])
app.include_router(funcionario.router, prefix="/api/funcionarios", tags=["Funcionários"], dependencies=[Depends(auth.get_current_user)])
app.include_router(faturamento.router, prefix="/api/faturamentos", tags=["Faturamentos"], dependencies=[Depends(auth.get_current_user)])
app.include_router(cronograma.router, prefix="/api/cronogramas", tags=["Cronogramas"], dependencies=[Depends(auth.get_current_user)])
app.include_router(despesa_projeto.router, prefix="/api", tags=["Despesas de Projetos"], dependencies=[Depends(auth.get_current_user)])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

@app.get("/")
def read_root():
    return {"message": "ERP Sistema API"}