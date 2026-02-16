"""
Script de teste para validar armazenamento local
"""
import sys
import os

# Configurar encoding UTF-8 para Windows
if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    os.environ['PYTHONUTF8'] = '1'

import logging
from app.local_storage_service import local_storage_service
from app.config import settings

# Configurar logging para ver os detalhes
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def test_local_storage():
    """Testa armazenamento local"""
    print("=" * 70)
    print("🔍 TESTE DE ARMAZENAMENTO LOCAL")
    print("=" * 70)
    print()
    
    # 1. Verificar se está habilitado
    print("1️⃣  Verificando se Local Storage está habilitado...")
    print(f"   LOCAL_STORAGE_ENABLED: {settings.LOCAL_STORAGE_ENABLED}")
    
    if not settings.LOCAL_STORAGE_ENABLED:
        print("   ❌ Local Storage está DESABILITADO no .env")
        print("   ℹ️  Configure LOCAL_STORAGE_ENABLED=true para ativar")
        return False
    
    print("   ✅ Local Storage habilitado!")
    print()
    
    # 2. Verificar caminho
    print("2️⃣  Verificando caminho configurado...")
    print(f"   ROOT_PATH: {settings.LOCAL_STORAGE_ROOT_PATH}")
    
    if not settings.LOCAL_STORAGE_ROOT_PATH:
        print("   ❌ Caminho não configurado!")
        return False
    
    print("   ✅ Caminho configurado!")
    print()
    
    # 3. Testar criação de pasta simples
    print("3️⃣  Testando criação de pasta...")
    try:
        test_folder = "TEST_LOCAL_STORAGE"
        result = local_storage_service.create_folder(test_folder)
        
        if result:
            print(f"   ✅ Pasta de teste criada com sucesso!")
            print(f"   📁 Caminho: {settings.LOCAL_STORAGE_ROOT_PATH}\\{test_folder}")
        else:
            print("   ❌ Falha ao criar pasta de teste")
            return False
    except Exception as e:
        print(f"   ❌ Erro ao criar pasta: {str(e)}")
        return False
    
    print()
    
    # 4. Testar criação de estrutura de projeto
    print("4️⃣  Testando criação de estrutura de projeto...")
    try:
        result = local_storage_service.create_project_structure(
            project_number="TC2602999",
            project_name="Projeto Teste Local",
            client_sigla="TST"
        )
        
        if result:
            print("   ✅ Estrutura de projeto criada com sucesso!")
            print("   📂 Verifique a pasta:")
            print(f"      {settings.LOCAL_STORAGE_ROOT_PATH}\\2026\\TC2602999 - TST - Projeto Teste Local\\")
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
    print("🎉 Armazenamento local está configurado e funcionando corretamente!")
    print()
    print("📁 Acesse a pasta e verifique:")
    print(f"   {settings.LOCAL_STORAGE_ROOT_PATH}\\")
    print()
    
    return True

if __name__ == "__main__":
    try:
        success = test_local_storage()
        sys.exit(0 if success else 1)
    except Exception as e:
        print()
        print()
        print(f"❌ Erro inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
