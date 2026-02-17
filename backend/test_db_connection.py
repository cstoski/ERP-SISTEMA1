import sqlalchemy
from app.config import settings

if __name__ == "__main__":
    url = settings.get_database_url()
    print(f"Testando conexão com: {url}")
    try:
        engine = sqlalchemy.create_engine(url)
        with engine.connect() as conn:
            result = conn.execute(sqlalchemy.text("SELECT 1"))
            print("Conexão bem-sucedida! Resultado:", result.scalar())
    except Exception as e:
        print("Erro ao conectar no banco de dados:", e)
