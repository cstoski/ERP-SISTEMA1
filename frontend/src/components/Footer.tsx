import React, { useEffect, useState } from 'react';
import systemService, { SystemInfo } from '../services/systemService';
import statusService, { StatusInfo } from '../services/statusService';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [switchMessage, setSwitchMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);


  useEffect(() => {
    fetchSystemInfo();
    fetchStatusInfo();
    const interval = setInterval(() => {
      fetchStatusInfo();
    }, 10000); // Atualiza status a cada 10s
    return () => clearInterval(interval);
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const info = await systemService.getSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error('Erro ao buscar informações do sistema:', error);
    }
  };

  const fetchStatusInfo = async () => {
    try {
      const info = await statusService.getStatusInfo();
      setStatusInfo(info);
    } catch (error) {
      setStatusInfo(null);
    }
  };

  const handleSwitchEnvironment = async (newEnv: 'development' | 'production') => {
    if (!systemInfo) return;
    
    // Se já está no ambiente solicitado, não faz nada
    if (systemInfo.environment.toLowerCase() === newEnv) {
      setSwitchMessage({
        type: 'error',
        text: `Já está no ambiente ${newEnv.toUpperCase()}`
      });
      return;
    }

    setSwitchLoading(true);
    setSwitchMessage(null);

    try {
      const response = await systemService.switchEnvironment(newEnv);
      setSwitchMessage({
        type: 'success',
        text: `${response.message}\n\n${response.warning}`
      });
      
      // Não atualiza o systemInfo aqui porque as mudanças só são aplicadas após reiniciar o servidor
    } catch (error: any) {
      setSwitchMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erro ao alternar ambiente'
      });
    } finally {
      setSwitchLoading(false);
    }
  };

  const getEnvironmentBadge = () => {
    if (!systemInfo) return null;
    
    const isDev = systemInfo.environment.toLowerCase() === 'development';
    const badgeClass = isDev ? 'badge-warning' : 'badge-success';
    const badgeText = isDev ? 'DEV' : 'PROD';
    
    return (
      <button 
        className={`badge ${badgeClass} ml-2`} 
        style={{ 
          fontSize: '0.7rem', 
          cursor: 'pointer',
          border: 'none',
          padding: '0.25rem 0.5rem'
        }}
        onClick={() => setShowModal(true)}
        title="Clique para alternar ambiente"
      >
        {badgeText} <i className="fas fa-sync-alt ml-1" style={{ fontSize: '0.6rem' }}></i>
      </button>
    );
  };

  const getDatabaseInfo = () => {
    if (!systemInfo) return null;
    
    return (
      <span className="ml-3" style={{ fontSize: '0.75rem', color: '#6c757d' }}>
        <i className="fas fa-database mr-1"></i>
        {systemInfo.database_type}
      </span>
    );
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <p className="footer-text">
              &copy; {currentYear} <strong>TAKT ERP</strong> - Todos os direitos reservados.
              {getEnvironmentBadge()}
              {getDatabaseInfo()}
              {statusInfo && (
                <span className="ml-3" style={{ fontSize: '0.75rem' }}>
                  <i className="fas fa-server mr-1" title="Servidores backend"></i>
                  {statusInfo.server_count} servidor{statusInfo.server_count === 1 ? '' : 'es'} backend
                </span>
              )}
            </p>
          </div>
          <div className="footer-section footer-section-right">
            <p className="footer-text"><small>Versão 1.0.0 | Desenvolvido por Cristiano Stoski</small></p>
          </div>
        </div>
      </footer>

      {/* Modal de Alternância de Ambiente */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-exchange-alt mr-2"></i>
                Alternar Ambiente
              </h5>
              <button 
                className="close-button" 
                onClick={() => setShowModal(false)}
                aria-label="Fechar"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <p className="mb-3">
                <strong>Ambiente Atual:</strong> {systemInfo?.environment.toUpperCase()}
              </p>
              <p className="mb-3">
                <strong>Banco Atual:</strong> {systemInfo?.database_type}
              </p>
              
              {switchMessage && (
                <div className={`alert alert-${switchMessage.type} mb-3`} style={{ whiteSpace: 'pre-line' }}>
                  {switchMessage.text}
                </div>
              )}

              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-warning"
                  onClick={() => handleSwitchEnvironment('development')}
                  disabled={switchLoading || systemInfo?.environment.toLowerCase() === 'development'}
                  style={{ minWidth: '120px' }}
                >
                  {switchLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-code mr-2"></i>
                      Development
                    </>
                  )}
                </button>
                
                <button
                  className="btn btn-success"
                  onClick={() => handleSwitchEnvironment('production')}
                  disabled={switchLoading || systemInfo?.environment.toLowerCase() === 'production'}
                  style={{ minWidth: '120px' }}
                >
                  {switchLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-rocket mr-2"></i>
                      Production
                    </>
                  )}
                </button>
              </div>

              <div className="alert alert-info mt-3" style={{ fontSize: '0.85rem' }}>
                <i className="fas fa-info-circle mr-2"></i>
                <strong>Importante:</strong> Após alternar, você deve reiniciar o servidor backend manualmente para que as mudanças tenham efeito.
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;