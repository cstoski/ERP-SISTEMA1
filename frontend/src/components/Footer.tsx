import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <p className="footer-text">&copy; {currentYear} <strong>TAKT ERP</strong> - Todos os direitos reservados.</p>
        </div>
        <div className="footer-section footer-section-right">
          <p className="footer-text"><small>Versão 1.0.0 | Desenvolvido por Cristiano Stoski</small></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;