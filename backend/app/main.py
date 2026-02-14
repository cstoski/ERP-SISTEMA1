from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import pessoa_juridica

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

@app.get("/")
def read_root():
    return {"message": "ERP Sistema API"}
