# 🪟 Deploy em Windows Server

Guia para colocar o ERP Sistema TAKT em produção em Windows Server.

## 📋 Pré-requisitos

- Windows Server 2019 ou superior
- Python 3.10+ instalado
- PostgreSQL 13.23+ instalado
- Node.js 18+ instalado
- IIS (Internet Information Services) ou Nginx para Windows

## 🔧 Configuração do PostgreSQL

```powershell
# Após instalar PostgreSQL, abra o pgAdmin ou psql
# Criar banco de dados e usuário

CREATE DATABASE erp_sistema;
CREATE USER erp_user WITH PASSWORD 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON DATABASE erp_sistema TO erp_user;
```

## 🚀 Configuração da Aplicação

### 1. Preparar Backend

```powershell
cd D:\Apps\ERP-SISTEMA\backend

# Criar ambiente virtual
python -m venv venv
.\venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Gerar SECRET_KEY
python generate_secret_key.py
# Copiar a chave gerada
```

### 2. Configurar .env

Editar `backend\.env`:

```env
ENVIRONMENT=production
DATABASE_URL=postgresql+psycopg2://erp_user:senha_segura@localhost:5432/erp_sistema
SECRET_KEY=<chave_gerada_anteriormente>
ALLOWED_ORIGINS=https://erp.suaempresa.com.br
FRONTEND_URL=https://erp.suaempresa.com.br

# Configurações de email
SMTP_HOST=seu-servidor-smtp
SMTP_PORT=587
SMTP_USER=seu-email@empresa.com
SMTP_PASSWORD=sua-senha
SMTP_FROM_EMAIL=noreply@empresa.com
SMTP_USE_TLS=true

# Caminho do logo (Windows)
LOGO_PATH=D:\Apps\ERP-SISTEMA\frontend\public\assets\images\illustrations\takt_menor.jpg
```

### 3. Executar Migrações

```powershell
python -m alembic upgrade head
python create_initial_users.py
```

### 4. Build do Frontend

```powershell
cd ..\frontend
npm install
npm run build
```

## 🌐 Configuração do IIS

### 1. Instalar Componentes do IIS

```powershell
# Executar como Administrador
Install-WindowsFeature -name Web-Server -IncludeManagementTools
Install-WindowsFeature -name Web-Static-Content
Install-WindowsFeature -name Web-Http-Redirect
Install-WindowsFeature -name Web-Url-Rewrite
```

### 2. Instalar URL Rewrite Module

Baixar e instalar: https://www.iis.net/downloads/microsoft/url-rewrite

### 3. Configurar Site no IIS

1. Abrir IIS Manager
2. Criar novo site:
   - Nome: ERP-Sistema-Frontend
   - Caminho físico: `D:\Apps\ERP-SISTEMA\frontend\dist`
   - Binding: 
     - Tipo: https
     - Porta: 443
     - Host: erp.suaempresa.com.br

3. Configurar URL Rewrite para SPA:

Criar arquivo `web.config` em `frontend\dist\`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
        <rule name="ReverseProxyInboundRule1" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:8000/api/{R:1}" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
```

## 🔧 Configurar Backend como Serviço Windows

### Opção 1: Usando NSSM (Recomendado)

1. Baixar NSSM: https://nssm.cc/download

```powershell
# Instalar serviço
nssm install ERPBackend "D:\Apps\ERP-SISTEMA\backend\venv\Scripts\python.exe" "D:\Apps\ERP-SISTEMA\backend\run_production.py"

# Configurar diretório de trabalho
nssm set ERPBackend AppDirectory "D:\Apps\ERP-SISTEMA\backend"

# Configurar log
nssm set ERPBackend AppStdout "D:\Apps\ERP-SISTEMA\logs\backend-output.log"
nssm set ERPBackend AppStderr "D:\Apps\ERP-SISTEMA\logs\backend-error.log"

# Iniciar serviço
nssm start ERPBackend
```

### Opção 2: Usando Task Scheduler

1. Abrir Task Scheduler
2. Criar nova tarefa:
   - Nome: ERP Backend
   - Executar com privilégios mais altos
   - Configurar para: Windows Server 2019
   - Trigger: Ao iniciar
   - Ação: 
     - Programa: `D:\Apps\ERP-SISTEMA\backend\venv\Scripts\python.exe`
     - Argumentos: `run_production.py`
     - Iniciar em: `D:\Apps\ERP-SISTEMA\backend`

## 🔒 Configurar SSL/TLS

### 1. Obter Certificado SSL

- Certificado comercial (Comodo, DigiCert, etc.)
- Let's Encrypt (usando win-acme): https://www.win-acme.com/

### 2. Instalar Certificado no IIS

1. IIS Manager → Server Certificates
2. Complete Certificate Request
3. Selecionar arquivo .cer
4. Binding do site → Adicionar HTTPS com certificado

## 📊 Monitoramento

### Ver status do serviço:
```powershell
# Com NSSM
nssm status ERPBackend

# Ver logs
Get-Content D:\Apps\ERP-SISTEMA\logs\backend-output.log -Tail 50 -Wait
```

### Verificar aplicação:
```powershell
# Testar conexão com API
curl http://localhost:8000/api/auth/health
```

## 🔄 Firewall Windows

```powershell
# Permitir porta 8000 (backend)
New-NetFirewallRule -DisplayName "ERP Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow

# Permitir HTTP/HTTPS
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

## 💾 Backup Automático

### Script PowerShell de Backup

Criar arquivo `D:\Apps\ERP-SISTEMA\scripts\backup-database.ps1`:

```powershell
$BackupDir = "D:\Backups\ERP"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "$BackupDir\erp_backup_$Date.sql"

# Criar diretório se não existir
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir
}

# Executar backup
& "C:\Program Files\PostgreSQL\13\bin\pg_dump.exe" -U erp_user -d erp_sistema -f $BackupFile

# Comprimir
Compress-Archive -Path $BackupFile -DestinationPath "$BackupFile.zip"
Remove-Item $BackupFile

# Remover backups com mais de 30 dias
Get-ChildItem $BackupDir -Filter "*.zip" | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} | Remove-Item
```

### Agendar Backup

1. Task Scheduler → Create Task
2. Trigger: Daily às 2:00 AM
3. Action: PowerShell script acima

## 🔄 Atualização da Aplicação

```powershell
# 1. Parar serviço
nssm stop ERPBackend

# 2. Atualizar código (git pull ou copiar arquivos)

# 3. Ativar ambiente virtual
cd D:\Apps\ERP-SISTEMA\backend
.\venv\Scripts\activate

# 4. Atualizar dependências
pip install -r requirements.txt

# 5. Executar migrações
python -m alembic upgrade head

# 6. Build frontend
cd ..\frontend
npm install
npm run build

# 7. Reiniciar serviço
nssm start ERPBackend
```

## 🆘 Troubleshooting

### Backend não inicia
```powershell
# Verificar logs
Get-Content D:\Apps\ERP-SISTEMA\logs\backend-error.log -Tail 50

# Testar manualmente
cd D:\Apps\ERP-SISTEMA\backend
.\venv\Scripts\activate
python run_production.py
```

### Erro 502 no IIS
- Verificar se backend está rodando: `nssm status ERPBackend`
- Verificar URL Rewrite está instalado
- Verificar web.config

### Problemas de permissão
```powershell
# Dar permissões ao IIS
icacls "D:\Apps\ERP-SISTEMA\frontend\dist" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

## 📝 Checklist Final

- [ ] PostgreSQL instalado e configurado
- [ ] SECRET_KEY única gerada
- [ ] .env configurado para produção
- [ ] Migrações executadas
- [ ] Usuários iniciais criados
- [ ] Frontend buildado
- [ ] IIS configurado com URL Rewrite
- [ ] Backend rodando como serviço
- [ ] SSL/TLS configurado
- [ ] Firewall configurado
- [ ] Backup automático agendado
- [ ] Senhas padrão alteradas

---

**Para suporte técnico**: support@taktcontrol.com.br
