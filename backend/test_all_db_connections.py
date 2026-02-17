import sqlalchemy
import os
from dotenv import load_dotenv

# Carrega variáveis do .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

def test_connection(db_url, label):
    print(f'Testando conexão com: {label}')
    try:
        engine = sqlalchemy.create_engine(db_url)
        with engine.connect() as conn:
            result = conn.execute(sqlalchemy.text('SELECT 1'))
            print(f'Conexão com {label} bem-sucedida! Resultado:', result.scalar())
    except Exception as e:
        print(f'Erro ao conectar no banco {label}:', e)

if __name__ == '__main__':
    db_urls = {
        'DATABASE_URL_PROD': os.getenv('DATABASE_URL_PROD'),
        'DATABASE_URL_DEV': os.getenv('DATABASE_URL_DEV'),
        'DATABASE_URL': os.getenv('DATABASE_URL'),
    }
    for label, url in db_urls.items():
        if url:
            test_connection(url, label)
