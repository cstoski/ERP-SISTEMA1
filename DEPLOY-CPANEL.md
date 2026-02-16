# 🌐 Deploy no cPanel - ERP Sistema TAKT

Guia passo a passo para fazer deploy do ERP Sistema TAKT em hospedagem com cPanel.

## 📋 Pré-requisitos

### Verificar no seu cPanel:
- ✅ Python 3.10+ disponível (Setup Python App ou Passenger)
- ✅ PostgreSQL ou MySQL disponível
- ✅ Acesso SSH (opcional, mas recomendado)
- ✅ Node.js/npm instalado (para build do frontend)

## 🗄️ Passo 1: Configurar Banco de Dados

### 1.1 Criar Banco de Dados

1. Acesse **cPanel → MySQL Databases** ou **PostgreSQL Databases**
2. Crie um novo banco:
   - Nome: `seu_usuario_erp_sistema`
   - Usuário: `seu_usuario_erp_user`
   - Senha: Gere uma senha forte
3. Adicione o usuário ao banco com **ALL PRIVILEGES**
4. Anote as credenciais:
   ```
   Host: localhost (ou conforme informado pelo cPanel)
   Database: seu_usuario_erp_sistema
   Username: seu_usuario_erp_user
   Password: sua_senha_gerada
   ```

### 1.2 Configurar Acesso Remoto (se necessário)

Em **Remote Database Access**, adicione `%` ou o IP do servidor se for acessar remotamente.

## 📁 Passo 2: Upload dos Arquivos

### Opção A: Via File Manager (cPanel)

1. Acesse **cPanel → File Manager**
2. Navegue até o diretório raiz da sua conta (geralmente `/home/seu_usuario/`)
3. Crie a estrutura:
   ```
   /home/seu_usuario/
   ├── erp-sistema/          # Backend (aplicação Python)
   └── public_html/          # Frontend (arquivos estáticos)
   ```

4. Faça upload dos arquivos:
   - Upload do `backend/` para `/home/seu_usuario/erp-sistema/`
   - Upload do `frontend/dist/` (após build) para `/home/seu_usuario/public_html/`

### Opção B: Via SSH (Recomendado)

```bash
# Conectar via SSH
ssh seu_usuario@seu_dominio.com.br

# Criar diretórios
mkdir -p erp-sistema
cd erp-sistema

# Upload via scp ou git
git clone <seu-repositorio> .
# ou use scp do seu computador local
```

## 🐍 Passo 3: Configurar Python App

### 3.1 Preparar Backend

Via SSH ou Terminal do cPanel:

```bash
cd ~/erp-sistema/backend

# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Atualizar pip
pip install --upgrade pip

# Instalar dependências
pip install -r requirements.txt
```

### 3.2 Configurar .env

Criar/editar `~/erp-sistema/backend/.env`:

```env
# Ambiente
ENVIRONMENT=production

# Banco de Dados
# PostgreSQL
DATABASE_URL=postgresql+psycopg2://seu_usuario_erp_user:sua_senha@localhost/seu_usuario_erp_sistema

# MySQL (se usar MySQL ao invés de PostgreSQL)
# DATABASE_URL=mysql+pymysql://seu_usuario_erp_user:sua_senha@localhost/seu_usuario_erp_sistema

# Segurança - Gerar com: python generate_secret_key.py
SECRET_KEY=sua_chave_secreta_gerada_aqui

# CORS - Seu domínio
ALLOWED_ORIGINS=https://seu_dominio.com.br,https://www.seu_dominio.com.br

# Frontend URL
FRONTEND_URL=https://seu_dominio.com.br

# Email SMTP
SMTP_HOST=mail.seu_dominio.com.br
SMTP_PORT=465
SMTP_USER=noreply@seu_dominio.com.br
SMTP_PASSWORD=sua_senha_email
SMTP_FROM_EMAIL=noreply@seu_dominio.com.br
SMTP_USE_TLS=false

# Logo
LOGO_PATH=/home/seu_usuario/public_html/assets/images/illustrations/takt_menor.jpg
```

### 3.3 Gerar SECRET_KEY

```bash
cd ~/erp-sistema/backend
source venv/bin/activate
python generate_secret_key.py
# Copiar a chave gerada e adicionar ao .env
```

### 3.4 Executar Migrações

```bash
cd ~/erp-sistema/backend
source venv/bin/activate
python -m alembic upgrade head
python create_initial_users.py
```

## 🚀 Passo 4: Configurar Python App no cPanel

### Método 1: Setup Python App (mais comum)

1. Acesse **cPanel → Setup Python App**
2. Clique em **Create Application**
3. Configurar:
   - **Python version**: 3.10 ou superior
   - **Application Root**: `erp-sistema/backend`
   - **Application URL**: `/api` ou criar subdomínio `api.seu_dominio.com.br`
   - **Application startup file**: `passenger_wsgi.py`
   - **Application Entry point**: `app`
   - **Passenger log file**: (deixar padrão)

4. Clique em **Create**

### 4.1 Criar arquivo passenger_wsgi.py

Criar arquivo `~/erp-sistema/backend/passenger_wsgi.py`:

```python
import sys
import os

# Adicionar o diretório ao path
sys.path.insert(0, os.path.dirname(__file__))

# Ativar ambiente virtual
VENV_PATH = os.path.join(os.path.dirname(__file__), 'venv')
activate_this = os.path.join(VENV_PATH, 'bin', 'activate_this.py')

# Para Python 3.10+
if os.path.exists(activate_this):
    exec(open(activate_this).read(), {'__file__': activate_this})
else:
    # Alternativa para versões mais recentes
    import site
    site.addsitedir(os.path.join(VENV_PATH, 'lib', 
                    f'python{sys.version_info.major}.{sys.version_info.minor}', 
                    'site-packages'))

# Carregar variáveis de ambiente
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Importar aplicação FastAPI
from app.main import app

# Wrapper WSGI para FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware

# Exportar aplicação
application = app
```

### 4.2 Instalar dependência adicional

```bash
cd ~/erp-sistema/backend
source venv/bin/activate
pip install a2wsgi
```

Atualizar `passenger_wsgi.py`:

```python
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

VENV_PATH = os.path.join(os.path.dirname(__file__), 'venv')
import site
site.addsitedir(os.path.join(VENV_PATH, 'lib', 
                f'python{sys.version_info.major}.{sys.version_info.minor}', 
                'site-packages'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from app.main import app
from a2wsgi import ASGIMiddleware

application = ASGIMiddleware(app)
```

### 4.3 Adicionar a2wsgi ao requirements.txt

```bash
echo "a2wsgi" >> requirements.txt
pip install a2wsgi
```

## 🌍 Passo 5: Configurar Frontend

### 5.1 Build Local (no seu computador)

```bash
cd frontend

# Configurar variável de ambiente (opcional)
# Criar arquivo .env.production
echo "VITE_API_URL=/api" > .env.production

# Build
npm install
npm run build
```

### 5.2 Upload do Build

Upload dos arquivos de `frontend/dist/` para `/home/seu_usuario/public_html/`

Estrutura final:
```
/home/seu_usuario/public_html/
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   ├── index-xxxxx.css
│   └── images/
├── .htaccess (criar este arquivo)
└── ...outros arquivos do build
```

### 5.3 Configurar .htaccess para SPA

Criar/editar `/home/seu_usuario/public_html/.htaccess`:

```apache
# Habilitar Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Proxy reverso para API
  RewriteRule ^api/(.*)$ https://seu_dominio.com.br:8000/api/$1 [P,L]
  
  # OU se configurou Python App no subdomínio:
  # RewriteRule ^api/(.*)$ https://api.seu_dominio.com.br/$1 [P,L]
  
  # Single Page Application - redirecionar tudo para index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api
  RewriteRule . /index.html [L]
</IfModule>

# Segurança
<Files .env>
  Order allow,deny
  Deny from all
</Files>

# Compressão GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache do navegador
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
```

## 🔄 Passo 6: Reiniciar Aplicação

### No cPanel → Setup Python App:
1. Encontre sua aplicação
2. Clique em **Restart**

### Via SSH:
```bash
# Criar arquivo tmp/restart.txt para forçar restart do Passenger
mkdir -p ~/erp-sistema/backend/tmp
touch ~/erp-sistema/backend/tmp/restart.txt
```

## 🔒 Passo 7: Configurar SSL/TLS

### Via cPanel:
1. Acesse **cPanel → SSL/TLS Status**
2. Marque seu domínio
3. Clique em **Run AutoSSL** (se disponível)

**OU**

1. **cPanel → SSL/TLS**
2. **Manage SSL Sites**
3. Instalar certificado Let's Encrypt (se disponível)

## ✅ Passo 8: Verificar Funcionamento

### Testar Backend:
```bash
curl https://seu_dominio.com.br/api/
# ou
curl https://api.seu_dominio.com.br/
```

### Testar Frontend:
Acesse https://seu_dominio.com.br no navegador

### Fazer Login:
- Username: `admin`
- Password: `admin123` (⚠️ ALTERE IMEDIATAMENTE!)

## 🔧 Troubleshooting cPanel

### Erro 500 - Internal Server Error

1. **Verificar logs:**
   ```bash
   # Via SSH
   tail -f ~/erp-sistema/backend/logs/error.log
   tail -f ~/erp-sistema/backend/passenger.log
   ```

2. **Verificar passenger_wsgi.py:**
   - Caminho do venv correto
   - Imports funcionando

3. **Testar manualmente:**
   ```bash
   cd ~/erp-sistema/backend
   source venv/bin/activate
   python -c "from app.main import app; print('OK')"
   ```

### Erro de Database Connection

1. **Verificar credenciais no .env**
2. **Testar conexão:**
   ```bash
   python -c "from app.config import settings; print(settings.DATABASE_URL)"
   python -c "from app.database import engine; connection = engine.connect(); print('Conexão OK')"
   ```

### Módulos Python não encontrados

```bash
cd ~/erp-sistema/backend
source venv/bin/activate
pip install -r requirements.txt --force-reinstall
touch tmp/restart.txt
```

### CORS Error

1. Verificar `ALLOWED_ORIGINS` no `.env`
2. Verificar que o frontend está usando o domínio correto

## 📊 Monitoramento

### Ver logs em tempo real:
```bash
tail -f ~/erp-sistema/backend/passenger.log
tail -f ~/public_html/error_log
```

### Verificar uso de recursos:
- **cPanel → CPU and Concurrent Connection Usage**
- **cPanel → Resource Usage**

## 🔄 Atualização da Aplicação

```bash
# Via SSH
cd ~/erp-sistema/backend
source venv/bin/activate

# Fazer backup do banco
mysqldump -u seu_usuario_erp_user -p seu_usuario_erp_sistema > backup_$(date +%Y%m%d).sql

# Atualizar código (git ou upload manual)
git pull origin main

# Atualizar dependências
pip install -r requirements.txt

# Executar migrações
python -m alembic upgrade head

# Build frontend (local) e fazer upload do dist/

# Reiniciar aplicação
touch tmp/restart.txt
```

## 📝 Checklist Final

- [ ] Banco de dados criado no cPanel
- [ ] .env configurado com credenciais corretas
- [ ] SECRET_KEY gerada e configurada
- [ ] Migrações executadas
- [ ] Usuários iniciais criados
- [ ] passenger_wsgi.py criado e configurado
- [ ] Python App configurado no cPanel
- [ ] Frontend buildado e upload feito
- [ ] .htaccess configurado
- [ ] SSL/TLS ativo
- [ ] CORS configurado corretamente
- [ ] Teste de login funcionando
- [ ] Senhas padrão alteradas

## 💡 Dicas cPanel

1. **Aumentar limites de PHP** (se usar PHP para algo):
   - cPanel → MultiPHP INI Editor

2. **Gerenciar Cron Jobs** (para backups automáticos):
   - cPanel → Cron Jobs

3. **Monitorar uso de recursos**:
   - cPanel → Resource Usage

4. **Backup regular**:
   - cPanel → Backup Wizard

## ⚠️ Limitações do cPanel

- Número de processos Python limitado
- Recursos compartilhados (CPU/RAM)
- Não tem acesso root
- Passenger pode ter limitações de performance

**Para alta performance, considere VPS ou Cloud Server.**

## 🆘 Suporte

- Email: support@taktcontrol.com.br
- Documentação cPanel: https://docs.cpanel.net/

---

**Boa sorte com seu deploy! 🚀**
