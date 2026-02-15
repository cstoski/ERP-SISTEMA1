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
- Python 3.13
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

