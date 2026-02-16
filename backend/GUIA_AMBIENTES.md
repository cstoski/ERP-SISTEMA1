# 🔄 Guia de Alternância entre Ambientes

## 📋 Visão Geral

Este sistema permite alternar facilmente entre bancos de dados de **desenvolvimento** e **produção** sem modificar código ou arquivos manualmente.

## 🏗️ Arquitetura

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `ENVIRONMENT` | Ambiente ativo (`development` ou `production`) | `development` |
| `DATABASE_URL_DEV` | URL do banco de desenvolvimento | `sqlite:///./erp_dev.db` |
| `DATABASE_URL_PROD` | URL do banco de produção | `sqlite:///./erp_prod.db` |
| `DATABASE_URL` | Override manual (opcional) | - |

### Prioridade de Seleção

```
DATABASE_URL (se definido)
    ↓ (se vazio)
ENVIRONMENT == "production" → DATABASE_URL_PROD
ENVIRONMENT == "development" → DATABASE_URL_DEV
```

## 🚀 Como Usar

### 1️⃣ Configuração Inicial

Copie o arquivo de exemplo e configure suas credenciais:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edite o arquivo `.env` e configure as URLs dos bancos:

```env
ENVIRONMENT=development

# Banco de desenvolvimento (SQLite para testes locais)
DATABASE_URL_DEV=sqlite:///./erp_dev.db

# Banco de produção (PostgreSQL recomendado)
DATABASE_URL_PROD=postgresql+psycopg://postgres:senha@localhost:5432/erp_producao
```

### 2️⃣ Alternando entre Ambientes

#### **Usando Script Python:**

```bash
# Ver configuração atual
python switch_environment.py status

# Alternar para desenvolvimento
python switch_environment.py dev

# Alternar para produção
python switch_environment.py prod
```

#### **Usando Scripts de Atalho (Windows):**

```powershell
# PowerShell
.\switch-env.ps1 status
.\switch-env.ps1 dev
.\switch-env.ps1 prod

# Command Prompt
switch-env.bat status
switch-env.bat dev
switch-env.bat prod
```

### 3️⃣ Override Manual (Avançado)

Para usar uma URL customizada temporariamente:

```bash
python switch_environment.py set "postgresql://user:pass@server/custom_db"
```

Para remover o override e voltar ao sistema DEV/PROD:

```bash
python switch_environment.py dev
# ou
python switch_environment.py prod
```

## 📊 Exemplos de Configuração

### Exemplo 1: SQLite para Dev, PostgreSQL para Prod

```env
ENVIRONMENT=development

DATABASE_URL_DEV=sqlite:///./erp_dev.db
DATABASE_URL_PROD=postgresql+psycopg://postgres:senha123@localhost:5432/erp_producao
```

### Exemplo 2: PostgreSQL para Ambos (diferentes databases)

```env
ENVIRONMENT=development

DATABASE_URL_DEV=postgresql+psycopg://postgres:senha@localhost:5432/erp_dev
DATABASE_URL_PROD=postgresql+psycopg://postgres:senha@localhost:5432/erp_prod
```

### Exemplo 3: Servidores Diferentes

```env
ENVIRONMENT=production

DATABASE_URL_DEV=postgresql+psycopg://dev_user:dev_pass@localhost:5432/erp_dev
DATABASE_URL_PROD=postgresql+psycopg://prod_user:prod_pass@servidor.empresa.com:5432/erp_prod
```

## ⚠️ Pontos Importantes

### 🔴 Reiniciar o Servidor

**Sempre reinicie o servidor backend após alternar o ambiente!**

O SQLAlchemy carrega a conexão na inicialização, então mudanças no `.env` só têm efeito após reiniciar.

### 🔴 Backup de Produção

Antes de alternar para produção:
- ✅ Certifique-se de ter backup
- ✅ Teste a conexão
- ✅ Verifique as credenciais
- ✅ Confirme que as migrações estão atualizadas

### 🔴 Segurança

- ❌ **NUNCA** commite o arquivo `.env` no Git
- ✅ Mantenha `.env` no `.gitignore`
- ✅ Use senhas fortes para produção
- ✅ Use credenciais diferentes entre DEV e PROD

## 🔍 Verificando a Configuração Atual

```bash
python switch_environment.py status
```

Saída exemplo:
```
======================================================================
📊 CONFIGURAÇÃO ATUAL DO AMBIENTE
======================================================================
🔧 Ambiente: DEVELOPMENT

📁 URLs de Banco Configuradas:
   • Development: sqlite:///./erp_dev.db
   • Production:  postgresql+psycopg://postgres:***@localhost:5432/erp_prod

✅ Banco Ativo (development):
   • sqlite:///./erp_dev.db
======================================================================
```

## 🛠️ Solução de Problemas

### Problema: "Arquivo .env não encontrado"

**Solução:**
```bash
copy .env.example .env
# Configure as variáveis no arquivo .env
```

### Problema: Mudança não está sendo aplicada

**Solução:**
- Reinicie o servidor backend
- Verifique se o arquivo `.env` foi salvo
- Execute `python switch_environment.py status` para confirmar

### Problema: Erro de conexão com o banco

**Solução:**
1. Verifique se a URL está correta
2. Confirme que o banco está rodando
3. Teste a conexão manualmente
4. Verifique credenciais (usuário/senha)

## 🎯 Fluxo de Trabalho Recomendado

### Desenvolvimento Diário

```bash
# 1. Sempre use development
python switch_environment.py dev

# 2. Inicie o servidor
python run_server.py

# 3. Desenvolva e teste
```

### Deploy para Produção

```bash
# 1. Commit e push das mudanças
git add .
git commit -m "Feature X implementada"
git push

# 2. No servidor de produção, alterne para prod
python switch_environment.py prod

# 3. Execute migrações se necessário
alembic upgrade head

# 4. Reinicie o servidor
# ... (dependendo do seu setup de deploy)
```

## 📚 Referências

- **Arquivo de Configuração:** `backend/app/config.py`
- **Conexão do Banco:** `backend/app/database.py`
- **Script de Alternância:** `backend/switch_environment.py`
- **Exemplo de ENV:** `backend/.env.example`

## 🆘 Ajuda

```bash
python switch_environment.py help
```

---

**💡 Dica:** Para automatizar ainda mais, você pode criar aliases ou scripts personalizados que alternam o ambiente + reiniciam o servidor em um único comando.
