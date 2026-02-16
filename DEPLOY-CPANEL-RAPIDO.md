# 🚀 Deploy Rápido no cPanel

## ⚡ Guia Resumido (15 minutos)

### 1️⃣ No cPanel - Criar Banco (2 min)

1. **PostgreSQL Databases** (ou MySQL)
2. Criar banco: `seu_usuario_erp`
3. Criar usuário: `seu_usuario_erp_user` com senha forte
4. Adicionar usuário ao banco com ALL PRIVILEGES
5. **Anotar as credenciais**

### 2️⃣ No Seu Computador - Preparar (5 min)

```bash
# Backend - Gerar SECRET_KEY
cd backend
python generate_secret_key.py
# Copiar a chave gerada

# Editar .env
# Adicionar:
# - DATABASE_URL com credenciais do cPanel
# - SECRET_KEY gerada
# - ENVIRONMENT=production
# - ALLOWED_ORIGINS=https://seudominio.com.br

# Frontend - Build
cd ../frontend
npm install
npm run build
```

### 3️⃣ Upload dos Arquivos (3 min)

Via File Manager ou SSH:

```
Enviar:
  backend/ → /home/seu_usuario/erp-sistema/backend/
  frontend/dist/* → /home/seu_usuario/public_html/
  frontend/.htaccess.example → /home/seu_usuario/public_html/.htaccess
```

### 4️⃣ No cPanel - Configurar Python (3 min)

1. **Setup Python App**
2. Create Application:
   - Python: 3.10+
   - App Root: `erp-sistema/backend`
   - App URL: `/` ou criar subdomínio
   - Startup: `passenger_wsgi.py`
   - Entry: `application`
3. **Save**

### 5️⃣ Via SSH - Configurar Backend (2 min)

```bash
ssh seu_usuario@seudominio.com.br

cd ~/erp-sistema/backend
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar migrações
python -m alembic upgrade head
python create_initial_users.py

# Reiniciar
mkdir -p tmp
touch tmp/restart.txt
```

### 6️⃣ Testar (1 min)

- Acesse: `https://seudominio.com.br`
- Login: `admin` / `admin123`
- **ALTERE A SENHA!**

## 🔧 Comandos Úteis

```bash
# Verificar antes do deploy
python check_cpanel.py

# Ver logs
tail -f ~/erp-sistema/backend/passenger.log

# Reiniciar aplicação
touch ~/erp-sistema/backend/tmp/restart.txt

# Backup do banco
mysqldump -u usuario -p banco > backup.sql
# ou
pg_dump -U usuario banco > backup.sql
```

## ⚠️ Checklist Rápido

- [ ] Banco criado no cPanel
- [ ] .env com DATABASE_URL e SECRET_KEY corretos
- [ ] Frontend buildado
- [ ] Arquivos enviados
- [ ] Python App configurado
- [ ] .htaccess no public_html
- [ ] Migrações executadas
- [ ] SSL ativo
- [ ] Login funcionando
- [ ] Senha admin alterada

## 🆘 Problemas Comuns

**Erro 500:**
```bash
# Ver logs
tail -50 ~/erp-sistema/backend/passenger.log
tail -50 ~/public_html/error_log
```

**Database Error:**
- Verificar credenciais no .env
- Verificar se banco existe
- Testar: `python -c "from app.database import engine; engine.connect()"`

**CORS Error:**
- Verificar ALLOWED_ORIGINS no .env
- Verificar .htaccess

**Python não encontra módulos:**
```bash
cd ~/erp-sistema/backend
source venv/bin/activate
pip install -r requirements.txt
touch tmp/restart.txt
```

## 📚 Documentação Completa

Ver: `DEPLOY-CPANEL.md`

---

**Deploy rápido e simples! 🎉**
