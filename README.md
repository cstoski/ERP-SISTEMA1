# ERP Sistema

Sistema ERP profissional desenvolvido com FastAPI (backend) e React + TypeScript (frontend).

[![CI/CD](https://github.com/seu-usuario/erp-sistema/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/seu-usuario/erp-sistema/actions)
[![codecov](https://codecov.io/gh/seu-usuario/erp-sistema/branch/main/graph/badge.svg)](https://codecov.io/gh/seu-usuario/erp-sistema)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Índice

- [Recursos](#-recursos)
- [Tecnologias](#-tecnologias)
- [Setup Rápido](#-setup-rápido)
- [Desenvolvimento](#-desenvolvimento)
- [Testes](#-testes)
- [Docker](#-docker)
- [Produção](#-produção)
- [Contribuindo](#-contribuindo)

## ✨ Recursos

- ✅ **Autenticação JWT** completa com refresh tokens
- ✅ **Gestão de Pessoas Jurídicas** (empresas/clientes)
- ✅ **Contatos** vinculados a empresas
- ✅ **Funcionários** com controle de acesso
- ✅ **Projetos** com cronogramas e etapas
- ✅ **Faturamentos** e controle financeiro
- ✅ **Produtos e Serviços** com NCM/classificação
- ✅ **Despesas de Projetos** com categorização
- ✅ **Interface Responsiva** com Material-UI
- ✅ **Logging Estruturado** com rotação de arquivos
- ✅ **Health Check** para monitoramento
- ✅ **Docker** ready com docker-compose
- ✅ **CI/CD** com GitHub Actions
- ✅ **Testes Automatizados** com cobertura

## 🚀 Setup Rápido

### 📚 Documentação de Desenvolvimento

- **[⚡ QUICK_START.md](./QUICK_START.md)** - Guia rápido de 5 minutos
- **[📖 GUIA_DESENVOLVIMENTO.md](./GUIA_DESENVOLVIMENTO.md)** - Guia completo e detalhado

### ⚡ Execução Rápida (Windows)

Basta executar um dos scripts:

**PowerShell (recomendado):**
```powershell
.\start-app.ps1
```

**Command Prompt (.bat):**
```cmd
start-app.bat
```

Isso irá:
1. Abrir dois terminais (backend e frontend)
2. Ativar o ambiente virtual
3. Iniciar os servidores
4. Abrir o navegador automaticamente

### Execução em 3 Passos (Manual)

#### 1️⃣ Backend

```powershell
cd backend
..\\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

#### 2️⃣ Frontend (outro terminal)

```powershell
cd frontend
npm run dev
```

#### 3️⃣ Acesse

- **Aplicação:** http://localhost:5173
- **API Docs:** http://localhost:8000/api/docs
- **Login:** `admin` / `admin123`

### Pré-requisitos

- Python 3.13+
- Node.js 18+
- PostgreSQL 13+

### Configuração Detalhada

Para instruções completas de configuração inicial, consulte o [GUIA_DESENVOLVIMENTO.md](./GUIA_DESENVOLVIMENTO.md).

### Opção com Make (Linux/Mac)

```bash
# Instalar dependências
make install

# Criar banco e executar migrações
make db-migrate
make db-seed

# Iniciar desenvolvimento
make dev
npm install
npm run dev
```

### Opção 3: Docker

```bash
# Copiar e configurar .env
cp backend/.env.example backend/.env
# Edite com suas configurações

# Iniciar tudo com Docker
make docker-up

# Ou manualmente:
docker-compose up -d
```

## 🔐 Credenciais Padrão

### Usuário Admin
- **Login:** `admin`
- **Senha:** `admin123`
- **Email:** `admin@system.com`

### Usuário Comum
- **Login:** `user`
- **Senha:** `user123`
- **Email:** `user@system.com`

## 📚 Estrutura do Projeto

```
├── .github/
│   └── workflows/
│       └── ci.yml           # Pipeline CI/CD
├── backend/
│   ├── app/
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── routes/         # Rotas/Controllers
│   │   ├── schemas/        # Schemas Pydantic
│   │   ├── middleware.py   # Middlewares customizados
│   │   ├── logging_config.py # Configuração de logging
│   │   └── main.py         # Aplicação FastAPI
│   ├── tests/              # Testes automatizados
│   │   ├── conftest.py     # Fixtures pytest
│   │   ├── test_auth.py
│   │   └── test_models.py
│   ├── alembic/            # Migrações do banco
│   ├── logs/               # Arquivos de log
│   ├── Dockerfile          # Imagem Docker backend
│   ├── pyproject.toml      # Config Black/Pytest
│   ├── .flake8             # Config Flake8
│   └── requirements.txt    # Dependências
├── frontend/
│   ├── src/
│   │   ├── pages/          # Páginas React
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── services/       # Serviços HTTP (API)
│   │   └── types/          # TypeScript types
│   ├── Dockerfile          # Imagem Docker frontend
│   ├── .eslintrc.json      # Config ESLint
│   ├── .prettierrc         # Config Prettier
│   └── package.json
├── docker-compose.yml      # Orquestração Docker
├── Makefile                # Comandos úteis
├── .gitignore              # Arquivos ignorados
├── CONTRIBUTING.md         # Guia de contribuição
└── README.md
```

## 💡 Recursos Principais

- ✅ **Autenticação JWT** completa
- ✅ **Pessoas Jurídicas** com validação de CNPJ
- ✅ **Contatos** vinculados a empresas
- ✅ **Funcionários** com controle de acesso
- ✅ **Projetos** com cronogramas e etapas
- ✅ **Faturamentos** e controle financeiro
- ✅ **Cronogramas** com gestão de etapas
- ✅ **Produtos e Serviços** catalogados
- ✅ **Despesas de Projetos** categorizadas
- ✅ **Interface Responsiva** Material-UI
- ✅ **Logging Estruturado** com rotação
- ✅ **Health Check** para monitoramento
- ✅ **Testes Automatizados** (Backend)
- ✅ **Docker** ready
- ✅ **CI/CD** configurado

## 🔗 URLs de Desenvolvimento

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **Framework:** FastAPI 0.115+
- **ORM:** SQLAlchemy 2.0+
- **Database:** PostgreSQL 13+ (produção), SQLite (dev)
- **Migrations:** Alembic
- **Auth:** JWT (python-jose) + Argon2 (passlib)
- **Testing:** Pytest + Coverage
- **Code Quality:** Black, Flake8, isort, mypy
- **Logging:** Python logging com rotação
- **ASGI Server:** Uvicorn

### Frontend
- **Framework:** React 18
- **Language:** TypeScript 5+
- **Build Tool:** Vite 7+
- **UI Library:** Material-UI (MUI) 7+
- **Routing:** React Router 6+
- **HTTP Client:** Axios
- **Charts:** Chart.js + react-chartjs-2
- **Forms:** React Hook Form (potencial)
Este projeto usa **Make** para simplificar comandos. Veja todos com:

```bash
make help
```

### Comandos Principais

```bash
# Desenvolvimento
make install          # Instala todas dependências
make dev             # Inicia backend + frontend
make dev-backend     # Inicia apenas backend
make dev-frontend    # Inicia apenas frontend

# Database
make db-migrate      # Executa migrações
make db-seed         # Cria usuários iniciais
make db-revision MSG="mensagem"  # Nova migração

# Testes
make test            # Executa todos testes
make test-backend-cov # Testes com coverage

# Code Quality
make lint            # Linting (backend + frontend)
make format          # Formata código
make format-backend  # Formata apenas Python
make format-frontend # Formata apenas TS/React

# Docker
make docker-build    # Build das imagens
make docker-up       # Inicia containers
make docker-down     # Para containers
make docker-logs     # Mostra logs

# Build
make build           # Build de produção
make clean           # Remove caches e builds

# Utilitários
make secret-key      # Gera nova SECRET_KEY
make check           # Verifica configuração
make logs-backend    # Tail logs backend
make logs-errors     # Tail logs de erro
```

### Comandos Manuais (sem Make)Ops
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Health checks integrados
- **Database:** PostgreSQL (produção) 18
- TypeScript
- Vite
- Material-UI
- React Router
- Axios

## 🛠️ Scripts Úteis

### Backend

```bash
# Gerar SECRET_KEY segura
python generate_secret_key.py

# Recriar usuários
python seed_users.py

# Verificar conexão com banco
python -c "from app.database import engine; engine.connect(); print('✅ DB OK')"

# Criar nova migração
python -m alembic revision --autogenerate -m "descrição"

# Aplicar migrações
python -m alembic upgrade head

# Reverter última migração
python -m alembic downgrade -1

# Ver histórico de migrações
python -m alembic history
```

### Frontend

```bash
# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## 📊 Banco de Dados

### Tabelas Principais

- `users` - Usuários do sistema
- `pessoa_juridica` - Empresas/Clientes
- `contatos` - Contatos das empresas
- `funcionarios` - Funcionários
- `projetos` - Projetos
- `faturamentos` - Faturamentos dos projetos
- `cronogramas` - Cronogramas e etapas
- `produtos_servicos` - Produtos e serviços
- `despesas_projetos` - Despesas dos projetos

## 🔧 Configuração do .env

Exemplo de configuração para desenvolvimento local:

```env
# Ambiente
ENVIRONMENT=development

# Banco de Dados
DATABASE_URL=postgresql+psycopg2://postgres:SUA_SENHA@localhost:5432/erp_sistema

# Segurança
SECRET_KEY=cole_aqui_a_chave_gerada
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Email (opcional para desenvolvimento)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha
SMTP_FROM_EMAIL=seu_email@gmail.com
SMTP_USE_TLS=true

# Frontend
FRONTEND_URL=http://localhost:5173

# Logo
LOGO_PATH=./public/assets/images/illustrations/takt_menor.jpg
```

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme usuário/senha no DATABASE_URL
- Verifique se o banco `erp_sistema` existe

### Frontend não conecta com backend
- Verifique se o backend está rodando em http://localhost:8000
- Confirme as configurações de CORS no .env
- Verifique a URL da API no arquivo `frontend/src/config.ts`

### Erro nas migrações
- Verifique se todas as dependências estão instaladas
- Confirme conexão com banco
- Execute: `python -m alembic upgrade head`

## 📝 Notas

- ⚠️ **Altere as senhas padrão** antes de usar em produção
- ⚠️ **Nunca commite o arquivo `.env`** no controle de versão
- ✅ Use `.env.example` como template
- ✅ Configure SECRET_KEY única com `python generate_secret_key.py`

## 📚 Documentação Adicional

- **[⚡ Quick Start](./QUICK_START.md)** - Comece em 5 minutos
- **[📖 Guia de Desenvolvimento](./GUIA_DESENVOLVIMENTO.md)** - Documentação completa
- **[� Comandos Windows](./COMANDOS_WINDOWS.md)** - Comandos PowerShell (equivalentes ao Makefile)
- **[�🤝 Contribuindo](./CONTRIBUTING.md)** - Como contribuir com o projeto
- **[📋 Changelog](./CHANGELOG.md)** - Histórico de versões
- **[📜 Licença](./LICENSE)** - Termos de uso

---

**Desenvolvido com** ❤️ **usando FastAPI e React**

