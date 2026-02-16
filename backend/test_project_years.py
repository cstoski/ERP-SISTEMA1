"""
Script de teste para verificar criação de projetos em diferentes anos
O ano é extraído do número do projeto: TC + ANO (2 dígitos) + MÊS + SEQUENCIAL
Exemplo: TC2602001 -> 26 = 2026, TC2502001 -> 25 = 2025
"""

import sys
import os
from pathlib import Path

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Importar configurações e serviços
from app.config import settings
from app.local_storage_service import local_storage_service

def print_header(text):
    """Imprime cabeçalho formatado"""
    print("\n" + "=" * 70)
    print(f"🔍 {text}")
    print("=" * 70)

def test_multiple_years():
    """Testa criação de projetos em diferentes anos"""
    
    print_header("TESTE DE PROJETOS EM DIFERENTES ANOS")
    
    if not settings.LOCAL_STORAGE_ENABLED:
        print("❌ Local Storage está desabilitado!")
        print(f"   Configure LOCAL_STORAGE_ENABLED=true no .env")
        return
    
    print(f"✅ Local Storage habilitado")
    print(f"📁 Caminho raiz: {settings.LOCAL_STORAGE_ROOT_PATH}\n")
    
    # Projetos de teste para diferentes anos
    test_projects = [
        {
            "number": "TC2502001",
            "name": "Projeto Teste 2025",
            "sigla": "T25",
            "expected_year": "2025"
        },
        {
            "number": "TC2602002",
            "name": "Projeto Teste 2026",
            "sigla": "T26",
            "expected_year": "2026"
        },
        {
            "number": "TC2702003",
            "name": "Projeto Teste 2027",
            "sigla": "T27",
            "expected_year": "2027"
        }
    ]
    
    created_folders = []
    
    # Criar projetos
    print_header("CRIANDO PROJETOS EM DIFERENTES ANOS")
    
    for project in test_projects:
        print(f"\n📋 Criando projeto {project['number']} (Ano: {project['expected_year']})")
        print(f"   Nome: {project['name']}")
        print(f"   Sigla: {project['sigla']}")
        
        success = local_storage_service.create_project_structure(
            project_number=project['number'],
            project_name=project['name'],
            client_sigla=project['sigla']
        )
        
        if success:
            # Verificar se pasta foi criada no ano correto
            project_folder = f"{project['number']} - {project['sigla']} - {project['name']}"
            expected_path = Path(settings.LOCAL_STORAGE_ROOT_PATH) / "Projetos Prospectados" / project['expected_year'] / project_folder
            
            if expected_path.exists():
                print(f"   ✅ Pasta criada no ano correto: {project['expected_year']}/")
                print(f"      📁 {expected_path}")
                created_folders.append(expected_path)
            else:
                print(f"   ❌ ERRO: Pasta não encontrada no ano esperado!")
                print(f"      Esperado: {expected_path}")
        else:
            print(f"   ❌ Erro ao criar estrutura!")
    
    # Verificar estrutura criada
    print_header("VERIFICAÇÃO DA ESTRUTURA CRIADA")
    
    for project in test_projects:
        year = project['expected_year']
        project_folder = f"{project['number']} - {project['sigla']} - {project['name']}"
        year_path = Path(settings.LOCAL_STORAGE_ROOT_PATH) / "Projetos Prospectados" / year
        project_path = year_path / project_folder
        
        print(f"\n📅 ANO {year}:")
        if project_path.exists():
            print(f"   ✅ Projeto encontrado: {project['number']}")
            
            # Verificar algumas pastas principais
            main_folders = ["01-PROPOSTA", "02-DESENVOLVIMENTO", "03-GESTAO"]
            for folder in main_folders:
                folder_path = project_path / folder
                status = "✅" if folder_path.exists() else "❌"
                print(f"      {status} {folder}")
        else:
            print(f"   ❌ Projeto NÃO encontrado: {project['number']}")
    
    # Limpeza
    print_header("LIMPEZA - REMOVENDO PROJETOS DE TESTE")
    
    for path in created_folders:
        try:
            import shutil
            shutil.rmtree(path)
            print(f"   🗑️  Removido: {path.name}")
        except Exception as e:
            print(f"   ❌ Erro ao remover {path.name}: {str(e)}")
    
    # Resumo
    print_header("RESUMO DO TESTE")
    print("""
✅ VALIDAÇÃO DO ANO DO PROJETO:

Formato do número: TC + ANO (2 dígitos) + MÊS (2 dígitos) + SEQUENCIAL (3 dígitos)

Exemplos:
- TC2502001 → Ano 2025 → Pasta em: Projetos Prospectados/2025/
- TC2602002 → Ano 2026 → Pasta em: Projetos Prospectados/2026/
- TC2702003 → Ano 2027 → Pasta em: Projetos Prospectados/2027/

O sistema agora extrai o ano do número do projeto (caracteres 3-4) e cria
a pasta no diretório correspondente, independentemente do ano atual.

VANTAGENS:
✓ Projetos históricos podem ser criados/importados no ano correto
✓ Projetos futuros são organizados no ano apropriado
✓ Estrutura de pastas reflete o ano real do projeto
    """)
    
    print("=" * 70)
    print("🎉 TESTE CONCLUÍDO!")
    print("=" * 70)

if __name__ == "__main__":
    test_multiple_years()
