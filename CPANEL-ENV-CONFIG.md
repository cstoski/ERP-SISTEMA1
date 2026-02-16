# Configuração .env para cPanel

## 📝 Template .env para Produção cPanel

Copie este template e preencha com suas credenciais reais:

```env
# ==============================================================================
# AMBIENTE CPANEL - PRODUÇÃO
# ==============================================================================

# Ambiente (IMPORTANTE: production para cPanel)
ENVIRONMENT=production

# ==============================================================================
# BANCO DE DADOS
# ==============================================================================

# PostgreSQL (Recomendado)
DATABASE_URL=postgresql+psycopg2://taktcont_taktsystem:XPN^Zvn[kn}btpH4@localhost/taktcont_SistemaTakt

# ==============================================================================
# SEGURANÇA
# ==============================================================================

# GERE UMA NOVA CHAVE COM: python generate_secret_key.py
# ⚠️  NUNCA use a chave padrão em produção!
SECRET_KEY=S59d8hRSdxxjzAasSvY_rzNYRnu7havUvfNo6KBjyDMzHeXwZ7u6iJjQdGzEGsMjsu8AyQpphnAX62mbWmOJ_A

ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# ==============================================================================
# CORS - ORIGENS PERMITIDAS
# ==============================================================================

# Substitua pelos seus domínios reais
ALLOWED_ORIGINS=https://taktcontrol.com.br

# Se usar subdomínio para API:
# ALLOWED_ORIGINS=https://taktcontrol.com.br,https://api.taktcontrol.com.br

# ==============================================================================
# EMAIL SMTP
# ==============================================================================

# Usar o servidor de email do cPanel
SMTP_HOST=mail.taktcontrol.com.br
SMTP_PORT=465
SMTP_USER=noreply@taktcontrol.com.br
SMTP_PASSWORD=-$Bd?-H@!pJ71fZO
SMTP_FROM_EMAIL=noreply@taktcontrol.com.br
SMTP_USE_TLS=false

# Se usar porta 587 com TLS:
# SMTP_PORT=587
# SMTP_USE_TLS=true

# ==============================================================================
# FRONTEND
# ==============================================================================

FRONTEND_URL=https://taktcontrol.com.br/erptakt

# ==============================================================================
# ARQUIVOS
# ==============================================================================

# Caminho absoluto no servidor cPanel
LOGO_PATH=/home/taktcont/public_html/erptakt/assets/images/illustrations/takt_menor.jpg
```

## 🔍 Como Obter as Credenciais do cPanel

### 1. Database URL

No cPanel:
1. Vá em **PostgreSQL Databases** (ou MySQL)
2. Seus bancos listados mostram:
   - Nome: `seu_usuario_cpanel_erp_sistema`
   - Usuário: `seu_usuario_cpanel_erp_user`
3. A senha você definiu ao criar o usuário

**Formato PostgreSQL:**
```
postgresql+psycopg2://USUARIO:SENHA@localhost/NOME_BANCO
```

**Formato MySQL:**
```
mysql+pymysql://USUARIO:SENHA@localhost/NOME_BANCO
```

**Exemplo Real:**
```env
# Se seu usuário cPanel é "joao123" e você criou:
# - Banco: joao123_erp_sistema
# - User: joao123_erp_user
# - Senha: MinhaS3nh@Fort3

DATABASE_URL=postgresql+psycopg2://joao123_erp_user:MinhaS3nh@Fort3@localhost/joao123_erp_sistema
```

### 2. SECRET_KEY

```bash
# No seu computador ou via SSH no cPanel:
cd ~/erp-sistema/backend
python generate_secret_key.py

# Exemplo de saída:
# SECRET_KEY=RCpDhJmQobnrrIa3ZakoxG-a31KxYy8PxTyg4oYrDmE...

# Copie a chave completa!
```

### 3. ALLOWED_ORIGINS

Liste todos os domínios que acessarão a API:

```env
# Apenas domínio principal
ALLOWED_ORIGINS=https://meusite.com.br

# Com www
ALLOWED_ORIGINS=https://meusite.com.br,https://www.meusite.com.br

# Com subdomínio de API
ALLOWED_ORIGINS=https://meusite.com.br,https://www.meusite.com.br,https://api.meusite.com.br
```

### 4. Email SMTP

No cPanel:
1. Crie uma conta de email em **Email Accounts**
2. Configure:
   ```env
   SMTP_HOST=mail.seudominio.com.br  # Geralmente é assim
   SMTP_PORT=465                      # SSL
   SMTP_USER=noreply@seudominio.com.br
   SMTP_PASSWORD=senha_da_conta_email
   SMTP_FROM_EMAIL=noreply@seudominio.com.br
   SMTP_USE_TLS=false                 # false para porta 465 (SSL)
   ```

**OU com porta 587 (TLS):**
```env
SMTP_PORT=587
SMTP_USE_TLS=true
```

### 5. LOGO_PATH

Caminho absoluto no servidor:

```env
# Formato geral:
LOGO_PATH=/home/SEU_USUARIO_CPANEL/public_html/caminho/para/logo.jpg

# Exemplo:
LOGO_PATH=/home/joao123/public_html/assets/images/illustrations/takt_menor.jpg
```

Para descobrir seu usuário cPanel, via SSH:
```bash
whoami
# Retorna: joao123
```

## ✅ Validação do .env

Após configurar, teste:

```bash
# Via SSH no cPanel
cd ~/erp-sistema/backend
source venv/bin/activate

# Teste 1: Verificar configurações
python -c "from app.config import settings; print('Environment:', settings.ENVIRONMENT); print('DB:', settings.DATABASE_URL[:30] + '...')"

# Teste 2: Conexão com banco
python -c "from app.database import engine; c = engine.connect(); print('✅ Conexão OK'); c.close()"

# Teste 3: Verificar ALLOWED_ORIGINS
python -c "from app.config import settings; print('Origins:', settings.get_allowed_origins())"
```

## 🆘 Problemas Comuns

### Erro: "No such file or directory: .env"

```bash
# Verificar se .env existe
ls -la ~/erp-sistema/backend/.env

# Criar se não existir
cp .env.example .env
nano .env  # Editar com suas credenciais
```

### Erro: "Access denied for user"

- Verificar se usuário foi adicionado ao banco no cPanel
- Verificar senha (usar aspas se tiver caracteres especiais)
- Exemplo com caracteres especiais:
  ```env
  DATABASE_URL=postgresql+psycopg2://user:'senh@#123'@localhost/banco
  ```

### Erro: "Connection refused"

- Banco de dados não está rodando
- Host incorreto (usar `localhost` geralmente)
- Porta incorreta (PostgreSQL: 5432, MySQL: 3306)

## 📋 Checklist Final .env

- [ ] ENVIRONMENT=production
- [ ] DATABASE_URL com credenciais corretas do cPanel
- [ ] SECRET_KEY única e segura (não a padrão!)
- [ ] ALLOWED_ORIGINS com seu domínio real
- [ ] SMTP_HOST com servidor de email do cPanel
- [ ] SMTP_USER e SMTP_PASSWORD configurados
- [ ] FRONTEND_URL com domínio HTTPS
- [ ] LOGO_PATH com caminho absoluto correto
- [ ] Testado conexão com banco (teste acima)

## 🔒 Segurança

**IMPORTANTE:**
- ✅ Use sempre HTTPS em produção (configure SSL no cPanel)
- ✅ SECRET_KEY deve ser única e nunca compartilhada
- ✅ Não faça commit do .env no git
- ✅ Use senhas fortes para banco de dados
- ✅ Altere as senhas padrão dos usuários (admin123/user123)

---

Configuração completa! 🎉
