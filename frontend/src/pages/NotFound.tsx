import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="text-center">
      <div className="error mx-auto" data-text="404">404</div>
      <p className="lead text-gray-800 mb-5">Página Não Encontrada</p>
      <p className="text-gray-500 mb-0">Parece que você encontrou uma falha na matrix...</p>
      <Link to="/dashboard">&larr; Voltar para o Dashboard</Link>
    </div>
  );
};

export default NotFound;