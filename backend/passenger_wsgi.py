"""
Arquivo WSGI para deploy no cPanel com Passenger
"""
import sys
import os

# Adicionar o diretório da aplicação ao Python path
sys.path.insert(0, os.path.dirname(__file__))

# Configurar ambiente virtual
VENV_PATH = os.path.join(os.path.dirname(__file__), 'venv')

import site
# Detectar versão do Python automaticamente
python_version = f"python{sys.version_info.major}.{sys.version_info.minor}"
site_packages = os.path.join(VENV_PATH, 'lib', python_version, 'site-packages')

if os.path.exists(site_packages):
    site.addsitedir(site_packages)
else:
    raise RuntimeError(f"Site packages not found at: {site_packages}")

# Carregar variáveis de ambiente do arquivo .env
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# Importar a aplicação FastAPI
from app.main import app

# Converter ASGI (FastAPI) para WSGI (Passenger)
try:
    from a2wsgi import ASGIMiddleware
    application = ASGIMiddleware(app)
except ImportError:
    print("ERROR: a2wsgi not installed. Run: pip install a2wsgi")
    raise

# Log de inicialização
print(f"✅ Aplicação iniciada com sucesso!")
print(f"   Python: {sys.version}")
print(f"   Venv: {VENV_PATH}")
print(f"   Environment: {os.getenv('ENVIRONMENT', 'development')}")
