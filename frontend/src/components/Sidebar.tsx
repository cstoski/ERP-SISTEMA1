import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">TAKT ERP</h2>
      <nav>
        <ul>
          <li>
            {/* O NavLink adiciona a classe 'active' automaticamente */}
            <NavLink to="/" end>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/pessoas-juridicas">
              Pessoas Jurídicas
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;