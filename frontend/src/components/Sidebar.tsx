import React from 'react';
import { NavLink } from 'react-router-dom';

type SidebarProps = {
  isCollapsed: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const userRole = localStorage.getItem('user_role') || 'user';
  const isAdmin = userRole === 'admin';

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <h2 className="sidebar-title">TAKT ERP</h2>
      <nav>
        <ul>
          <li>
            <NavLink to="/" end data-short="D">
              <span className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </span>
              <span className="nav-label">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/pessoas-juridicas" data-short="E">
              <span className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18"></path>
                  <path d="M5 21V7l7-4 7 4v14"></path>
                  <path d="M9 21v-6h6v6"></path>
                </svg>
              </span>
              <span className="nav-label">Empresas</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/contatos" data-short="C">
              <span className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                  <circle cx="10" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              <span className="nav-label">Contatos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/funcionarios" data-short="F">
              <span className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              <span className="nav-label">Funcionários</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/projetos" data-short="P">
              <span className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="14" rx="2" ry="2"></rect>
                  <path d="M7 20h10"></path>
                </svg>
              </span>
              <span className="nav-label">Projetos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/produtos-servicos" data-short="PS">
              <span className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <path d="M3.27 6.96L12 12.01l8.73-5.05"></path>
                  <path d="M12 22.08V12"></path>
                </svg>
              </span>
              <span className="nav-label">Produtos/Serviços</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/faturamentos" data-short="Fa">
              <span className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1v22"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </span>
              <span className="nav-label">Faturamentos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/cronogramas" data-short="Cr">
              <span className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </span>
              <span className="nav-label">Cronogramas</span>
            </NavLink>
          </li>
          {isAdmin && (
            <li>
              <NavLink to="/usuarios" data-short="U">
                <span className="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <path d="M20 8v6"></path>
                    <path d="M23 11h-6"></path>
                  </svg>
                </span>
                <span className="nav-label">Gerenciamento de Usuários</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/alterar-senha" data-short="M">
              <span className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <span className="nav-label">Meu Perfil</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;