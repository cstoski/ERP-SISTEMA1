# 🚀 Colocando em Produção - Guia Rápido

## ⚡ Passos Rápidos para Produção

### 1. Gerar SECRET_KEY Segura

```bash
cd backend
python generate_secret_key.py
```

Copie a chave gerada e adicione ao arquivo `.env`:

```env
SECRET_KEY=<cole_a_chave_aqui>
```

### 2. Configurar Ambiente de Produção

Edite o arquivo `backend/.env`:

```env
# Altere para production
ENVIRONMENT=production

# Configure as origens permitidas (substitua pelo seu domínio)
ALLOWED_ORIGINS=https://erp.suaempresa.com.br,https://www.suaempresa.com.br

# Configure a URL do frontend (substitua pelo seu domínio)
FRONTEND_URL=https://erp.suaempresa.com.br
```

### 3. Executar Checklist de Produção

```bash
python check_production.py
```

Corrija todos os problemas críticos antes de continuar.

### 4. Build do Frontend

```bash
cd ../frontend
npm install
npm run build
```

Os arquivos compilados estarão em `frontend/dist/`

### 5. Iniciar Backend em Produção

```bash
cd backend
python run_production.py
```

## 📦 O que foi preparado para você:

### ✅ Configurações de Segurança
- ✓ CORS configurável por variável de ambiente
- ✓ SECRET_KEY única e segura
- ✓ Documentação da API desabilitada em produção
- ✓ Variáveis de ambiente separadas por ambiente

### ✅ Scripts Úteis
- `generate_secret_key.py` - Gera SECRET_KEY segura
- `check_production.py` - Valida configurações de produção
- `run_production.py` - Inicia servidor em modo produção (4 workers)
- `run_server.py` - Inicia servidor em modo desenvolvimento
- `create_initial_users.py` - Cria usuários iniciais

### ✅ Arquivos de Configuração
- `.env.example` - Modelo completo de configuração
- `DEPLOY.md` - Guia completo de deploy em servidor
- `.env` - Suas configurações atuais (atualizar para produção)

## 🔒 Checklist de Segurança Antes de Produção

- [ ] SECRET_KEY única gerada e configurada
- [ ] ENVIRONMENT=production no .env
- [ ] ALLOWED_ORIGINS com apenas domínios específicos
- [ ] Senha do banco de dados forte e segura
- [ ] Usuários admin/user com senhas alteradas (padrão: admin123/user123)
- [ ] HTTPS configurado (Certbot/Let's Encrypt)
- [ ] Firewall configurado
- [ ] Backup automático do banco configurado

## 📊 Monitoramento

### Ver logs do servidor:
```bash
# Durante execução (modo desenvolvimento)
python run_server.py

# Em produção (com supervisor)
sudo supervisorctl status erp-backend
sudo tail -f /var/log/erp-backend.out.log
```

### Verificar banco de dados:
```bash
python -c "from app.database import engine; from sqlalchemy import inspect; inspector = inspect(engine); print('Tabelas:', inspector.get_table_names())"
```

## 🆘 Ajuda Adicional

- **Guia Completo de Deploy**: Ver arquivo `DEPLOY.md`
- **Problemas de Configuração**: Executar `python check_production.py`
- **Atualizar Aplicação**: Ver seção "Atualizações" em `DEPLOY.md`

## 🔄 Workflow Recomendado

```
Desenvolvimento  →  Staging/Testes  →  Produção
    (local)           (servidor)       (servidor)
```

1. Desenvolva localmente com `ENVIRONMENT=development`
2. Teste em staging com `ENVIRONMENT=production`
3. Deploy em produção após validação completa

## ⚠️ IMPORTANTE

**ANTES de colocar em produção:**
1. Execute `python check_production.py` e corrija todos os problemas
2. Faça backup completo do banco de dados
3. Teste todas as funcionalidades em ambiente de staging
4. Configure HTTPS (obrigatório para produção)
5. Monitore logs nas primeiras horas após deploy

---

**Suporte**: support@taktcontrol.com.br
