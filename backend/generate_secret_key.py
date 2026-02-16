"""
Script para gerar uma SECRET_KEY segura para produção
"""
import secrets

def generate_secret_key(length=64):
    """Gera uma chave secreta criptograficamente segura"""
    return secrets.token_urlsafe(length)

if __name__ == "__main__":
    print("🔐 Gerando SECRET_KEY segura para produção...\n")
    secret_key = generate_secret_key()
    print(f"SECRET_KEY={secret_key}\n")
    print("⚠️  IMPORTANTE:")
    print("   1. Copie esta chave e adicione ao arquivo .env em produção")
    print("   2. NUNCA compartilhe ou faça commit desta chave")
    print("   3. Use uma chave diferente para cada ambiente\n")
