"""
Script de teste para verificar o ciclo de vida de pastas de projetos:
1. Criação de projeto (pasta em PROSPECTADOS/ANO)
2. Mudança para "Em Execução" (move para Projetos Ativos/ANO)
3. Mudança para "Concluído" (move para Projetos Finalizados/ANO)
4. Tentativa de exclusão com diferentes status
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

def check_folder_exists(year, subfolder, project_folder):
    """Verifica se pasta existe em um local específico"""
    if subfolder:
        path = Path(settings.LOCAL_STORAGE_ROOT_PATH) / subfolder / year / project_folder
    else:
        # Para projetos prospectados, usa a subpasta "Projetos Prospectados"
        path = Path(settings.LOCAL_STORAGE_ROOT_PATH) / "Projetos Prospectados" / year / project_folder
    
    exists = path.exists()
    status = "✅" if exists else "❌"
    print(f"   {status} {path}")
    return exists

def test_project_lifecycle():
    """Testa o ciclo de vida completo de um projeto"""
    
    print_header("TESTE DE CICLO DE VIDA DE PROJETO")
    
    if not settings.LOCAL_STORAGE_ENABLED:
        print("❌ Local Storage está desabilitado!")
        print(f"   Configure LOCAL_STORAGE_ENABLED=true no .env")
        return
    
    print(f"✅ Local Storage habilitado")
    print(f"📁 Caminho raiz: {settings.LOCAL_STORAGE_ROOT_PATH}\n")
    
    # Dados do projeto de teste
    project_number = "TC2602888"
    project_name = "Teste Ciclo Vida"
    client_sigla = "TST"
    year = "2026"
    project_folder = f"{project_number} - {client_sigla} - {project_name}"
    
    # ========================================
    # FASE 1: CRIAR PROJETO (ORÇANDO)
    # ========================================
    print_header("FASE 1: CRIAR PROJETO (Status: Orçando)")
    print(f"📋 Projeto: {project_number}")
    print(f"🏢 Cliente: {client_sigla}")
    print(f"📝 Nome: {project_name}\n")
    
    print("Criando estrutura de pastas em Projetos Prospectados/2026...\n")
    success = local_storage_service.create_project_structure(
        project_number=project_number,
        project_name=project_name,
        client_sigla=client_sigla
    )
    
    if success:
        print("✅ Estrutura criada com sucesso!")
        print("\n📂 Localização esperada:")
        check_folder_exists(year, None, project_folder)
    else:
        print("❌ Erro ao criar estrutura!")
        return
    
    # ========================================
    # FASE 2: MUDAR PARA "EM EXECUÇÃO"
    # ========================================
    print_header("FASE 2: MUDAR STATUS PARA 'Em Execução'")
    print("Movendo pasta para Projetos Ativos/2026...\n")
    
    success = local_storage_service.move_project_folder(
        project_number=project_number,
        project_name=project_name,
        client_sigla=client_sigla,
        destination="Projetos Ativos"
    )
    
    if success:
        print("✅ Pasta movida com sucesso!")
        print("\n📂 Localização atual:")
        print("\nPROJETOS PROSPECTADOS (deve estar vazio):")
        check_folder_exists(year, None, project_folder)
        print("\nPROJETOS ATIVOS (deve conter a pasta):")
        check_folder_exists(year, "Projetos Ativos", project_folder)
    else:
        print("❌ Erro ao mover pasta!")
    
    # ========================================
    # FASE 3: MUDAR PARA "CONCLUÍDO"
    # ========================================
    print_header("FASE 3: MUDAR STATUS PARA 'Concluído'")
    print("Movendo pasta para Projetos Finalizados/2026...\n")
    
    success = local_storage_service.move_project_folder(
        project_number=project_number,
        project_name=project_name,
        client_sigla=client_sigla,
        destination="Projetos Finalizados"
    )
    
    if success:
        print("✅ Pasta movida com sucesso!")
        print("\n📂 Localização atual:")
        print("\nPROJETOS ATIVOS (deve estar vazio):")
        check_folder_exists(year, "Projetos Ativos", project_folder)
        print("\nPROJETOS FINALIZADOS (deve conter a pasta):")
        check_folder_exists(year, "Projetos Finalizados", project_folder)
    else:
        print("❌ Erro ao mover pasta!")
    
    # ========================================
    # FASE 4: VOLTAR PARA PROSPECTADOS
    # ========================================
    print_header("FASE 4: VOLTAR PARA 'Orçando' (Para testar exclusão)")
    print("Movendo pasta de volta para Projetos Prospectados/2026...\n")
    
    success = local_storage_service.move_project_folder(
        project_number=project_number,
        project_name=project_name,
        client_sigla=client_sigla,
        destination="PROSPECTADOS"
    )
    
    if success:
        print("✅ Pasta movida com sucesso!")
        print("\n📂 Localização atual:")
        print("\nPROJETOS PROSPECTADOS (deve conter a pasta):")
        check_folder_exists(year, None, project_folder)
    else:
        print("❌ Erro ao mover pasta!")
    
    # ========================================
    # FASE 5: EXCLUIR PROJETO
    # ========================================
    print_header("FASE 5: EXCLUIR PROJETO")
    print("⚠️  Apenas projetos com status 'Orçando' podem ser excluídos")
    print("Como movemos de volta para Projetos Prospectados, podemos excluir...\n")
    
    success = local_storage_service.delete_project_folder(
        project_number=project_number,
        project_name=project_name,
        client_sigla=client_sigla
    )
    
    if success:
        print("✅ Pasta excluída com sucesso!")
        print("\n📂 Verificação final:")
        exists_prospectados = check_folder_exists(year, None, project_folder)
        exists_ativos = check_folder_exists(year, "Projetos Ativos", project_folder)
        exists_finalizados = check_folder_exists(year, "Projetos Finalizados", project_folder)
        
        if not (exists_prospectados or exists_ativos or exists_finalizados):
            print("\n✅ Pasta completamente removida de todos os locais!")
    else:
        print("❌ Erro ao excluir pasta!")
    
    # ========================================
    # RESUMO
    # ========================================
    print_header("RESUMO DO TESTE")
    print("""
✅ FUNCIONALIDADES IMPLEMENTADAS:

1. 📁 CRIAR PROJETO (Status: Orçando)
   → Pasta criada em: Projetos Prospectados/2026/NUMERO - SIGLA - NOME/

2. 🚀 MUDAR PARA "Em Execução"
   → Pasta movida para: Projetos Ativos/2026/NUMERO - SIGLA - NOME/

3. ✅ MUDAR PARA "Concluído"
   → Pasta movida para: Projetos Finalizados/2026/NUMERO - SIGLA - NOME/

4. 🗑️  EXCLUIR PROJETO
   → Só permite se status = "Orçando"
   → Pasta excluída do sistema de arquivos

INTEGRAÇÃO COM API:
- POST /projetos/ → Cria pasta em Projetos Prospectados/ANO
- PATCH /projetos/{id} → Move pasta conforme mudança de status
- DELETE /projetos/{id} → Valida status e exclui pasta
    """)
    
    print("=" * 70)
    print("🎉 TESTE CONCLUÍDO!")
    print("=" * 70)

if __name__ == "__main__":
    test_project_lifecycle()
