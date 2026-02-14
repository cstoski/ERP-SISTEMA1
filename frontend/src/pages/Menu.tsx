import React from 'react';
import { NavLink } from 'react-router-dom';

const Menu: React.FC = () => {
  return (
    <>
      <div className="sidebar-header">
        ERP-SISTEMA
      </div>
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/pessoas-juridicas">Pessoas Jurídicas</NavLink>
        </li>
        <li>
          <NavLink to="/contatos">Contatos</NavLink>
        </li>
      </ul>
    </>
  );
};

export default Menu;