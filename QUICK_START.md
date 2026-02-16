# ⚡ Quick Start - ERP Sistema TAKT

Guia rápido para executar a aplicação em 5 minutos.

## 🎯 Execução Rápida

### 1️⃣ Backend (Terminal 1)

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

### 2️⃣ Frontend (Terminal 2)

```powershell
cd D:\PROJETOS\TAKT\ERP-SISTEMA\frontend
npm run dev
```

### 3️⃣ Acessar

- **Aplicação:** http://localhost:5173
- **API Docs:** http://localhost:8000/api/docs

### 🔑 Login

- **Admin:** `admin` / `admin123`
- **User:** `user` / `user123`

---

## 🔧 Comandos Essenciais

### Ativar Ambiente Virtual

```powershell
# Windows PowerShell
..\\.venv\Scripts\Activate.ps1

# Desativar
deactivate
```

### Executar Testes

```powershell
cd backend
..\\.venv\Scripts\Activate.ps1
pytest tests/ -v
```

### Formatar Código

```powershell
# Backend
cd backend
black app tests
isort app tests

# Frontend
cd frontend
npm run format
```

### Migrações do Banco

```powershell
cd backend
..\\.venv\Scripts\Activate.ps1
alembic upgrade head
```

---

## ❌ Problemas Comuns

### Porta 8000 em uso

```powershell
# Usar outra porta
uvicorn app.main:app --reload --port 8001
```

### PostgreSQL não conecta

1. Verifique se PostgreSQL está rodando
2. Ajuste senha no `backend/.env`
3. Teste: `psql -U postgres -d erp_sistema`

### Ambiente virtual não ativa

```powershell
# Certifique-se de estar na pasta backend
cd D:\PROJETOS\TAKT\ERP-SISTEMA\backend
..\\.venv\Scripts\Activate.ps1
```

---

## 📚 Documentação Completa

Para informações detalhadas, consulte:
- [GUIA_DESENVOLVIMENTO.md](./GUIA_DESENVOLVIMENTO.md) - Guia completo
- [COMANDOS_WINDOWS.md](./COMANDOS_WINDOWS.md) - Todos os comandos PowerShell
- [README.md](./README.md) - Visão geral do projeto
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Como contribuir

---

**Criado em:** 16 de Fevereiro de 2026
