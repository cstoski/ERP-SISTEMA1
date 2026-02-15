import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional


def send_reset_password_email(user_email: str, username: str, reset_token: str, reset_link: str) -> bool:
    """
    Enviar email de reset de senha
    
    Espera as seguintes variáveis de ambiente:
    - SMTP_HOST: Host do servidor SMTP (ex: smtp.gmail.com, smtp.mailtrap.io)
    - SMTP_PORT: Porta SMTP (ex: 587 para TLS, 465 para SSL)
    - SMTP_USER: Usuário SMTP
    - SMTP_PASSWORD: Senha SMTP
    - SMTP_FROM_EMAIL: Email de envio (ex: noreply@meusistema.com)
    - SMTP_USE_TLS: True para TLS, False para SSL (padrão: True)
    """
    
    try:
        # Obter configurações de email
        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")
        smtp_from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user)
        smtp_use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
        
        # Se nenhuma configuração foi fornecida, apenas simular
        if not all([smtp_host, smtp_user, smtp_password]):
            print(f"[EMAIL SIMULATION] Nenhuma configuração SMTP encontrada.")
            print(f"[RESET PASSWORD] Email para: {user_email}")
            print(f"[RESET PASSWORD] Usuário: {username}")
            print(f"[RESET PASSWORD] Link: {reset_link}")
            print(f"[RESET PASSWORD] Token: {reset_token}")
            return True
        
        # Criar mensagem
        message = MIMEMultipart("alternative")
        message["Subject"] = "Reset de Senha - TAKT ERP"
        message["From"] = smtp_from_email
        message["To"] = user_email
        
        # Corpo do email em texto simples
        text_content = f"""
Olá {username},

Você solicitou um reset de senha para sua conta no TAKT ERP.

Clique no link abaixo para redefinir sua senha:
{reset_link}

Este link expira em 24 horas.

Se você não solicitou este reset, ignore este email.

Atenciosamente,
Equipe TAKT ERP
"""
        
        # Corpo do email em HTML
        html_content = f"""
<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <h2>Reset de Senha - TAKT ERP</h2>
    <p>Olá <strong>{username}</strong>,</p>
    <p>Você solicitou um reset de senha para sua conta no TAKT ERP.</p>
    <p>
      <a href="{reset_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Redefinir Senha
      </a>
    </p>
    <p style="font-size: 0.9em; color: #666;">Este link expira em 24 horas.</p>
    <p style="font-size: 0.9em; color: #999;">Se você não solicitou este reset, ignore este email.</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 2em 0;">
    <p style="font-size: 0.85em; color: #999;">Equipe TAKT ERP</p>
  </body>
</html>
"""
        
        # Adicionar partes do email
        message.attach(MIMEText(text_content, "plain"))
        message.attach(MIMEText(html_content, "html"))
        
        # Conectar ao servidor SMTP e enviar
        if smtp_use_tls:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        
        server.login(smtp_user, smtp_password)
        server.send_message(message)
        server.quit()
        
        print(f"[EMAIL SENT] Email enviado com sucesso para {user_email}")
        return True
        
    except Exception as e:
        print(f"[EMAIL ERROR] Erro ao enviar email para {user_email}: {str(e)}")
        # Retornar True mesmo com erro para não quebrar o fluxo do usuário
        # (o admin saberá que houve erro pelos logs)
        return True
