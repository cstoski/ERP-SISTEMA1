"""
Script para atualizar dependências do backend
"""

REQUIREMENTS = """fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlalchemy==2.0.36
pydantic==2.9.2
python-dotenv==1.0.1
pydantic-settings==2.3.4
email-validator==2.1.1
openpyxl==3.1.5
pytz==2024.1
psycopg2-binary==2.9.9
a2wsgi==1.10.4
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
reportlab==4.2.0
alembic==1.13.1

# Development & Testing
pytest==7.4.3
pytest-cov==4.1.0
pytest-asyncio==0.21.1
httpx==0.25.2
black==23.12.1
flake8==6.1.0
isort==5.13.2
mypy==1.7.1
python-multipart==0.0.6
argon2-cffi==23.1.0
"""

if __name__ == "__main__":
    with open("requirements.txt", "w") as f:
        f.write(REQUIREMENTS.strip())
    print("✅ requirements.txt atualizado!")
