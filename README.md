# ERP Sistema

Sistema ERP desenvolvido com FastAPI (backend) e React + TypeScript (frontend).

## 🚀 Instalação e Setup

### Backend

1. **Instalar dependências:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Executar as migrações do banco:**
```bash
alembic upgrade head
```

3. **Criar usuários padrão (primeira vez):**
```bash
python seed_users.py
```

4. **Iniciar servidor:**
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend

1. **Instalar dependências:**
```bash
cd frontend
npm install
```

2. **Iniciar servidor de desenvolvimento:**
```bash
npm run dev
```

## 🔐 Credenciais Padrão

O sistema vem com dois usuários padrão:

### Usuário Admin
- **Login:** `admin`
- **Senha:** `admin123`
- **Email:** `admin@system.com`
- **Função:** Admin

### Usuário Comum
- **Login:** `user`
- **Senha:** `user123`
- **Email:** `user@system.com`
- **Função:** User

## 📚 Estrutura do Projeto

```
├── backend/              # FastAPI Backend
│   ├── app/
│   │   ├── models/      # Modelos SQLAlchemy
│   │   ├── routes/      # Rotas/Controllers
│   │   ├── schemas/     # Schemas Pydantic
│   │   └── main.py      # Aplicação FastAPI
│   ├── alembic/         # Migrações de banco
│   └── seed_users.py    # Script para criar usuários
├── frontend/            # React + TypeScript Frontend
│   └── src/
│       ├── pages/       # Páginas
│       ├── components/  # Componentes React
│       ├── services/    # Serviços HTTP
│       └── styles/      # Estilos CSS
└── README.md
```

## 💡 Recursos Principais

- ✅ Autenticação com JWT
- ✅ Pessoas Jurídicas
- ✅ Contatos
- ✅ Funcionários
- ✅ Projetos
- ✅ Faturamentos
- ✅ Interface responsiva com Material Design
- ✅ Validação de formulários
- ✅ Error Boundary para melhor UX

## 🔗 URLs Default

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## ⚙️ Tecnologias

### Backend
- Python 3.10+
- FastAPI
- SQLAlchemy (ORM)
- Alembic (Migrações)
- PostgreSQL / MySQL
- JWT Authentication
- Pydantic

### Frontend
- React 18
- TypeScript
- Vite
- Material-UI
- React Router

## 🚀 Deploy em Produção

### Guias Disponíveis

Escolha o guia adequado para seu ambiente:

#### 📘 [Deploy no cPanel](DEPLOY-CPANEL-RAPIDO.md) ⭐ **Recomendado para iniciantes**
- Hospedagem compartilhada com cPanel
- Guia passo a passo simplificado (15 minutos)
- [Guia Completo cPanel](DEPLOY-CPANEL.md)
- [Configuração .env para cPanel](CPANEL-ENV-CONFIG.md)

#### 📗 [Deploy em Linux/Ubuntu](DEPLOY.md)
- Servidor VPS ou Cloud
- Nginx + Supervisor/systemd
- PostgreSQL
- Completo com SSL/TLS

#### 📕 [Deploy em Windows Server](DEPLOY-WINDOWS.md)
- Windows Server com IIS
- NSSM para serviços
- PostgreSQL ou SQL Server

#### 📙 [Guia Rápido de Produção](PRODUCAO.md)
- Checklist rápido
- Configurações essenciais
- Comandos úteis

### Scripts de Deploy

```bash
# Verificar se está pronto para produção
python backend/check_production.py

# Verificar compatibilidade com cPanel
python backend/check_cpanel.py

# Gerar SECRET_KEY segura
python backend/generate_secret_key.py

# Criar usuários iniciais
python backend/create_initial_users.py
```

### Configuração Rápida

1. **Gerar SECRET_KEY:**
   ```bash
   cd backend
   python generate_secret_key.py
   ```

2. **Configurar .env:**
   ```env
   ENVIRONMENT=production
   DATABASE_URL=postgresql://user:pass@host/db
   SECRET_KEY=<sua_chave_gerada>
   ALLOWED_ORIGINS=https://seudominio.com.br
   ```

3. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

4. **Executar Migrações:**
   ```bash
   cd backend
   python -m alembic upgrade head
   python create_initial_users.py
   ```

5. **Iniciar em Produção:**
   ```bash
   python run_production.py
   ```

## 🔒 Segurança

**IMPORTANTE antes de produção:**
- ✅ Altere todas as senhas padrão (admin123, user123)
- ✅ Configure SECRET_KEY única e segura
- ✅ Use HTTPS (SSL/TLS)
- ✅ Configure CORS apenas para domínios específicos
- ✅ Mantenha .env fora do controle de versão
- ✅ Use senhas fortes para banco de dados
- ✅ Configure firewall adequadamente
- ✅ Mantenha backups regulares

## 📊 Banco de Dados

### Desenvolvimento
- SQLite (padrão)

### Produção (Recomendado)
- PostgreSQL 13.23+
- MySQL 8.0+ (alternativa)

### Migrações

```bash
# Criar nova migração
alembic revision --autogenerate -m "descrição"

# Aplicar migrações
alembic upgrade head

# Reverter última migração
alembic downgrade -1

# Ver histórico
alembic history
```

## 🛠️ Scripts Úteis

| Script | Descrição |
|--------|-----------|
| `check_production.py` | Valida configurações para produção |
| `check_cpanel.py` | Verifica compatibilidade com cPanel |
| `generate_secret_key.py` | Gera SECRET_KEY segura |
| `create_initial_users.py` | Cria usuários admin e user |
| `run_server.py` | Inicia servidor em desenvolvimento |
| `run_production.py` | Inicia servidor em produção |

## 📦 Estrutura Completa

```
ERP-SISTEMA/
├── backend/
│   ├── app/
│   │   ├── models/          # Modelos do banco de dados
│   │   ├── routes/          # Endpoints da API
│   │   ├── schemas/         # Schemas Pydantic
│   │   ├── config.py        # Configurações
│   │   ├── database.py      # Conexão com DB
│   │   └── main.py          # Aplicação FastAPI
│   ├── alembic/             # Migrações Alembic
│   ├── passenger_wsgi.py    # WSGI para cPanel
│   ├── requirements.txt     # Dependências Python
│   ├── .env                 # Variáveis de ambiente
│   └── *.py                 # Scripts auxiliares
├── frontend/
│   ├── src/
│   │   ├── pages/           # Páginas React
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── services/        # Serviços de API
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Componente principal
│   ├── public/              # Arquivos estáticos
│   ├── dist/                # Build de produção
│   ├── .htaccess.example    # Exemplo para cPanel
│   └── package.json         # Dependências Node
├── DEPLOY-CPANEL.md         # Guia completo cPanel
├── DEPLOY-CPANEL-RAPIDO.md  # Guia rápido cPanel
├── DEPLOY.md                # Guia Linux/Ubuntu
├── DEPLOY-WINDOWS.md        # Guia Windows Server
├── PRODUCAO.md              # Guia rápido produção
└── README.md                # Este arquivo
```
- FastAPI
- SQLAlchemy
- Pydantic
- Bcrypt (para hashing de senhas)
- JWT (para autenticação)
- Alembic (para migrações)

### Frontend
- React 18
- TypeScript
- Vite
- Axios
- React Router

## 📝 Notas de Desenvolvimento

- As rotas de autenticação (`/login`, `/signup`) não requerem sidebar/header
- O Error Boundary captura erros não tratados
- As senhas são hasheadas com bcrypt
- Tokens JWT com validade de 7 dias

