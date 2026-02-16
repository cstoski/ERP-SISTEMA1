# 📁 Integração com OneDrive

Este documento descreve como configurar e usar a integração com OneDrive para armazenamento automático de arquivos de projetos.

## 🎯 Funcionalidades

Quando a integração está habilitada, o sistema automaticamente:

- ✅ Cria uma estrutura de pastas no OneDrive ao criar um novo projeto
- ✅ Organiza documentos em categorias predefinidas
- ✅ Gera um arquivo README.txt com informações do projeto

## 📂 Estrutura de Pastas Criada

Para cada projeto novo, a seguinte estrutura hierárquica é criada:

```text
ERP_PROJETOS/
└── 0001_Nome_do_Projeto/
    ├── README.txt
    ├── 01-PROPOSTA/
    │   ├── 1.1-INFO_CLIENTE
    │   ├── 1.2-FOTOS
    │   ├── 1.3-DOCUMENTOS
    │   └── 1.4-ORÇAMENTOS
    ├── 02-DESENVOLVIMENTO/
    │   ├── 2.1-INFO_CLIENTE
    │   ├── 2.2-DOCUMENTOS/
    │   │   ├── 2.2.1-DESCRITIVOS
    │   │   ├── 2.2.2-LISTA_MATERIAIS
    │   │   ├── 2.2.3-MANUAIS_EQUIPAMENTOS
    │   │   ├── 2.2.4-FLUXOGRAMAS
    │   │   └── 2.2.5-MANUAIS_PROJETO
    │   ├── 2.3-PROJETO_ELETRICO/
    │   │   ├── 2.3.1-DIAGRAMA
    │   │   ├── 2.3.2-LAYOUT
    │   │   └── 2.3.3-MEMORIA_CALCULO
    │   ├── 2.4-PROJETO_MECANICO
    │   ├── 2.5-CLP
    │   ├── 2.6-IHM
    │   ├── 2.7-SUPERVISORIO
    │   ├── 2.8-FOTOS
    │   ├── 2.9-COMUNICACAO
    │   └── 2.10-SOFTWARES
    └── 03-GESTAO/
        ├── 3.1-PEDIDO_COMPRA
        ├── 3.2-CRONOGRAMA
        ├── 3.3-DESPESAS/
        │   ├── 3.3.1-ORÇAMENTOS
        │   ├── 3.3.2-PEDIDOS_COMPRA
        │   └── 3.3.3-NOTAS_FISCAIS
        └── 3.4-NOTAS_FATURAMENTO
```

### Descrição das Pastas

#### 📋 01-PROPOSTA
Documentação comercial e orçamentos:
- **1.1-INFO_CLIENTE** - Informações e dados do cliente
- **1.2-FOTOS** - Fotos e imagens relacionadas à proposta
- **1.3-DOCUMENTOS** - Documentos da proposta comercial
- **1.4-ORÇAMENTOS** - Orçamentos e cotações enviadas

#### 🔧 02-DESENVOLVIMENTO
Desenvolvimento técnico completo do projeto:
- **2.1-INFO_CLIENTE** - Informações técnicas fornecidas pelo cliente
- **2.2-DOCUMENTOS** - Documentação técnica:
  - 2.2.1-DESCRITIVOS - Descritivos técnicos
  - 2.2.2-LISTA_MATERIAIS - Listas de materiais (BOM)
  - 2.2.3-MANUAIS_EQUIPAMENTOS - Manuais de equipamentos
  - 2.2.4-FLUXOGRAMAS - Fluxogramas de processo
  - 2.2.5-MANUAIS_PROJETO - Manuais do projeto
- **2.3-PROJETO_ELETRICO** - Projeto elétrico:
  - 2.3.1-DIAGRAMA - Diagramas elétricos
  - 2.3.2-LAYOUT - Layouts elétricos
  - 2.3.3-MEMORIA_CALCULO - Memórias de cálculo
- **2.4-PROJETO_MECANICO** - Projeto mecânico e desenhos
- **2.5-CLP** - Programação de CLP/PLC
- **2.6-IHM** - Interface Homem-Máquina
- **2.7-SUPERVISORIO** - Sistema supervisório/SCADA
- **2.8-FOTOS** - Fotos do desenvolvimento e execução
- **2.9-COMUNICACAO** - Protocolos de comunicação
- **2.10-SOFTWARES** - Softwares, drivers e programas

#### 📊 03-GESTAO
Gestão e controle administrativo do projeto:
- **3.1-PEDIDO_COMPRA** - Pedidos de compra gerais
- **3.2-CRONOGRAMA** - Cronogramas e planejamentos
- **3.3-DESPESAS** - Controle de despesas:
  - 3.3.1-ORÇAMENTOS - Orçamentos de fornecedores
  - 3.3.2-PEDIDOS_COMPRA - Pedidos de compra de despesas
  - 3.3.3-NOTAS_FISCAIS - Notas fiscais de despesas
- **3.4-NOTAS_FATURAMENTO** - Notas fiscais de faturamento
```

## ⚙️ Configuração no Azure

### Passo 1: Criar App Registration

1. Acesse o [Azure Portal](https://portal.azure.com)
2. Navegue para **Azure Active Directory** > **App registrations**
3. Clique em **New registration**
4. Preencha:
   - **Name**: ERP Sistema TAKT
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Deixe em branco (não necessário para app backend)
5. Clique em **Register**

### Passo 2: Configurar Permissões

1. No app criado, vá em **API permissions**
2. Clique em **Add a permission**
3. Selecione **Microsoft Graph**
4. Escolha **Application permissions**
5. Adicione a permissão: **Files.ReadWrite.All**
6. Clique em **Add permissions**
7. **IMPORTANTE**: Clique em **Grant admin consent** (requer permissão de admin)

### Passo 3: Criar Client Secret

1. Vá em **Certificates & secrets**
2. Clique em **New client secret**
3. Preencha:
   - **Description**: ERP Backend Secret
   - **Expires**: 24 months (recomendado)
4. Clique em **Add**
5. **COPIE O SECRET IMEDIATAMENTE** (só aparece uma vez!)

### Passo 4: Obter Credenciais

Você precisará de 3 valores:

1. **Application (client) ID**: Na página **Overview** do app
2. **Directory (tenant) ID**: Na página **Overview** do app
3. **Client Secret**: O valor copiado no passo anterior

## 🔧 Configuração no Backend

### 1. Instalar Dependências

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` e adicione:

```env
# OneDrive Integration
ONEDRIVE_ENABLED=true
ONEDRIVE_CLIENT_ID=seu_application_client_id
ONEDRIVE_CLIENT_SECRET=seu_client_secret
ONEDRIVE_TENANT_ID=seu_directory_tenant_id
ONEDRIVE_ROOT_FOLDER=ERP_PROJETOS
```

### 3. Reiniciar o Servidor

```bash
uvicorn app.main:app --reload
```

## 📝 Uso

A integração funciona automaticamente:

1. Quando você cria um novo projeto pelo frontend
2. O sistema salva o projeto no banco de dados
3. Em seguida, cria a estrutura de pastas no OneDrive
4. Se houver erro no OneDrive, o projeto ainda é criado (apenas um aviso é logado)

## 🧪 Testando a Integração

### Teste Manual via API

```bash
curl -X POST "http://localhost:8000/api/projetos/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Projeto Teste OneDrive",
    "cliente_id": 1,
    "status": "Orcando",
    "valor_venda": 10000.00
  }'
```

### Verificar Logs

```bash
# Verificar se as pastas foram criadas
# Você verá mensagens como:
# INFO: Pasta criada com sucesso: ERP_PROJETOS/0001_Projeto_Teste_OneDrive
```

### Verificar no OneDrive

1. Acesse [OneDrive](https://onedrive.live.com)
2. Navegue para a pasta `ERP_PROJETOS`
3. Você deve ver a estrutura criada

## 🔒 Segurança

### Boas Práticas

- ✅ Nunca commite o arquivo `.env` no Git
- ✅ Use secrets diferentes para dev/prod
- ✅ Renove os secrets periodicamente
- ✅ Use permissões mínimas necessárias
- ✅ Monitore logs de acesso no Azure

### Permissões Necessárias

- **Files.ReadWrite.All**: Permite ler/escrever em qualquer pasta do OneDrive

### Conta Utilizada

A integração usa **Application Permissions**, ou seja:

- Acessa o OneDrive da **conta organizacional** (não de usuário específico)
- Requer consentimento de administrador
- Funciona 24/7 sem interação do usuário

## 🐛 Troubleshooting

### Erro: "Invalid client secret"

- Verifique se o secret foi copiado corretamente (sem espaços)
- Secrets expiram! Verifique a validade no Azure Portal

### Erro: "Insufficient privileges"

- Certifique-se de ter concedido **admin consent** no Azure Portal
- Verifique se a permissão **Files.ReadWrite.All** está ativa

### Erro: "Invalid tenant"

- Verifique o **Directory (tenant) ID** no Azure Portal
- Use o tenant ID da organização (não o tenant pessoal)

### Pastas não sendo criadas

1. Verifique se `ONEDRIVE_ENABLED=true` no `.env`
2. Verifique os logs do backend para mensagens de erro
3. Teste a autenticação manualmente

### Token expirado

- O sistema renova tokens automaticamente
- Se persistir, recrie o client secret no Azure Portal

## 📊 Monitoramento

### Logs do Sistema

O serviço OneDrive gera logs em:

- `INFO`: Operações bem-sucedidas
- `WARNING`: OneDrive desabilitado ou configuração incompleta
- `ERROR`: Falhas em operações

### Métricas

Você pode monitorar no Azure Portal:

- **App registrations** > Seu app > **Overview**
- Número de chamadas à API
- Erros de autenticação
- Uso de storage

## 🚀 Próximos Passos

Funcionalidades futuras planejadas:

- [ ] Upload de arquivos via frontend
- [ ] Download de documentos
- [ ] Compartilhamento de pastas com clientes
- [ ] Sincronização bidirecional
- [ ] Versionamento de arquivos
- [ ] Backup automático do banco de dados

## 📚 Referências

- [Microsoft Graph API Documentation](https://docs.microsoft.com/graph/api/overview)
- [OneDrive API Reference](https://docs.microsoft.com/graph/api/resources/onedrive)
- [Azure App Registration Guide](https://docs.microsoft.com/azure/active-directory/develop/quickstart-register-app)
- [MSAL Python Library](https://github.com/AzureAD/microsoft-authentication-library-for-python)

## 💡 Dicas

1. **Desenvolvimento Local**: Use `ONEDRIVE_ENABLED=false` para desenvolvimento sem OneDrive
2. **Testes**: Crie um tenant de teste no Azure para não afetar produção
3. **Naming**: Use nomes descritivos para as pastas dos projetos (já tratado automaticamente)
4. **Cleanup**: Periodicamente, revise e archive projetos antigos no OneDrive
5. **Backup**: OneDrive não substitui backup! Configure backups regulares do banco de dados

## ❓ Suporte

Para problemas ou dúvidas:

1. Verifique a seção **Troubleshooting** acima
2. Consulte os logs do sistema
3. Verifique a documentação oficial da Microsoft
4. Entre em contato com o time de desenvolvimento
