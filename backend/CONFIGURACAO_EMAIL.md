# Configuração de Envio de Email

## Visão Geral
O sistema agora suporta envio real de emails para reset de senha. A funcionalidade foi implementada para suportar qualquer servidor SMTP.

## Como Configurar

### 1. Copiar o arquivo de configuração
```bash
cd backend
cp .env.example .env
```

### 2. Escolher um provedor de SMTP

#### Opção A: Gmail (Recomendado para testes pequenos)
1. Acesse sua conta Google: https://myaccount.google.com/apppasswords
2. Gere uma "App Password" (senha específica para aplicação)
3. No arquivo `.env`, configure:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=senha-gerada-acima
SMTP_FROM_EMAIL=seu-email@gmail.com
SMTP_USE_TLS=true
```

#### Opção B: Mailtrap.io (Recomendado para desenvolvimento)
1. Crie conta gratuita em https://mailtrap.io
2. Vá para Settings > SMTP Credentials
3. Configure no `.env`:
```
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=465
SMTP_USER=seu-username-mailtrap
SMTP_PASSWORD=sua-password-mailtrap
SMTP_FROM_EMAIL=seu-email@mailtrap.io
SMTP_USE_TLS=false
```

#### Opção C: Outro provedor
Consulte a documentação do seu provedor para obter as credenciais SMTP.

### 3. Configurar a URL do Frontend
```
FRONTEND_URL=http://localhost:5174
```

## Fluxo de Funcionamento

1. **Admin solicita reset de senha:**
   - Admin vai para "Gerenciamento de Usuários"
   - Clica no ícone de chave (reset senha)
   - Sistema envia email ao usuário

2. **Email é enviado para o usuário com:**
   - Link para redefinir a senha
   - Link válido por 24 horas

3. **Usuário clica no link do email:**
   - Acessa a página `/reset-senha?token=XXXX`
   - Insere nova senha
   - Senha é atualizada no banco

4. **Usuário faz login com nova senha**

## Modo de Simulação (sem SMTP configurado)
Se nenhuma configuração SMTP for fornecida, o sistema entra em modo de **simulação**:
- Imprime no console as informações que seriam enviadas
- Útil para testes sem configuração SMTP
- Exemplo no console:
```
[EMAIL SIMULATION] Nenhuma configuração SMTP encontrada.
[RESET PASSWORD] Email para: usuario@example.com
[RESET PASSWORD] Usuário: john_doe
[RESET PASSWORD] Link: http://localhost:5174/reset-senha?token=eyJhbG...
```

## Testes

### Teste com Gmail
1. Use uma conta Gmail pessoal para testes
2. Gere uma App Password
3. Configure no `.env`
4. Reinicie o backend
5. Solicite um reset de senha no admin

### Teste com Mailtrap
1. Mailtrap fornece credenciais SMTP reais mas não envia emails reais
2. Todos os emails são capturados na dashboard de testes
3. Perfeito para verificar o template do email

## Troubleshooting

### Erro de autenticação SMTP
- Verifique as credenciais no `.env`
- Certifique-se de que a senha está correta
- Se usar Gmail, confirme que gerou uma App Password (não a senha da conta)

### Email não é enviado
- Verifique `SMTP_HOST` e `SMTP_PORT`
- Confirme `SMTP_USE_TLS` conforme seu provedor
- Verifique os logs do backend (aparecerá `[EMAIL ERROR] Erro ao enviar...`)

### Windows Defender / Antivírus bloqueia SMTP
- Configure a exceção no antivírus
- Ou use Mailtrap (acesso seguro via HTTPS)

## Segurança

⚠️ **IMPORTANTE:** 
- Nunca commit do arquivo `.env` com credenciais reais no git
- Use variáveis de ambiente em produção
- O arquivo `.env` está no `.gitignore`
