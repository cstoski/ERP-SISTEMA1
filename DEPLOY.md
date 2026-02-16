# 🚀 Guia de Deploy para Produção - ERP Sistema TAKT

Este guia fornece instruções passo a passo para colocar o ERP Sistema TAKT em produção.

## 📋 Pré-requisitos

### Sistema Operacional
- Linux (Ubuntu 20.04+ recomendado) ou Windows Server
- Acesso root/administrador

### Software Necessário
- Python 3.10 ou superior
- PostgreSQL 13.23 ou superior
- Node.js 18+ e npm/yarn (para o frontend)
- Nginx (recomendado para proxy reverso)
- Supervisor ou systemd (para gerenciar processos)

## 🔧 Preparação do Ambiente

### 1. Configurar PostgreSQL

```bash
# Instalar PostgreSQL (Ubuntu)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Criar banco de dados
sudo -u postgres psql
CREATE DATABASE erp_sistema;
CREATE USER erp_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE erp_sistema TO erp_user;
\q
```

### 2. Clonar e Configurar o Projeto

```bash
# Clonar repositório
git clone <seu-repositorio>
cd ERP-SISTEMA

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com configurações de produção
nano .env
```

**Configurações importantes para produção:**

```env
# Ambiente
ENVIRONMENT=production

# Banco de dados
DATABASE_URL=postgresql+psycopg2://erp_user:sua_senha_segura@localhost:5432/erp_sistema

# Segurança - GERE UMA NOVA CHAVE!
SECRET_KEY=<gerar_com_generate_secret_key.py>
ACCESS_TOKEN_EXPIRE_MINUTES=480  # 8 horas

# CORS - Adicione apenas SEU domínio
ALLOWED_ORIGINS=https://erp.suaempresa.com.br

# Frontend
FRONTEND_URL=https://erp.suaempresa.com.br

# Email
SMTP_HOST=seu-servidor-smtp.com
SMTP_PORT=587
SMTP_USER=seu-email@empresa.com
SMTP_PASSWORD=sua-senha-segura
SMTP_FROM_EMAIL=noreply@empresa.com
SMTP_USE_TLS=true
```

### 4. Gerar SECRET_KEY Segura

```bash
python generate_secret_key.py
# Copie a chave gerada e adicione ao .env
```

### 5. Executar Migrações do Banco

```bash
# Aplicar todas as migrações
python -m alembic upgrade head

# Criar usuários iniciais
python create_initial_users.py
```

## 🏗️ Build do Frontend

```bash
cd ../frontend

# Instalar dependências
npm install  # ou yarn install

# Configurar variáveis de ambiente (se necessário)
# Criar arquivo .env.production com:
# VITE_API_URL=https://api.erp.suaempresa.com.br

# Build para produção
npm run build  # ou yarn build

# Arquivos compilados estarão em: frontend/dist/
```

## 🌐 Configurar Servidor Web (Nginx)

### Instalar Nginx

```bash
sudo apt install nginx
```

### Configuração do Nginx

Criar arquivo: `/etc/nginx/sites-available/erp-sistema`

```nginx
# Frontend
server {
    listen 80;
    server_name erp.suaempresa.com.br;

    root /caminho/para/ERP-SISTEMA/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend (opcional - API separada)
server {
    listen 80;
    server_name api.erp.suaempresa.com.br;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Ativar configuração

```bash
sudo ln -s /etc/nginx/sites-available/erp-sistema /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 Configurar SSL/TLS (HTTPS)

### Usando Let's Encrypt (Certbot)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d erp.suaempresa.com.br -d api.erp.suaempresa.com.br

# Renovação automática já está configurada
```

## 🔄 Gerenciar Processos do Backend

### Opção 1: Usando Supervisor

```bash
# Instalar Supervisor
sudo apt install supervisor

# Criar arquivo de configuração
sudo nano /etc/supervisor/conf.d/erp-backend.conf
```

Conteúdo do arquivo:

```ini
[program:erp-backend]
directory=/caminho/para/ERP-SISTEMA/backend
command=/caminho/para/ERP-SISTEMA/backend/venv/bin/python run_production.py
user=seu-usuario
autostart=true
autorestart=true
stderr_logfile=/var/log/erp-backend.err.log
stdout_logfile=/var/log/erp-backend.out.log
environment=PATH="/caminho/para/ERP-SISTEMA/backend/venv/bin"
```

```bash
# Recarregar supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start erp-backend

# Verificar status
sudo supervisorctl status
```

### Opção 2: Usando systemd

Criar arquivo: `/etc/systemd/system/erp-backend.service`

```ini
[Unit]
Description=ERP Sistema TAKT Backend
After=network.target postgresql.service

[Service]
Type=notify
User=seu-usuario
Group=seu-grupo
WorkingDirectory=/caminho/para/ERP-SISTEMA/backend
Environment="PATH=/caminho/para/ERP-SISTEMA/backend/venv/bin"
ExecStart=/caminho/para/ERP-SISTEMA/backend/venv/bin/python run_production.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Ativar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable erp-backend
sudo systemctl start erp-backend

# Verificar status
sudo systemctl status erp-backend

# Ver logs
sudo journalctl -u erp-backend -f
```

## 📊 Monitoramento e Logs

### Logs do Backend
```bash
# Com Supervisor
sudo tail -f /var/log/erp-backend.out.log
sudo tail -f /var/log/erp-backend.err.log

# Com systemd
sudo journalctl -u erp-backend -f
```

### Logs do Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔒 Checklist de Segurança

- [ ] SECRET_KEY única e segura (gerada com `generate_secret_key.py`)
- [ ] Banco de dados com senha forte
- [ ] CORS configurado apenas para domínios específicos
- [ ] HTTPS habilitado (SSL/TLS)
- [ ] Documentação da API desabilitada em produção
- [ ] Firewall configurado (apenas portas 80, 443, 22)
- [ ] Backup automático do banco de dados
- [ ] Senhas dos usuários alteradas (padrão: admin123/user123)
- [ ] Variáveis de ambiente em .env (não no código)
- [ ] Logs sendo monitorados

## 🔄 Backup do Banco de Dados

### Script de Backup Automático

```bash
#!/bin/bash
# /home/usuario/scripts/backup-db.sh

BACKUP_DIR="/home/usuario/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="erp_sistema"
DB_USER="erp_user"

mkdir -p $BACKUP_DIR
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/erp_backup_$DATE.sql.gz

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "erp_backup_*.sql.gz" -mtime +30 -delete
```

### Agendar com Cron

```bash
# Editar crontab
crontab -e

# Adicionar backup diário às 2h da manhã
0 2 * * * /home/usuario/scripts/backup-db.sh
```

## 🚀 Atualizações

### Atualizar a Aplicação

```bash
# 1. Atualizar código
git pull origin main

# 2. Ativar ambiente virtual (backend)
cd backend
source venv/bin/activate

# 3. Atualizar dependências
pip install -r requirements.txt

# 4. Executar migrações
python -m alembic upgrade head

# 5. Rebuild frontend
cd ../frontend
npm install
npm run build

# 6. Reiniciar backend
sudo supervisorctl restart erp-backend
# ou
sudo systemctl restart erp-backend

# 7. Recarregar Nginx
sudo systemctl reload nginx
```

## 📞 Suporte e Troubleshooting

### Problemas Comuns

**Erro de conexão com banco de dados:**
- Verificar se PostgreSQL está rodando: `sudo systemctl status postgresql`
- Verificar credenciais no .env
- Testar conexão: `psql -U erp_user -d erp_sistema`

**Backend não inicia:**
- Verificar logs: `sudo journalctl -u erp-backend -n 50`
- Verificar se porta 8000 está livre: `sudo lsof -i :8000`
- Verificar permissões do diretório

**Erro 502 Bad Gateway:**
- Verificar se backend está rodando: `sudo systemctl status erp-backend`
- Verificar configuração do Nginx: `sudo nginx -t`
- Verificar logs do Nginx: `sudo tail -f /var/log/nginx/error.log`

## 📝 Notas Finais

- **Sempre teste em ambiente de staging antes de produção**
- **Mantenha backups regulares**
- **Monitore logs e desempenho**
- **Mantenha o sistema e dependências atualizadas**
- **Documente todas as mudanças específicas do seu ambiente**

---

**Desenvolvido para TAKT Control** 🔧
