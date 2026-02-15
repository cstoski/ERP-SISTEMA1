import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white py-3 mt-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0">&copy; 2026 TAKT CONTROL AUTOMAÇÃO. Todos os direitos reservados.</p>
          </div>
          <div className="col-md-6 text-end">
            <p className="mb-0"><small>Versão 1.0.0 | Desenvolvido por Cristiano Stoski</small></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;