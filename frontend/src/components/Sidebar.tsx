import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">TAKT ERP</h2>
      <nav>
        <ul>
          <li>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/pessoas-juridicas">
              Empresas
            </NavLink>
          </li>
          <li>
            <NavLink to="/contatos">
              Contatos
            </NavLink>
          </li>
          <li>
            <NavLink to="/funcionarios">
              Funcionários
            </NavLink>
          </li>
          <li>
            <NavLink to="/projetos">
              Projetos
            </NavLink>
          </li>
          <li>
            <NavLink to="/faturamentos">
              Faturamentos
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;