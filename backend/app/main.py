from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .database import engine, Base
from .routes import pessoa_juridica, contato, projeto, funcionario, faturamento, auth, cronograma, produto_servico
from fastapi import Depends

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ERP Sistema", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
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
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

@app.get("/")
def read_root():
    return {"message": "ERP Sistema API"}