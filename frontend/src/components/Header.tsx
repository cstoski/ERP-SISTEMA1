import React from 'react';
import { useLocation } from 'react-router-dom';

// Função para obter o título da página com base no caminho da URL
const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Dashboard';
    case '/pessoas-juridicas':
      return 'Empresas';
    case '/contatos':
      return 'Contatos';
    default:
      if (pathname.includes('pessoas-juridicas/nova')) return 'Nova Empresa';
      if (pathname.includes('pessoas-juridicas/editar')) return 'Editar Empresa';
      if (pathname.includes('contatos/novo')) return 'Novo Contato';
      if (pathname.includes('contatos/editar')) return 'Editar Contato';
      return 'Página não encontrada';
  }
};

const Header: React.FC = () => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  const currentDate = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        <span className="header-date">{currentDate}</span>
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
              window.location.href = '/login';
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;