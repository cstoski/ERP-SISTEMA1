from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import pessoa_juridica, contato, projeto, funcionario, faturamento

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
app.include_router(projeto.router, prefix="/api/projetos", tags=["Projetos"])
app.include_router(funcionario.router, prefix="/api/funcionarios", tags=["Funcionários"])
app.include_router(faturamento.router, prefix="/api/faturamentos", tags=["Faturamentos"])

@app.get("/")
def read_root():
    return {"message": "ERP Sistema API"}