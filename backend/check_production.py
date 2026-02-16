"""
Script de checklist para verificar se a aplicação está pronta para produção
"""
import os
import sys
from pathlib import Path

def check_production_ready():
    """Verifica se a aplicação está pronta para produção"""
    
    print("🔍 Verificando configurações de produção...\n")
    
    issues = []
    warnings = []
    success = []
    
    # 1. Verificar arquivo .env
    env_file = Path(".env")
    if not env_file.exists():
        issues.append("❌ Arquivo .env não encontrado")
    else:
        success.append("✅ Arquivo .env encontrado")
        
        # Ler .env
        with open(env_file, 'r', encoding='utf-8') as f:
            env_content = f.read()
        
        # Verificar SECRET_KEY
        if "seu-secret-key-aqui-altere-em-producao" in env_content:
            issues.append("❌ SECRET_KEY padrão detectada - ALTERE ANTES DE PRODUÇÃO!")
        else:
            success.append("✅ SECRET_KEY personalizada configurada")
        
        # Verificar ENVIRONMENT
        if "ENVIRONMENT=production" in env_content:
            success.append("✅ ENVIRONMENT configurado para production")
        else:
            warnings.append("⚠️  ENVIRONMENT não está em 'production'")
        
        # Verificar DATABASE_URL
        if "sqlite" in env_content.lower():
            warnings.append("⚠️  Usando SQLite - recomendado PostgreSQL para produção")
        elif "postgresql" in env_content.lower():
            success.append("✅ Usando PostgreSQL")
        
        # Verificar ALLOWED_ORIGINS
        if "ALLOWED_ORIGINS=*" in env_content or "*" in env_content:
            issues.append("❌ CORS com '*' detectado - configure origens específicas!")
        elif "ALLOWED_ORIGINS=" in env_content:
            success.append("✅ ALLOWED_ORIGINS configurado")
    
    # 2. Verificar requirements.txt
    req_file = Path("requirements.txt")
    if not req_file.exists():
        warnings.append("⚠️  requirements.txt não encontrado")
    else:
        success.append("✅ requirements.txt encontrado")
    
    # 3. Verificar migrações
    alembic_dir = Path("alembic")
    if not alembic_dir.exists():
        warnings.append("⚠️  Diretório alembic não encontrado")
    else:
        success.append("✅ Diretório de migrações encontrado")
    
    # 4. Verificar scripts de produção
    prod_script = Path("run_production.py")
    if not prod_script.exists():
        warnings.append("⚠️  Script run_production.py não encontrado")
    else:
        success.append("✅ Script de produção encontrado")
    
    # Mostrar resultados
    print("=" * 70)
    print("SUCESSO:")
    print("=" * 70)
    for item in success:
        print(item)
    
    if warnings:
        print("\n" + "=" * 70)
        print("AVISOS:")
        print("=" * 70)
        for item in warnings:
            print(item)
    
    if issues:
        print("\n" + "=" * 70)
        print("PROBLEMAS CRÍTICOS:")
        print("=" * 70)
        for item in issues:
            print(item)
        print("\n⛔ CORRIJA OS PROBLEMAS ANTES DE FAZER DEPLOY EM PRODUÇÃO!")
        return False
    else:
        print("\n" + "=" * 70)
        if warnings:
            print("⚠️  Aplicação PRONTA com algumas ressalvas")
            print("   Revise os avisos antes de fazer deploy")
        else:
            print("✅ Aplicação PRONTA para produção!")
        print("=" * 70)
        return True

if __name__ == "__main__":
    print("🚀 ERP Sistema TAKT - Checklist de Produção\n")
    
    # Verificar se está no diretório backend
    if not Path("app").exists():
        print("❌ Execute este script do diretório backend/")
        sys.exit(1)
    
    ready = check_production_ready()
    
    print("\n📋 Próximos passos:")
    print("   1. Revise e corrija os problemas listados acima")
    print("   2. Gere uma SECRET_KEY segura: python generate_secret_key.py")
    print("   3. Configure o ALLOWED_ORIGINS com seu domínio de produção")
    print("   4. Execute as migrações: python -m alembic upgrade head")
    print("   5. Crie os usuários iniciais: python create_initial_users.py")
    print("   6. Consulte DEPLOY.md para instruções completas de deploy\n")
    
    sys.exit(0 if ready else 1)
