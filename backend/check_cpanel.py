"""
Script para verificar compatibilidade e preparar para deploy no cPanel
"""
import sys
import os
from pathlib import Path

def check_cpanel_ready():
    """Verifica se está pronto para deploy no cPanel"""
    
    print("🌐 Verificação de Deploy para cPanel\n")
    print("=" * 70)
    
    issues = []
    warnings = []
    success = []
    
    # 1. Verificar passenger_wsgi.py
    wsgi_file = Path("passenger_wsgi.py")
    if wsgi_file.exists():
        success.append("✅ passenger_wsgi.py encontrado")
    else:
        issues.append("❌ passenger_wsgi.py não encontrado - necessário para cPanel")
    
    # 2. Verificar a2wsgi no requirements
    req_file = Path("requirements.txt")
    if req_file.exists():
        with open(req_file, 'r') as f:
            requirements = f.read()
            if 'a2wsgi' in requirements:
                success.append("✅ a2wsgi presente no requirements.txt")
            else:
                issues.append("❌ a2wsgi não encontrado no requirements.txt")
    
    # 3. Verificar .env
    env_file = Path(".env")
    if env_file.exists():
        success.append("✅ Arquivo .env encontrado")
        
        with open(env_file, 'r', encoding='utf-8') as f:
            env_content = f.read()
            
            # Verificar DATABASE_URL
            if 'DATABASE_URL=' in env_content:
                if 'postgresql' in env_content or 'mysql' in env_content:
                    success.append("✅ DATABASE_URL configurado")
                else:
                    warnings.append("⚠️  DATABASE_URL deve usar PostgreSQL ou MySQL para cPanel")
            
            # Verificar SECRET_KEY
            if 'SECRET_KEY=' in env_content:
                if 'seu-secret-key-aqui-altere-em-producao' in env_content:
                    warnings.append("⚠️  SECRET_KEY padrão - gere uma nova!")
                else:
                    success.append("✅ SECRET_KEY personalizada")
    else:
        issues.append("❌ Arquivo .env não encontrado")
    
    # 4. Verificar frontend build
    frontend_dist = Path("../frontend/dist")
    if frontend_dist.exists():
        success.append("✅ Build do frontend encontrado (frontend/dist/)")
    else:
        warnings.append("⚠️  Build do frontend não encontrado - execute 'npm run build'")
    
    # 5. Verificar .htaccess example
    htaccess_example = Path("../frontend/.htaccess.example")
    if htaccess_example.exists():
        success.append("✅ .htaccess.example disponível")
    else:
        warnings.append("⚠️  .htaccess.example não encontrado")
    
    # 6. Verificar alembic
    alembic_dir = Path("alembic")
    if alembic_dir.exists():
        success.append("✅ Migrações alembic disponíveis")
    else:
        warnings.append("⚠️  Diretório alembic não encontrado")
    
    # Mostrar resultados
    print("\n✅ SUCESSO:")
    print("=" * 70)
    for item in success:
        print(f"  {item}")
    
    if warnings:
        print("\n⚠️  AVISOS:")
        print("=" * 70)
        for item in warnings:
            print(f"  {item}")
    
    if issues:
        print("\n❌ PROBLEMAS:")
        print("=" * 70)
        for item in issues:
            print(f"  {item}")
    
    print("\n" + "=" * 70)
    print("📋 CHECKLIST PARA CPANEL:")
    print("=" * 70)
    print("  [ ] 1. Banco de dados criado no cPanel (PostgreSQL ou MySQL)")
    print("  [ ] 2. .env configurado com credenciais do banco")
    print("  [ ] 3. SECRET_KEY gerada (python generate_secret_key.py)")
    print("  [ ] 4. a2wsgi instalado (pip install a2wsgi)")
    print("  [ ] 5. Frontend buildado (cd ../frontend && npm run build)")
    print("  [ ] 6. Arquivos enviados para cPanel:")
    print("        - backend/ → ~/erp-sistema/backend/")
    print("        - frontend/dist/ → ~/public_html/")
    print("  [ ] 7. Python App configurado no cPanel")
    print("  [ ] 8. .htaccess criado em public_html")
    print("  [ ] 9. Migrações executadas (python -m alembic upgrade head)")
    print("  [ ] 10. Usuários criados (python create_initial_users.py)")
    print("  [ ] 11. SSL/TLS configurado")
    print("  [ ] 12. Aplicação reiniciada (touch tmp/restart.txt)")
    
    print("\n📖 PRÓXIMOS PASSOS:")
    print("=" * 70)
    
    if issues:
        print("  1. Corrija os problemas listados acima")
        print("  2. Execute este script novamente")
    else:
        print("  1. Consulte o guia: DEPLOY-CPANEL.md")
        print("  2. Configure o banco de dados no cPanel")
        print("  3. Envie os arquivos via FTP/SSH")
        print("  4. Configure Python App no cPanel")
        print("  5. Teste a aplicação")
    
    print("=" * 70)
    print()
    
    return len(issues) == 0

if __name__ == "__main__":
    print("🚀 ERP Sistema TAKT - Verificação cPanel\n")
    
    if not Path("app").exists():
        print("❌ Execute este script do diretório backend/")
        sys.exit(1)
    
    ready = check_cpanel_ready()
    sys.exit(0 if ready else 1)
