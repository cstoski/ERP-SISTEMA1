# 🚀 Guia de Desenvolvimento - ERP Sistema TAKT

Este guia contém todas as instruções necessárias para configurar e executar o sistema em ambiente de desenvolvimento.

## 📋 Índice

- [Pré-requisitos](#-pré-requisitos)
- [Configuração Inicial](#️-configuração-inicial)
- [Executando a Aplicação](#-executando-a-aplicação)
- [Comandos Úteis](#️-comandos-úteis)
- [Testes](#-testes)
- [Formatação e Linting](#-formatação-e-linting)
- [Banco de Dados](#-banco-de-dados)
- [Solução de Problemas](#-solução-de-problemas)

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Python 3.13+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 13+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### Verificar Instalações

```powershell
# Verificar Python
python --version

# Verificar Node.js
node --version
npm --version

# Verificar PostgreSQL
psql --version
```

---

## ⚙️ Configuração Inicial

### 1. Clone o Repositório (se ainda não fez)

```powershell
git clone <url-do-repositorio>
cd ERP-SISTEMA
```

### 2. Configure o Banco de Dados PostgreSQL

```powershell
# Conecte-se ao PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE erp_sistema;

# Saia do psql
\q
```

### 3. Configure o Backend

```powershell
# Navegue até a pasta backend
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend

# O ambiente virtual já foi criado em .venv na raiz do projeto
# Basta ativá-lo:
..\\.venv\Scripts\Activate.ps1

# Verifique se está ativo (deve aparecer (.venv) no prompt)
# Exemplo: (.venv) PS D:\PROJETOS\TAKT\ERP-SISTEMA\backend>

# Confirme que as dependências estão instaladas
pip list | Select-String fastapi

# Se precisar reinstalar dependências:
pip install -r requirements.txt
```

### 4. Configure as Variáveis de Ambiente

O arquivo `.env` já existe em `backend/.env`. Verifique se as configurações estão corretas:

```env
# Backend/.env
ENVIRONMENT=development
DATABASE_URL=postgresql+psycopg://postgres:123456789@localhost:5432/erp_sistema
SECRET_KEY=S59d8hRSdxxjzAasSvY_rzNYRnu7havUvfNo6KBjyDMzHeXwZ7u6iJjQdGzEGsMjsu8AyQpphnAX62mbWmOJ_A
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Importante:** Ajuste a senha do PostgreSQL (`123456789`) para a sua senha.

### 5. Execute as Migrações do Banco de Dados

```powershell
# Certifique-se de estar com o ambiente virtual ativo
# e na pasta backend
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1

# Execute as migrações
alembic upgrade head
```

### 6. Crie Usuários de Teste

```powershell
# Ainda na pasta backend com venv ativo
python seed_users.py
```

Isso criará dois usuários:

- **Admin:** username: `admin`, password: `admin123`
- **User:** username: `user`, password: `user123`

### 7. Configure o Frontend

```powershell
# Abra um NOVO terminal e navegue até a pasta frontend
cd D:\PROJETOS\TAKT\ERP-SISTEMA\frontend

# Instale as dependências do Node.js
npm install
```

---

## 🎯 Executando a Aplicação

### Opção 1: Executar Manualmente (Recomendado para Desenvolvimento)

#### Terminal 1 - Backend

```powershell
# 1. Navegue até a pasta backend
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend

# 2. Ative o ambiente virtual
..\\.venv\Scripts\Activate.ps1

# 3. Inicie o servidor FastAPI com hot-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Saída esperada:**

```text
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

#### Terminal 2 - Frontend

```powershell
# 1. Navegue até a pasta frontend
cd D:\PROJETOS\TAKT\ERP-SISTEMA\frontend

# 2. Inicie o servidor de desenvolvimento Vite
npm run dev
```

**Saída esperada:**

```text
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Acessar a Aplicação

- **Frontend (aplicação web):** <http://localhost:5173>
- **Backend (API):** <http://localhost:8000>
- **Documentação Swagger:** <http://localhost:8000/api/docs>
- **ReDoc (documentação alternativa):** <http://localhost:8000/api/redoc>
- **Health Check:** <http://localhost:8000/health>

### Login Inicial

Use as credenciais criadas pelo `seed_users.py`:

- **Administrador:**
  - Username: `admin`
  - Password: `admin123`

- **Usuário padrão:**
  - Username: `user`
  - Password: `user123`

---

## 🛠️ Comandos Úteis

### Ambiente Virtual

```powershell
# Ativar ambiente virtual (Windows PowerShell)
..\\.venv\Scripts\Activate.ps1

# Ativar ambiente virtual (Windows CMD)
..\\.venv\Scripts\activate.bat

# Ativar ambiente virtual (Linux/Mac)
source ../.venv/bin/activate

# Desativar ambiente virtual
deactivate

# Verificar se está ativo
# O prompt deve mostrar: (.venv) PS D:\PROJETOS\...
```

### Backend (FastAPI)

```powershell
# Executar com hot-reload (desenvolvimento)
uvicorn app.main:app --reload

# Executar em uma porta diferente
uvicorn app.main:app --reload --port 8080

# Executar acessível de outras máquinas na rede
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Ver logs em tempo real (depois que o servidor estiver rodando)
# Os logs ficam em backend/logs/
Get-Content logs/app.log -Wait -Tail 50
```

### Frontend (Vite + React)

```powershell
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Linting
npm run lint

# Formatar código
npm run format
```

---

## 🧪 Testes

### Backend (pytest)

```powershell
# Certifique-se de estar na pasta backend com venv ativo
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1

# Executar todos os testes
pytest tests/

# Executar com output verboso
pytest tests/ -v

# Executar testes específicos
pytest tests/test_auth.py

# Executar com cobertura de código
pytest tests/ --cov=app --cov-report=html

# Ver relatório de cobertura (abre no navegador)
# O relatório fica em backend/htmlcov/index.html
start htmlcov/index.html
```

### Frontend (ainda não configurado)

```powershell
# Executar testes (quando implementados)
npm test
```

---

## 🎨 Formatação e Linting

### Backend

```powershell
# Certifique-se de estar na pasta backend com venv ativo
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1

# Formatar código com Black
black app tests

# Organizar imports com isort
isort app tests

# Verificar código com Flake8
flake8 app tests

# Type checking com mypy
mypy app
```

### Frontend

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\frontend

# Executar linting
npm run lint

# Corrigir problemas automaticamente
npm run lint:fix

# Formatar código
npm run format

# Verificar formatação
npm run format:check
```

---

## 💾 Banco de Dados

### Migrações com Alembic

```powershell
# Certifique-se de estar na pasta backend com venv ativo
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1

# Aplicar todas as migrações pendentes
alembic upgrade head

# Reverter última migração
alembic downgrade -1

# Ver histórico de migrações
alembic history

# Criar nova migração (após alterar models)
alembic revision --autogenerate -m "Descrição da mudança"

# Ver status atual
alembic current
```

### Conectar ao Banco de Dados

```powershell
# Conectar via psql
psql -U postgres -d erp_sistema

# Comandos úteis no psql:
\dt          # Listar todas as tabelas
\d users     # Descrever estrutura da tabela users
\q           # Sair do psql
```

### Recriar Usuários de Teste

```powershell
# Se precisar recriar os usuários
python seed_users.py
```

---

## 🐳 Docker (Opcional)

Se preferir usar Docker:

```powershell
# Subir todos os serviços (backend, frontend, postgres)
docker-compose up

# Subir em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild após mudanças
docker-compose up --build
```

---

## 🔧 Solução de Problemas

### Erro: "No module named 'app'"

**Problema:** Ambiente virtual não está ativo ou não está na pasta correta.

**Solução:**

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
```

### Erro: "psycopg2.OperationalError: could not connect to server"

**Problema:** PostgreSQL não está rodando ou credenciais incorretas.

**Solução:**

1. Verifique se o PostgreSQL está rodando
2. Confirme o usuário e senha no arquivo `.env`
3. Teste a conexão: `psql -U postgres -d erp_sistema`

### Erro: "Port 8000 already in use"

**Problema:** Já existe um processo usando a porta 8000.

**Solução:**

```powershell
# Encontrar processo usando a porta
netstat -ano | findstr :8000

# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F

# Ou use outra porta
uvicorn app.main:app --reload --port 8001
```

### Aviso: "orm_mode has been renamed to from_attributes"

**Status:** ✅ **CORRIGIDO** - Todos os schemas foram atualizados para Pydantic V2.

### Frontend não conecta ao Backend

**Problema:** CORS ou URL incorreta.

**Solução:**

1. Verifique se o backend está rodando em `http://localhost:8000`
2. Confirme que `ALLOWED_ORIGINS` no `.env` inclui `http://localhost:5173`
3. Verifique a URL da API em `frontend/src/config.ts`

### Erro ao instalar dependências Python

**Problema:** Incompatibilidade de versões ou falta de compiladores.

**Solução:**

```powershell
# Atualizar pip
python -m pip install --upgrade pip

# Reinstalar dependências
pip install -r requirements.txt --force-reinstall

# Se erros persistirem com psycopg, está usando psycopg3 que tem binários
pip install "psycopg[binary]>=3.2.13"
```

---

## 📚 Recursos Adicionais

### Documentação do Projeto

- [README.md](./README.md) - Visão geral do projeto
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guia de contribuição
- [CHANGELOG.md](./CHANGELOG.md) - Histórico de mudanças

### Tecnologias Utilizadas

**Backend:**

- FastAPI 0.115.0 - Framework web moderno
- SQLAlchemy 2.0.36 - ORM para banco de dados
- Alembic 1.13.1 - Migrações de banco de dados
- Pydantic 2.9.2 - Validação de dados
- psycopg 3.x - Driver PostgreSQL
- pytest 7.4.3 - Framework de testes
- Uvicorn 0.32.0 - Servidor ASGI

**Frontend:**

- React 18 - Biblioteca UI
- TypeScript 5 - Superset tipado do JavaScript
- Vite 7 - Build tool e dev server
- Material-UI 7 - Componentes UI
- React Router 6 - Roteamento
- Axios - Cliente HTTP

**Banco de Dados:**

- PostgreSQL 13+ - Banco de dados relacional

---

## 🔐 Segurança

### Credenciais de Desenvolvimento

⚠️ **IMPORTANTE:** As credenciais abaixo são apenas para DESENVOLVIMENTO LOCAL.

**Nunca use em produção!**

- Admin: `admin` / `admin123`
- User: `user` / `user123`
- PostgreSQL: `postgres` / `123456789` (ajuste para sua senha)

### Produção

Para produção, você deve:

1. Gerar uma nova `SECRET_KEY`:

   ```python
   import secrets
   print(secrets.token_urlsafe(64))
   ```

2. Usar senhas fortes para todos os usuários

3. Configurar variáveis de ambiente seguras

4. Usar HTTPS

5. Configurar firewall adequadamente

---

## 📞 Suporte

Se encontrar problemas:

1. Consulte a seção [Solução de Problemas](#-solução-de-problemas)
2. Verifique os logs em `backend/logs/`
3. Execute os testes: `pytest tests/ -v`
4. Abra uma issue no repositório

---

## ✅ Checklist de Desenvolvimento

Antes de começar a desenvolver, certifique-se de que:

- [ ] PostgreSQL está rodando
- [ ] Ambiente virtual está ativo (`.venv`)
- [ ] Migrações foram executadas (`alembic upgrade head`)
- [ ] Usuários de teste foram criados (`python seed_users.py`)
- [ ] Backend está rodando (`uvicorn app.main:app --reload`)
- [ ] Frontend está rodando (`npm run dev`)
- [ ] Consegue acessar <http://localhost:5173>
- [ ] Consegue fazer login com admin/admin123
- [ ] Testes estão passando (`pytest tests/`)

---

**Última atualização:** 16 de Fevereiro de 2026

**Versão:** 1.0.0
