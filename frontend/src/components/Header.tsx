import React from 'react';
import { useLocation } from 'react-router-dom';

// Função para obter o título da página com base no caminho da URL
const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Dashboard';
    case '/pessoas-juridicas':
      return 'Pessoas Jurídicas';
    default:
      return 'Página não encontrada';
  }
};

const Header: React.FC = () => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <div className="header-user">
        <span>Usuário</span>
        <div className="user-avatar">U</div>
      </div>
    </header>
  );
};

export default Header;