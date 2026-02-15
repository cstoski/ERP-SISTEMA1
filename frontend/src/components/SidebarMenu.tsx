import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

interface SidebarMenuProps {
  menuItems: MenuItem[];
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ menuItems }) => {
  const location = useLocation();

  return (
    <ul className="sidebar-nav">
      {menuItems.map((item) => (
        <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
          <Link to={item.path} className="nav-link">
            <i className={`bi ${item.icon}`}></i>
            <span className="ms-3">{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SidebarMenu;