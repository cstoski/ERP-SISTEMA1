"""
Script de teste para validar configuração do OneDrive
"""
import sys
import os

# Configurar encoding UTF-8 para Windows
if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    os.environ['PYTHONUTF8'] = '1'

import logging
from app.onedrive_service import onedrive_service
from app.config import settings

# Configurar logging para ver os detalhes
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def test_onedrive_config():
    """Testa configuração do OneDrive"""
    print("=" * 70)
    print("🔍 TESTE DE CONFIGURAÇÃO DO ONEDRIVE")
    print("=" * 70)
    print()
    
    # 1. Verificar se está habilitado
    print("1️⃣  Verificando se OneDrive está habilitado...")
    print(f"   ONEDRIVE_ENABLED: {settings.ONEDRIVE_ENABLED}")
    
    if not settings.ONEDRIVE_ENABLED:
        print("   ❌ OneDrive está DESABILITADO no .env")
        print("   ℹ️  Configure ONEDRIVE_ENABLED=true para ativar")
        return False
    
    print("   ✅ OneDrive habilitado!")
    print()
    
    # 2. Verificar credenciais
    print("2️⃣  Verificando credenciais...")
    has_client_id = bool(settings.ONEDRIVE_CLIENT_ID)
    has_client_secret = bool(settings.ONEDRIVE_CLIENT_SECRET)
    has_tenant_id = bool(settings.ONEDRIVE_TENANT_ID)
    
    print(f"   CLIENT_ID: {'✅ Configurado' if has_client_id else '❌ Faltando'}")
    print(f"   CLIENT_SECRET: {'✅ Configurado' if has_client_secret else '❌ Faltando'}")
    print(f"   TENANT_ID: {'✅ Configurado' if has_tenant_id else '❌ Faltando'}")
    print(f"   ROOT_FOLDER: {settings.ONEDRIVE_ROOT_FOLDER}")
    
    if not (has_client_id and has_client_secret and has_tenant_id):
        print()
        print("   ❌ Credenciais incompletas!")
        return False
    
    print("   ✅ Todas as credenciais configuradas!")
    print()
    
    # 3. Testar autenticação
    print("3️⃣  Testando autenticação...")
    try:
        token = onedrive_service._get_access_token()
        if token:
            print(f"   ✅ Autenticação bem-sucedida!")
            print(f"   🔑 Token obtido: {token[:20]}...")
        else:
            print("   ❌ Falha ao obter token de acesso")
            print("   ℹ️  Verifique as credenciais no Azure Portal")
            return False
    except Exception as e:
        print(f"   ❌ Erro na autenticação: {str(e)}")
        return False
    
    print()
    
    # 4. Testar criação de pasta de teste
    print("4️⃣  Testando criação de pasta...")
    try:
        test_folder = "TEST_ONEDRIVE_CONNECTION"
        result = onedrive_service.create_folder(test_folder)
        
        if result:
            print(f"   ✅ Pasta de teste criada com sucesso!")
            print(f"   📁 Nome: {result.get('name')}")
            print(f"   🔗 ID: {result.get('id')}")
            print(f"   📍 Caminho: {settings.ONEDRIVE_ROOT_FOLDER}/{test_folder}")
        else:
            print("   ⚠️  Não foi possível criar pasta de teste")
            print("   ℹ️  Verifique as permissões no Azure Portal")
            print("   ℹ️  Certifique-se de que concedeu 'Admin Consent'")
            return False
    except Exception as e:
        print(f"   ❌ Erro ao criar pasta: {str(e)}")
        return False
    
    print()
    
    # 5. Testar criação de estrutura de projeto
    print("5️⃣  Testando criação de estrutura de projeto...")
    try:
        result = onedrive_service.create_project_structure(
            project_number="TC2602999",
            project_name="Projeto Teste OneDrive",
            client_sigla="TST"
        )
        
        if result:
            print("   ✅ Estrutura de projeto criada com sucesso!")
            print("   📂 Verifique no OneDrive:")
            print(f"      {settings.ONEDRIVE_ROOT_FOLDER}/2026/TC2602999 - TST - Projeto Teste OneDrive/")
        else:
            print("   ⚠️  Erro ao criar estrutura do projeto")
            return False
    except Exception as e:
        print(f"   ❌ Erro ao criar estrutura: {str(e)}")
        return False
    
    print()
    print("=" * 70)
    print("✅ TODOS OS TESTES PASSARAM!")
    print("=" * 70)
    print()
    print("🎉 OneDrive está configurado e funcionando corretamente!")
    print()
    print("📁 Acesse seu OneDrive e verifique a pasta:")
    print(f"   {settings.ONEDRIVE_ROOT_FOLDER}/")
    print()
    print("ℹ️  Você pode limpar as pastas de teste criadas manualmente")
    print()
    
    return True


if __name__ == "__main__":
    try:
        success = test_onedrive_config()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Teste cancelado pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Erro inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
