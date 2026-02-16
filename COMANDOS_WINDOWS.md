# 🪟 Comandos PowerShell - ERP Sistema TAKT

Este documento contém todos os comandos PowerShell equivalentes aos comandos do Makefile, adaptados para Windows.

## 🎯 Navegação Rápida

- [Ambiente Virtual](#-ambiente-virtual)
- [Instalação](#-instalação)
- [Desenvolvimento](#-desenvolvimento)
- [Testes](#-testes)
- [Formatação e Linting](#-formatação-e-linting)
- [Banco de Dados](#-banco-de-dados)
- [Docker](#-docker)
- [Limpeza](#-limpeza)

---

## 🐍 Ambiente Virtual

### Ativar

```powershell
# Na pasta backend
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
```

### Desativar

```powershell
deactivate
```

### Verificar se está ativo

```powershell
# Deve aparecer (.venv) no início do prompt
# Exemplo: (.venv) PS D:\PROJETOS\TAKT\ERP-SISTEMA\backend>
```

---

## 📦 Instalação

### Instalar dependências do Backend

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Instalar dependências do Frontend

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\frontend
npm install
```

### Instalar tudo (Backend + Frontend)

```powershell
# Backend
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Frontend
cd ..\frontend
npm install
```

---

## 🚀 Desenvolvimento

### Executar Backend

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Executar Frontend

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\frontend
npm run dev
```

### Executar Ambos (2 terminais)

**Terminal 1 (Backend):**

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend):**

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\frontend
npm run dev
```

---

## 🧪 Testes

### Executar todos os testes

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
pytest tests/
```

### Testes com output verboso

```powershell
pytest tests/ -v
```

### Testes com cobertura

```powershell
pytest tests/ --cov=app --cov-report=term-missing
```

### Testes com cobertura em HTML

```powershell
pytest tests/ --cov=app --cov-report=html
# Abrir relatório
start htmlcov/index.html
```

### Testes específicos

```powershell
# Testar apenas autenticação
pytest tests/test_auth.py -v

# Testar apenas modelos
pytest tests/test_models.py -v

# Testar apenas main
pytest tests/test_main.py -v
```

---

## 🎨 Formatação e Linting

### Backend

#### Formatar código (Black)

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
black app tests
```

#### Organizar imports (isort)

```powershell
isort app tests
```

#### Verificar código (Flake8)

```powershell
flake8 app tests
```

#### Type checking (mypy)

```powershell
mypy app
```

#### Formatar tudo de uma vez

```powershell
# Executar na ordem
black app tests
isort app tests
flake8 app tests
```

### Frontend

#### Lint

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\frontend
npm run lint
```

#### Lint com correção automática

```powershell
npm run lint:fix
```

#### Formatar

```powershell
npm run format
```

#### Verificar formatação

```powershell
npm run format:check
```

#### Type checking

```powershell
npm run type-check
```

---

## 💾 Banco de Dados

### Executar migrações

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
alembic upgrade head
```

### Reverter última migração

```powershell
alembic downgrade -1
```

### Criar nova migração

```powershell
alembic revision --autogenerate -m "Descrição da mudança"
```

### Ver histórico de migrações

```powershell
alembic history
```

### Ver migração atual

```powershell
alembic current
```

### Criar usuários de teste

```powershell
python seed_users.py
```

### Resetar banco (cuidado!)

```powershell
# Conectar ao PostgreSQL
psql -U postgres

# No psql:
DROP DATABASE erp_sistema;
CREATE DATABASE erp_sistema;
\q

# Executar migrações novamente
alembic upgrade head

# Criar usuários
python seed_users.py
```

---

## 🐳 Docker

### Build das imagens

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA

# Build backend
docker build -t erp-backend ./backend

# Build frontend
docker build -t erp-frontend ./frontend

# Build ambos
docker-compose build
```

### Executar com Docker Compose

```powershell
# Subir todos os serviços
docker-compose up

# Subir em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Parar serviços

```powershell
# Parar
docker-compose stop

# Parar e remover containers
docker-compose down

# Parar e remover containers + volumes
docker-compose down -v
```

### Rebuild

```powershell
# Rebuild e subir
docker-compose up --build

# Rebuild sem cache
docker-compose build --no-cache
docker-compose up
```

---

## 🧹 Limpeza

### Limpar cache Python

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend

# Remover __pycache__
Get-ChildItem -Path . -Include __pycache__ -Recurse -Directory | Remove-Item -Recurse -Force

# Remover .pyc files
Get-ChildItem -Path . -Filter *.pyc -Recurse | Remove-Item -Force

# Remover .pytest_cache
Remove-Item -Recurse -Force .pytest_cache
```

### Limpar build do Frontend

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\frontend

# Remover node_modules
Remove-Item -Recurse -Force node_modules

# Remover dist
Remove-Item -Recurse -Force dist
```

### Limpar logs

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend

# Remover todos os logs
Remove-Item -Path logs\*.log -Force

# Ou limpar todo o diretório de logs
Remove-Item -Recurse -Force logs
New-Item -ItemType Directory -Path logs
```

### Limpar Docker

```powershell
# Parar e remover tudo
docker-compose down -v

# Remover imagens órfãs
docker image prune -f

# Remover volumes não usados
docker volume prune -f

# Limpeza completa (CUIDADO!)
docker system prune -a --volumes
```

### Limpar cobertura de testes

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend

Remove-Item -Recurse -Force htmlcov
Remove-Item -Force .coverage
```

### Limpeza completa do projeto

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA

# Backend
cd backend
Get-ChildItem -Path . -Include __pycache__ -Recurse -Directory | Remove-Item -Recurse -Force
Remove-Item -Recurse -Force .pytest_cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force htmlcov -ErrorAction SilentlyContinue
Remove-Item -Force .coverage -ErrorAction SilentlyContinue

# Frontend
cd ..\frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
```

---

## 🔧 Utilitários

### Gerar SECRET_KEY

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### Ver versão do Python

```powershell
python --version
```

### Ver versão do Node

```powershell
node --version
npm --version
```

### Ver pacotes instalados (Python)

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
pip list
```

### Ver pacotes instalados (Node)

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\frontend
npm list --depth=0
```

### Atualizar pip

```powershell
python -m pip install --upgrade pip
```

### Verificar porta em uso

```powershell
# Ver quem está usando a porta 8000
netstat -ano | findstr :8000

# Matar processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F
```

### Conectar ao PostgreSQL

```powershell
# Via psql
psql -U postgres -d erp_sistema

# Comandos úteis no psql:
# \dt          - Listar tabelas
# \d users     - Descrever tabela users
# \q           - Sair
```

---

## 📊 Monitoramento

### Ver logs em tempo real

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend

# Ver logs da aplicação
Get-Content logs\app.log -Wait -Tail 50

# Ver logs de erros
Get-Content logs\errors.log -Wait -Tail 50
```

### Health Check

```powershell
# Via PowerShell
Invoke-WebRequest -Uri http://localhost:8000/health | Select-Object -ExpandProperty Content

# Via navegador
start http://localhost:8000/health
```

### Abrir documentação da API

```powershell
# Swagger UI
start http://localhost:8000/api/docs

# ReDoc
start http://localhost:8000/api/redoc
```

---

## 🔄 Workflow Completo

### Primeira vez (setup inicial)

```powershell
# 1. Navegar até a pasta
cd D:\PROJETOS\TAKT\ERP-SISTEMA

# 2. Instalar backend
cd backend
..\\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 3. Configurar banco
alembic upgrade head
python seed_users.py

# 4. Instalar frontend
cd ..\frontend
npm install
```

### Desenvolvimento diário

**Terminal 1 - Backend:**

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\frontend
npm run dev
```

### Antes de commitar

```powershell
# Backend
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
black app tests
isort app tests
flake8 app tests
pytest tests/ -v

# Frontend
cd ..\frontend
npm run lint:fix
npm run format
npm run type-check
```

---

**Última atualização:** 16 de Fevereiro de 2026

**Nota:** Estes comandos são equivalentes aos do Makefile, adaptados para PowerShell no Windows.
