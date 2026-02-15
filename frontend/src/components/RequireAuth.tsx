import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface Props {
  children: JSX.Element;
}

const RequireAuth: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const location = useLocation();
  
  console.log('[RequireAuth] Verificando autenticação');
  console.log('[RequireAuth] Caminho:', location.pathname);
  console.log('[RequireAuth] Token encontrado:', !!token);
  console.log('[RequireAuth] Token value:', token ? token.substring(0, 20) + '...' : 'null');
  
  if (!token) {
    console.log('[RequireAuth] ❌ SEM TOKEN - Redirecionando para /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  console.log('[RequireAuth] ✅ TOKEN OK - Permitindo acesso');
  return children;
};

export default RequireAuth;
