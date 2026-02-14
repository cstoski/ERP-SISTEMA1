import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-white py-3 mb-4 shadow-sm">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h1 className="h3 mb-0"><i className="bi bi-building me-2"></i>ERP Sistema</h1>
          </div>
          <div className="col-md-6 text-end">
            <p className="mb-0"><small>Sistema de Gestão Empresarial</small></p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;