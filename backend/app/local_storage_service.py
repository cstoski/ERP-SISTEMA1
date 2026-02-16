"""
Serviço de armazenamento local - cria estrutura de pastas no sistema de arquivos
"""
import logging
import os
import shutil
from pathlib import Path
from typing import Optional
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)


class LocalStorageService:
    """Serviço para gerenciar arquivos e pastas localmente"""
    
    def __init__(self):
        self.enabled = settings.LOCAL_STORAGE_ENABLED
        self.root_folder = settings.LOCAL_STORAGE_ROOT_PATH
        self.templates_path = settings.LOCAL_TEMPLATES_PATH
        
        if self.enabled and not self.root_folder:
            logger.warning("Local storage está habilitado mas caminho raiz não foi configurado!")
            self.enabled = False
    
    def create_folder(self, folder_path: str) -> bool:
        """
        Cria uma pasta no sistema local
        
        Args:
            folder_path: Caminho da pasta a criar (relativo ao root)
        
        Returns:
            True se sucesso, False caso contrário
        """
        if not self.enabled:
            logger.info(f"Local storage desabilitado. Pasta não criada: {folder_path}")
            return False
        
        try:
            full_path = Path(self.root_folder) / folder_path
            full_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"Pasta criada com sucesso: {full_path}")
            return True
        except Exception as e:
            logger.error(f"Erro ao criar pasta {folder_path}: {str(e)}")
            return False
    
    def create_file(self, file_path: str, content: bytes) -> bool:
        """
        Cria um arquivo no sistema local
        
        Args:
            file_path: Caminho do arquivo (relativo ao root)
            content: Conteúdo do arquivo em bytes
        
        Returns:
            True se sucesso, False caso contrário
        """
        if not self.enabled:
            logger.info(f"Local storage desabilitado. Arquivo não criado: {file_path}")
            return False
        
        try:
            full_path = Path(self.root_folder) / file_path
            # Garante que o diretório pai existe
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(full_path, 'wb') as f:
                f.write(content)
            
            logger.info(f"Arquivo criado com sucesso: {full_path}")
            return True
        except Exception as e:
            logger.error(f"Erro ao criar arquivo {file_path}: {str(e)}")
            return False
    
    def create_project_structure(
        self,
        project_number: str,
        project_name: str,
        client_sigla: str,
        template_opcao: str = "Completa"
    ) -> bool:
        """
        Cria estrutura de pastas para um projeto
        
        Args:
            project_number: Número do projeto (ex: TC2602001)
            project_name: Nome/descrição do projeto
            client_sigla: Sigla do cliente (ex: EMP)
        
        Returns:
            True se sucesso, False caso contrário
        """
        if not self.enabled:
            logger.info(f"Local storage desabilitado. Estrutura não criada para projeto: {project_name}")
            return False
        
        try:
            # Extrai o ano do número do projeto (ex: TC2602001 -> 26 -> 2026)
            year = "20" + project_number[2:4]
            
            # Formato: NUMERO - SIGLA - NOME
            project_folder = f"{project_number} - {client_sigla} - {project_name}"
            
            # Caminho base: Projetos Prospectados/ANO/PROJETO
            base_path = f"Projetos Prospectados/{year}/{project_folder}"
            
            # Estrutura de pastas baseada no VB
            folders = [
                # Pasta base
                base_path,
                
                # Pastas principais
                f"{base_path}/01-PROPOSTA",
                f"{base_path}/02-DESENVOLVIMENTO",
                f"{base_path}/03-GESTAO",
                
                # Estrutura Proposta Comercial
                f"{base_path}/01-PROPOSTA/1.1-INFO_CLIENTE",
                f"{base_path}/01-PROPOSTA/1.2-FOTOS",
                f"{base_path}/01-PROPOSTA/1.3-DOCUMENTOS",
                f"{base_path}/01-PROPOSTA/1.4-ORÇAMENTOS",
                
                # Estrutura Desenvolvimento
                f"{base_path}/02-DESENVOLVIMENTO/2.1-INFO_CLIENTE",
                f"{base_path}/02-DESENVOLVIMENTO/2.2-DOCUMENTOS",
                f"{base_path}/02-DESENVOLVIMENTO/2.2-DOCUMENTOS/2.2.1-DESCRITIVOS",
                f"{base_path}/02-DESENVOLVIMENTO/2.2-DOCUMENTOS/2.2.2-LISTA_MATERIAIS",
                f"{base_path}/02-DESENVOLVIMENTO/2.2-DOCUMENTOS/2.2.3-MANUAIS_EQUIPAMENTOS",
                f"{base_path}/02-DESENVOLVIMENTO/2.2-DOCUMENTOS/2.2.4-FLUXOGRAMAS",
                f"{base_path}/02-DESENVOLVIMENTO/2.2-DOCUMENTOS/2.2.5-MANUAIS_PROJETO",
                f"{base_path}/02-DESENVOLVIMENTO/2.3-PROJETO_ELETRICO",
                f"{base_path}/02-DESENVOLVIMENTO/2.3-PROJETO_ELETRICO/2.3.1-DIAGRAMA",
                f"{base_path}/02-DESENVOLVIMENTO/2.3-PROJETO_ELETRICO/2.3.2-LAYOUT",
                f"{base_path}/02-DESENVOLVIMENTO/2.3-PROJETO_ELETRICO/2.3.3-MEMORIA_CALCULO",
                f"{base_path}/02-DESENVOLVIMENTO/2.4-PROJETO_MECANICO",
                f"{base_path}/02-DESENVOLVIMENTO/2.5-CLP",
                f"{base_path}/02-DESENVOLVIMENTO/2.6-IHM",
                f"{base_path}/02-DESENVOLVIMENTO/2.7-SUPERVISORIO",
                f"{base_path}/02-DESENVOLVIMENTO/2.8-FOTOS",
                f"{base_path}/02-DESENVOLVIMENTO/2.9-COMUNICACAO",
                f"{base_path}/02-DESENVOLVIMENTO/2.10-SOFTWARES",
                
                # Estrutura Gestão
                f"{base_path}/03-GESTAO/3.1-PEDIDO_COMPRA",
                f"{base_path}/03-GESTAO/3.2-CRONOGRAMA",
                f"{base_path}/03-GESTAO/3.3-DESPESAS",
                f"{base_path}/03-GESTAO/3.3-DESPESAS/3.3.1-ORÇAMENTOS",
                f"{base_path}/03-GESTAO/3.3-DESPESAS/3.3.2-PEDIDOS_COMPRA",
                f"{base_path}/03-GESTAO/3.3-DESPESAS/3.3.3-NOTAS_FISCAIS",
                f"{base_path}/03-GESTAO/3.4-NOTAS_FATURAMENTO",
            ]
            
            # Cria cada pasta
            for folder in folders:
                self.create_folder(folder)
            
            # Cria arquivo README.txt
            readme_content = f"""Projeto: {project_number} - {client_sigla} - {project_name}
Número: {project_number}
Cliente: {client_sigla}
Criado automaticamente pelo Sistema ERP TAKT

Estrutura de Pastas:
====================

01-PROPOSTA/
  └── Documentação comercial e orçamentos
      ├── 1.1-INFO_CLIENTE - Informações do cliente
      ├── 1.2-FOTOS - Fotos e imagens da proposta
      ├── 1.3-DOCUMENTOS - Documentos da proposta
      └── 1.4-ORÇAMENTOS - Orçamentos e cotações

02-DESENVOLVIMENTO/
  └── Desenvolvimento técnico do projeto
      ├── 2.1-INFO_CLIENTE - Informações técnicas do cliente
      ├── 2.2-DOCUMENTOS/
      │   ├── 2.2.1-DESCRITIVOS - Descritivos técnicos
      │   ├── 2.2.2-LISTA_MATERIAIS - Listas de materiais
      │   ├── 2.2.3-MANUAIS_EQUIPAMENTOS - Manuais de equipamentos
      │   ├── 2.2.4-FLUXOGRAMAS - Fluxogramas do processo
      │   └── 2.2.5-MANUAIS_PROJETO - Manuais do projeto
      ├── 2.3-PROJETO_ELETRICO/
      │   ├── 2.3.1-DIAGRAMA - Diagramas elétricos
      │   ├── 2.3.2-LAYOUT - Layouts elétricos
      │   └── 2.3.3-MEMORIA_CALCULO - Memórias de cálculo
      ├── 2.4-PROJETO_MECANICO - Projeto mecânico
      ├── 2.5-CLP - Programação de CLP
      ├── 2.6-IHM - Interface Homem-Máquina
      ├── 2.7-SUPERVISORIO - Sistema supervisório
      ├── 2.8-FOTOS - Fotos do desenvolvimento
      ├── 2.9-COMUNICACAO - Comunicações e protocolos
      └── 2.10-SOFTWARES - Softwares utilizados

03-GESTAO/
  └── Gestão e controle do projeto
      ├── 3.1-PEDIDO_COMPRA - Pedidos de compra
      ├── 3.2-CRONOGRAMA - Cronogramas do projeto
      ├── 3.3-DESPESAS/
      │   ├── 3.3.1-ORÇAMENTOS - Orçamentos de despesas
      │   ├── 3.3.2-PEDIDOS_COMPRA - Pedidos de compra
      │   └── 3.3.3-NOTAS_FISCAIS - Notas fiscais
      └── 3.4-NOTAS_FATURAMENTO - Notas de faturamento
"""
            
            self.create_file(f"{base_path}/README.txt", readme_content.encode('utf-8'))
            self.copy_default_documents(base_path, project_number, template_opcao)
            
            logger.info(f"Estrutura de pastas local criada com sucesso para projeto {project_number}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao criar estrutura local do projeto: {str(e)}")
            return False
    
    def delete_project_folder(self, project_number: str, project_name: str, client_sigla: str) -> bool:
        """
        Exclui a pasta de um projeto
        
        Args:
            project_number: Número do projeto (ex: TC2602001)
            project_name: Nome do projeto
            client_sigla: Sigla do cliente
        
        Returns:
            True se sucesso, False caso contrário
        """
        if not self.enabled:
            logger.info(f"Local storage desabilitado. Pasta não excluída: {project_number}")
            return False
        
        try:
            # Obtém o ano do projeto a partir do número (ex: TC2602001 -> 2026)
            year = "20" + project_number[2:4]
            
            # Formato: NUMERO - SIGLA - NOME
            project_folder = f"{project_number} - {client_sigla} - {project_name}"
            
            # Tenta encontrar a pasta em todos os diretórios possíveis
            possible_paths = [
                Path(self.root_folder) / "Projetos Prospectados" / year / project_folder,
                Path(self.root_folder) / "Projetos Ativos" / year / project_folder,
                Path(self.root_folder) / "Projetos Finalizados" / year / project_folder,
            ]
            
            deleted = False
            for path in possible_paths:
                if path.exists():
                    import shutil
                    shutil.rmtree(path)
                    logger.info(f"Pasta de projeto excluída: {path}")
                    deleted = True
            
            if not deleted:
                logger.warning(f"Pasta do projeto não encontrada: {project_folder}")
                
            return deleted
            
        except Exception as e:
            logger.error(f"Erro ao excluir pasta do projeto: {str(e)}")
            return False
    
    def move_project_folder(
        self, 
        project_number: str, 
        project_name: str, 
        client_sigla: str, 
        destination: str
    ) -> bool:
        """
        Move a pasta de um projeto para outro diretório
        
        Args:
            project_number: Número do projeto (ex: TC2602001)
            project_name: Nome do projeto
            client_sigla: Sigla do cliente
            destination: Destino - "PROSPECTADOS", "Projetos Ativos" ou "Projetos Finalizados"
        
        Returns:
            True se sucesso, False caso contrário
        """
        if not self.enabled:
            logger.info(f"Local storage desabilitado. Pasta não movida: {project_number}")
            return False
        
        try:
            # Obtém o ano do projeto
            year = "20" + project_number[2:4]
            
            # Formato: NUMERO - SIGLA - NOME
            project_folder = f"{project_number} - {client_sigla} - {project_name}"
            
            # Define origem e destino
            possible_sources = [
                Path(self.root_folder) / "Projetos Prospectados" / year / project_folder,
                Path(self.root_folder) / "Projetos Ativos" / year / project_folder,
                Path(self.root_folder) / "Projetos Finalizados" / year / project_folder,
            ]
            
            # Encontra a pasta de origem
            source_path = None
            for path in possible_sources:
                if path.exists():
                    source_path = path
                    break
            
            if not source_path:
                logger.warning(f"Pasta do projeto não encontrada para mover: {project_folder}")
                return False
            
            # Define o caminho de destino
            if destination == "PROSPECTADOS":
                dest_path = Path(self.root_folder) / "Projetos Prospectados" / year / project_folder
            else:
                dest_path = Path(self.root_folder) / destination / year / project_folder
            
            # Se já está no destino correto, não faz nada
            if source_path == dest_path:
                logger.info(f"Pasta já está no destino correto: {dest_path}")
                return True
            
            # Cria o diretório de destino se não existir
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Move a pasta
            import shutil
            shutil.move(str(source_path), str(dest_path))
            logger.info(f"Pasta movida de {source_path} para {dest_path}")
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao mover pasta do projeto: {str(e)}")
            return False

    def copy_default_documents(self, base_path: str, project_number: str, template_opcao: str) -> None:
        """
        Copia documentos padrao para as pastas do projeto
        
        Args:
            base_path: Caminho base relativo (ex: Projetos Prospectados/2026/Projeto)
            project_number: Numero do projeto (ex: TC2602001)
            template_opcao: "Completa", "Simplificada" ou "Visita"
        """
        if not self.templates_path:
            logger.warning("Caminho de templates nao configurado. Documentos nao copiados.")
            return
        
        source_dir = Path(self.templates_path)
        if not source_dir.exists():
            logger.warning(f"Caminho de templates nao encontrado: {source_dir}")
            return
        
        dest_base = Path(self.root_folder) / base_path
        proposta_dir = dest_base / "01-PROPOSTA"
        
        proposta_doc_dest = proposta_dir / f"{project_number}-0.docx"
        proposta_xlsm_dest = proposta_dir / f"{project_number}-0.xlsm"
        
        def copy_file(source_name: str, dest_path: Path) -> None:
            source_path = source_dir / source_name
            if not source_path.exists():
                logger.warning(f"Arquivo template nao encontrado: {source_path}")
                return
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source_path, dest_path)
            logger.info(f"Arquivo copiado para: {dest_path}")
        
        template_opcao_normalizada = (template_opcao or "Completa").strip()
        if template_opcao_normalizada == "Completa":
            copy_file("TCxxxxxx-0.docx", proposta_doc_dest)
        elif template_opcao_normalizada == "Simplificada":
            copy_file("TCxxxxxx-0_Simplificada.docx", proposta_doc_dest)
        elif template_opcao_normalizada == "Visita":
            copy_file("Relatorio de Visita_V0.docx", proposta_dir / "RelatorioVisita.docx")
            copy_file("TCxxxxxx-0_Simplificada.docx", proposta_doc_dest)
        else:
            logger.warning(f"Opcao de template desconhecida: {template_opcao}")
        
        copy_file("TCxxxxxx-0.xlsm", proposta_xlsm_dest)


# Instância singleton do serviço
local_storage_service = LocalStorageService()
