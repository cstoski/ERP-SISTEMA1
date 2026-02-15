import React from 'react';
import { useLocation } from 'react-router-dom';

// Função para obter o título da página com base no caminho da URL
const getPageTitle = (pathname: string): string => {
  const entities = [
    { prefix: '/pessoas-juridicas', singular: 'Empresa', plural: 'Empresas' },
    { prefix: '/contatos', singular: 'Contato', plural: 'Contatos' },
    { prefix: '/funcionarios', singular: 'Funcionário', plural: 'Funcionários' },
    { prefix: '/projetos', singular: 'Projeto', plural: 'Projetos' },
    { prefix: '/faturamentos', singular: 'Faturamento', plural: 'Faturamentos' },
  ];

  if (pathname === '/') return 'Dashboard';
  if (pathname === '/usuarios') return 'Gerenciamento de Usuários';
  if (pathname === '/alterar-senha') return 'Meu Perfil';
  if (pathname === '/reset-senha') return 'Reset de Senha';
  if (pathname === '/login') return 'Login';
  if (pathname === '/signup') return 'Cadastro';
  if (pathname === '/cronogramas') return 'Cronogramas';

  for (const entity of entities) {
    if (pathname === entity.prefix) return entity.plural;
    if (pathname.startsWith(`${entity.prefix}/nova`)) return `Nova ${entity.singular}`;
    if (pathname.startsWith(`${entity.prefix}/novo`)) return `Novo ${entity.singular}`;
    if (pathname.startsWith(`${entity.prefix}/editar`)) return `Editar ${entity.singular}`;
  }

  return 'Painel';
};

type HeaderProps = {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed, onToggleSidebar }) => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="btn-toggle"
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="user-name">{localStorage.getItem('username') || 'Usuário'}</span>
          <div className="user-avatar">{(localStorage.getItem('username') || 'U').charAt(0).toUpperCase()}</div>
          <button
            className="btn-logout"
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('username');
              localStorage.removeItem('user_role');
              window.location.href = '/login';
            }}
            title="Sair"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;