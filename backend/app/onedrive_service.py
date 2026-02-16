"""
Serviço de integração com OneDrive usando Microsoft Graph API
"""
import logging
from typing import Optional, Dict, List
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from msal import ConfidentialClientApplication
import requests
from requests.adapters import HTTPAdapter
from app.config import settings

logger = logging.getLogger(__name__)


class OneDriveService:
    """Serviço para gerenciar arquivos e pastas no OneDrive"""
    
    def __init__(self):
        self.client_id = settings.ONEDRIVE_CLIENT_ID
        self.client_secret = settings.ONEDRIVE_CLIENT_SECRET
        self.tenant_id = settings.ONEDRIVE_TENANT_ID
        self.user_email = settings.ONEDRIVE_USER_EMAIL
        self.enabled = settings.ONEDRIVE_ENABLED
        self.root_folder = settings.ONEDRIVE_ROOT_FOLDER
        self.access_token: Optional[str] = None
        self._created_folders_cache: set = set()  # Cache de pastas já criadas
        self._session: Optional[requests.Session] = None  # Sessão HTTP reutilizável
        
        if self.enabled and not (self.client_id and self.client_secret and self.tenant_id and self.user_email):
            logger.warning("OneDrive está habilitado mas credenciais não foram configuradas!")
            self.enabled = False
    
    def _get_access_token(self) -> Optional[str]:
        """Obtém token de acesso usando autenticação de aplicativo"""
        if not self.enabled:
            return None
            
        try:
            app = ConfidentialClientApplication(
                self.client_id,
                authority=f"https://login.microsoftonline.com/{self.tenant_id}",
                client_credential=self.client_secret,
            )
            
            result = app.acquire_token_for_client(
                scopes=["https://graph.microsoft.com/.default"]
            )
            
            if "access_token" in result:
                self.access_token = result["access_token"]
                return self.access_token
            else:
                logger.error(f"Erro ao obter token: {result.get('error_description')}")
                return None
                
        except Exception as e:
            logger.error(f"Erro na autenticação OneDrive: {str(e)}")
            return None
    
    def _get_session(self) -> requests.Session:
        """Retorna sessão HTTP reutilizável com pool de conexões otimizado"""
        if self._session is None:
            self._session = requests.Session()
            # Aumenta o pool de conexões para suportar mais requisições paralelas
            adapter = HTTPAdapter(
                pool_connections=30,
                pool_maxsize=30,
                max_retries=3
            )
            self._session.mount('https://', adapter)
        return self._session
    
    def _get_headers(self) -> Dict[str, str]:
        """Retorna headers para requisições à API"""
        if not self.access_token:
            self._get_access_token()
        
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
    
    def create_folder(self, folder_path: str, parent_path: str = "") -> Optional[Dict]:
        """
        Cria uma pasta no OneDrive (suporta criação hierárquica)
        
        Args:
            folder_path: Nome da pasta ou caminho com barras para criar hierarquia
            parent_path: Caminho da pasta pai (opcional)
        
        Returns:
            Dict com informações da pasta criada ou None em caso de erro
        """
        if not self.enabled:
            logger.info(f"OneDrive desabilitado. Pasta não criada: {folder_path}")
            return None
        
        try:
            # Se folder_path contém barras, criar hierarquia
            if '/' in folder_path or '\\' in folder_path:
                # Normaliza separadores para /
                folder_path = folder_path.replace('\\', '/')
                parts = folder_path.split('/')
                
                # Cria cada parte da hierarquia
                current_parent = parent_path
                result = None
                for part in parts:
                    # Monta o caminho completo para verificar cache
                    if current_parent:
                        full_check_path = f"{current_parent}/{part}"
                    else:
                        full_check_path = part
                    
                    # Verifica se já foi criada nesta sessão
                    if full_check_path not in self._created_folders_cache:
                        result = self._create_single_folder(part, current_parent)
                        if result:
                            self._created_folders_cache.add(full_check_path)
                    
                    # Atualiza o caminho pai para a próxima iteração
                    current_parent = full_check_path
                
                return result
            else:
                # Pasta simples, criação direta
                full_check_path = f"{parent_path}/{folder_path}" if parent_path else folder_path
                
                if full_check_path not in self._created_folders_cache:
                    result = self._create_single_folder(folder_path, parent_path)
                    if result:
                        self._created_folders_cache.add(full_check_path)
                    return result
                else:
                    logger.debug(f"Pasta já criada (cache): {full_check_path}")
                    return {"name": folder_path}  # Retorna dict simples indicando sucesso
                
        except Exception as e:
            logger.error(f"Exceção ao criar pasta {folder_path}: {str(e)}")
            return None
    
    def _create_single_folder(self, folder_name: str, parent_path: str = "") -> Optional[Dict]:
        """
        Cria uma única pasta no OneDrive
        
        Args:
            folder_name: Nome da pasta (não pode conter /)
            parent_path: Caminho da pasta pai
        
        Returns:
            Dict com informações da pasta ou None
        """
        try:
            # Monta o caminho completo
            if parent_path:
                full_path = f"{self.root_folder}/{parent_path}"
            else:
                full_path = self.root_folder
            
            url = f"https://graph.microsoft.com/v1.0/users/{self.user_email}/drive/root:/{full_path}:/children"
            
            data = {
                "name": folder_name,
                "folder": {},
                "@microsoft.graph.conflictBehavior": "rename"
            }
            
            session = self._get_session()
            response = session.post(url, headers=self._get_headers(), json=data)
            
            if response.status_code in [200, 201]:
                logger.info(f"Pasta criada com sucesso: {full_path}/{folder_name}")
                return response.json()
            elif response.status_code == 401:
                # Token expirado, tenta renovar e tentar novamente
                self._get_access_token()
                response = session.post(url, headers=self._get_headers(), json=data)
                if response.status_code in [200, 201]:
                    return response.json()
            
            logger.error(f"Erro ao criar pasta: {response.status_code} - {response.text}")
            return None
            
        except Exception as e:
            logger.error(f"Exceção ao criar pasta {folder_name}: {str(e)}")
            return None
    
    def upload_file(self, file_path: str, file_data: bytes, folder_path: str = "") -> Optional[Dict]:
        """
        Faz upload de um arquivo para o OneDrive
        
        Args:
            file_path: Nome do arquivo
            file_data: Conteúdo do arquivo em bytes
            folder_path: Caminho da pasta de destino
        
        Returns:
            Dict com informações do arquivo ou None em caso de erro
        """
        if not self.enabled:
            logger.info(f"OneDrive desabilitado. Arquivo não enviado: {file_path}")
            return None
        
        try:
            # Monta o caminho completo
            if folder_path:
                full_path = f"{self.root_folder}/{folder_path}/{file_path}"
            else:
                full_path = f"{self.root_folder}/{file_path}"
            
            url = f"https://graph.microsoft.com/v1.0/users/{self.user_email}/drive/root:/{full_path}:/content"
            
            session = self._get_session()
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/octet-stream'
            }
            
            response = session.put(url, headers=headers, data=file_data)
            
            if response.status_code in [200, 201]:
                logger.info(f"Arquivo enviado com sucesso: {full_path}")
                return response.json()
            elif response.status_code == 401:
                # Token expirado
                self._get_access_token()
                headers['Authorization'] = f'Bearer {self.access_token}'
                response = session.put(url, headers=headers, data=file_data)
                if response.status_code in [200, 201]:
                    return response.json()
            
            logger.error(f"Erro ao enviar arquivo: {response.status_code} - {response.text}")
            return None
            
        except Exception as e:
            logger.error(f"Exceção ao enviar arquivo {file_path}: {str(e)}")
            return None
    
    def _create_folders_parallel(self, folders: List[str], parent_path: str = "", max_workers: int = 30) -> None:
        """
        Cria múltiplas pastas em paralelo, organizadas por nível hierárquico
        
        Args:
            folders: Lista de caminhos de pastas para criar
            parent_path: Caminho pai base
            max_workers: Número máximo de threads paralelas
        """
        # Agrupa pastas por nível de profundidade
        folders_by_level = {}
        for folder in folders:
            level = folder.count('/')
            if level not in folders_by_level:
                folders_by_level[level] = []
            folders_by_level[level].append(folder)
        
        # Cria cada nível em sequência, mas pastas do mesmo nível em paralelo
        for level in sorted(folders_by_level.keys()):
            level_folders = folders_by_level[level]
            
            # Cria pastas deste nível em paralelo
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = {
                    executor.submit(self.create_folder, folder, parent_path): folder 
                    for folder in level_folders
                }
                
                # Aguarda todas as pastas deste nível serem criadas
                for future in as_completed(futures):
                    folder = futures[future]
                    try:
                        future.result()
                    except Exception as e:
                        logger.error(f"Erro ao criar pasta {folder}: {str(e)}")
    
    def create_project_structure(self, project_number: str, project_name: str, client_sigla: str) -> bool:
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
            logger.info(f"OneDrive desabilitado. Estrutura não criada para projeto: {project_name}")
            return False
        
        try:
            # Limpa o cache para este novo projeto
            self._created_folders_cache.clear()
            
            # Obtém o ano atual
            current_year = str(datetime.now().year)
            
            # Cria pasta do ano (se não existir)
            year_folder_result = self.create_folder(current_year)
            if not year_folder_result:
                logger.error(f"Falha ao criar pasta do ano {current_year}")
                return False
            
            # Formato: NUMERO - SIGLA - NOME
            # Exemplo: TC2602001 - EMP - Teste de Projeto
            project_folder = f"{project_number} - {client_sigla} - {project_name}"
            
            # Cria pasta raiz do projeto dentro da pasta do ano
            result = self.create_folder(project_folder, parent_path=current_year)
            if not result:
                return False
            
            # Estrutura de pastas baseada no VB
            folders = [
                # Pastas principais
                "01-PROPOSTA",
                "02-DESENVOLVIMENTO",
                "03-GESTAO",
                
                # Estrutura Proposta Comercial
                "01-PROPOSTA/1.1-INFO_CLIENTE",
                "01-PROPOSTA/1.2-FOTOS",
                "01-PROPOSTA/1.3-DOCUMENTOS",
                "01-PROPOSTA/1.4-ORÇAMENTOS",
                
                # Estrutura Desenvolvimento
                "02-DESENVOLVIMENTO/2.1-INFO_CLIENTE",
                "02-DESENVOLVIMENTO/2.2-DOCUMENTOS",
                "02-DESENVOLVIMENTO/2.2-DOCUMENTOS/2.2.1-DESCRITIVOS",
                "02-DESENVOLVIMENTO/2.2-DOCUMENTOS/2.2.2-LISTA_MATERIAIS",
                "02-DESENVOLVIMENTO/2.2-DOCUMENTOS/2.2.3-MANUAIS_EQUIPAMENTOS",
                "02-DESENVOLVIMENTO/2.2-DOCUMENTOS/2.2.4-FLUXOGRAMAS",
                "02-DESENVOLVIMENTO/2.2-DOCUMENTOS/2.2.5-MANUAIS_PROJETO",
                "02-DESENVOLVIMENTO/2.3-PROJETO_ELETRICO",
                "02-DESENVOLVIMENTO/2.3-PROJETO_ELETRICO/2.3.1-DIAGRAMA",
                "02-DESENVOLVIMENTO/2.3-PROJETO_ELETRICO/2.3.2-LAYOUT",
                "02-DESENVOLVIMENTO/2.3-PROJETO_ELETRICO/2.3.3-MEMORIA_CALCULO",
                "02-DESENVOLVIMENTO/2.4-PROJETO_MECANICO",
                "02-DESENVOLVIMENTO/2.5-CLP",
                "02-DESENVOLVIMENTO/2.6-IHM",
                "02-DESENVOLVIMENTO/2.7-SUPERVISORIO",
                "02-DESENVOLVIMENTO/2.8-FOTOS",
                "02-DESENVOLVIMENTO/2.9-COMUNICACAO",
                "02-DESENVOLVIMENTO/2.10-SOFTWARES",
                
                # Estrutura Gestão
                "03-GESTAO/3.1-PEDIDO_COMPRA",
                "03-GESTAO/3.2-CRONOGRAMA",
                "03-GESTAO/3.3-DESPESAS",
                "03-GESTAO/3.3-DESPESAS/3.3.1-ORÇAMENTOS",
                "03-GESTAO/3.3-DESPESAS/3.3.2-PEDIDOS_COMPRA",
                "03-GESTAO/3.3-DESPESAS/3.3.3-NOTAS_FISCAIS",
                "03-GESTAO/3.4-NOTAS_FATURAMENTO",
            ]
            
            # Cria cada pasta na hierarquia em paralelo por nível
            # O parent_path inclui ano/projeto (ex: 2026/0001_NomeDoProjeto)
            full_parent_path = f"{current_year}/{project_folder}"
            self._create_folders_parallel(folders, parent_path=full_parent_path)
            
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
            
            self.upload_file(
                "README.txt",
                readme_content.encode('utf-8'),
                folder_path=full_parent_path
            )
            
            logger.info(f"Estrutura de pastas criada com sucesso para projeto {project_number}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao criar estrutura do projeto: {str(e)}")
            return False


# Instância singleton do serviço
onedrive_service = OneDriveService()
