import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { cronogramaService, Cronograma, Historico } from '../services/cronogramaService';

const formatDateTime = (isoString: string) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Funções para lidar com números no formato brasileiro (vírgula como decimal)
const parseNumberBR = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  // Remove espaços e substitui vírgula por ponto
  const normalized = value.trim().replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

const formatNumberBR = (value: number): string => {
  if (isNaN(value)) return '0';
  return value.toString().replace('.', ',');
};

const Cronogramas: React.FC = () => {
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCronograma, setSelectedCronograma] = useState<Cronograma | null>(null);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [percentual, setPercentual] = useState<string>('0');
  const [observacoes, setObservacoes] = useState<string>('');
  const [filterTecnico, setFilterTecnico] = useState<string>('');
  const [filterPrazoStatus, setFilterPrazoStatus] = useState<string>('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cronogramaService.listarTodos();
      setCronogramas(data);
    } catch (err: any) {
      console.error('Erro ao carregar cronogramas:', err);
      setError(err.response?.data?.detail || 'Erro ao carregar cronogramas');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalhes = async (cronograma: Cronograma) => {
    setSelectedCronograma(cronograma);
    try {
      const hist = await cronogramaService.obterHistorico(cronograma.id);
      setHistorico(hist);
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err);
      setHistorico([]);
    }
    setIsModalOpen(true);
  };

  const handleEditar = (cronograma: Cronograma) => {
    setSelectedCronograma(cronograma);
    setPercentual(formatNumberBR(cronograma.percentual_conclusao));
    setObservacoes(cronograma.observacoes || '');
    setIsEditModalOpen(true);
  };

  const handleSalvar = async () => {
    if (!selectedCronograma) return;

    try {
      await cronogramaService.atualizar(selectedCronograma.id, {
        percentual_conclusao: parseNumberBR(percentual),
        observacoes: observacoes || undefined
      });
      setIsEditModalOpen(false);
      carregarDados();
    } catch (err: any) {
      console.error('Erro ao atualizar cronograma:', err);
      alert(err.response?.data?.detail || 'Erro ao atualizar cronograma');
    }
  };

  const getPrazoStatusText = (cronograma: Cronograma) => {
    if (cronograma.dias_restantes === null || cronograma.dias_restantes === undefined) {
      return 'Sem prazo definido';
    }
    if (cronograma.dias_restantes < 0) {
      return `${Math.abs(cronograma.dias_restantes)} dias de atraso`;
    }
    return `${cronograma.dias_restantes} dias restantes`;
  };

  // Calcular estatísticas
  const tecnicosUnicos = Array.from(new Set(cronogramas.map(c => c.tecnico))).sort();
  const statusPrazoUnicos = ['No prazo', 'Urgente', 'Atrasado'];
  
  // Aplicar filtros
  const cronogramasFiltrados = cronogramas.filter(c => {
    if (filterTecnico && c.tecnico !== filterTecnico) return false;
    if (filterPrazoStatus && c.prazo_status !== filterPrazoStatus) return false;
    return true;
  });
  
  const totalProjetos = cronogramasFiltrados.length;
  const projetosAtrasados = cronogramasFiltrados.filter(c => c.prazo_status === 'Atrasado').length;
  const projetosNoPrazo = cronogramasFiltrados.filter(c => c.prazo_status === 'No prazo').length;
  const mediaPercentual = totalProjetos > 0 
    ? (cronogramasFiltrados.reduce((sum, c) => sum + c.percentual_conclusao, 0) / totalProjetos).toFixed(1)
    : '0';

  if (loading) {
    return <div className="card-body">Carregando...</div>;
  }

  if (error) {
    return (
      <>
        <div className="page-header">
          <h2>Cronogramas</h2>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="form-error-message">{error}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h2>Cronogramas</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalProjetos}</div>
          <div className="stat-label">Projetos em Execução</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-value">{projetosNoPrazo}</div>
          <div className="stat-label">No Prazo</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-value">{projetosAtrasados}</div>
          <div className="stat-label">Atrasados</div>
        </div>
        <div className="stat-card stat-card-primary">
          <div className="stat-value">{mediaPercentual}%</div>
          <div className="stat-label">Média de Conclusão</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header filter-header">
          <div className="filters-container">
            <select 
              className="form-input filter-select" 
              value={filterTecnico} 
              onChange={(e) => setFilterTecnico(e.target.value)}
            >
              <option value="">Todos os técnicos</option>
              {tecnicosUnicos.map(tecnico => (
                <option key={tecnico} value={tecnico}>{tecnico}</option>
              ))}
            </select>
            <select 
              className="form-input filter-select" 
              value={filterPrazoStatus} 
              onChange={(e) => setFilterPrazoStatus(e.target.value)}
            >
              <option value="">Todos os status do prazo</option>
              {statusPrazoUnicos.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {(filterTecnico || filterPrazoStatus) && (
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setFilterTecnico('');
                  setFilterPrazoStatus('');
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          {cronogramasFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <p>Nenhum projeto em execução encontrado{(filterTecnico || filterPrazoStatus) ? ' com os filtros aplicados' : ''}.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <style>{`
                .table-compact td,
                .table-compact th {
                  padding: 0.4rem !important;
                  vertical-align: middle !important;
                }
              `}</style>
              <table className="table table-compact" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Projeto</th>
                    <th>Cliente</th>
                    <th>Nome</th>
                    <th>Técnico</th>
                    <th>% Conclusão</th>
                    <th>Status do Prazo</th>
                    <th>Atualizado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {cronogramasFiltrados.map((cronograma) => (
                    <tr key={cronograma.id}>
                      <td><strong>{cronograma.projeto_numero}</strong></td>
                      <td>{cronograma.cliente_nome}</td>
                      <td>{cronograma.projeto_nome}</td>
                      <td>{cronograma.tecnico}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            flex: 1, 
                            backgroundColor: '#e5e7eb', 
                            borderRadius: '9999px', 
                            height: '8px',
                            minWidth: '100px'
                          }}>
                            <div style={{ 
                              backgroundColor: '#3b82f6', 
                              height: '100%', 
                              borderRadius: '9999px',
                              width: `${cronograma.percentual_conclusao}%`,
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                          <span style={{ fontWeight: 600, minWidth: '45px' }}>
                            {cronograma.percentual_conclusao}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          cronograma.prazo_status === 'No prazo' ? 'badge-success' : 
                          cronograma.prazo_status === 'Urgente' ? 'badge-warning' :
                          cronograma.prazo_status === 'Atrasado' ? 'badge-danger' :
                          'badge-gray'
                        }`}>
                          {cronograma.prazo_status}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                          {getPrazoStatusText(cronograma)}
                        </div>
                      </td>
                      <td>{formatDateTime(cronograma.atualizado_em)}</td>
                      <td>
                        <div className="actions">
                          <button className="btn-action" title="Atualizar" onClick={() => handleEditar(cronograma)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button className="btn-action" title="Histórico" onClick={() => handleVerDetalhes(cronograma)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {isEditModalOpen && selectedCronograma && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Atualizar Cronograma - ${selectedCronograma.projeto_numero}`}
        >
          <div className="form-group">
            <label className="form-label">
              Percentual de Conclusão (%)
            </label>
            <input
              type="text"
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
              className="form-input"
              placeholder="0,00"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              className="form-input"
              placeholder="Digite observações sobre o andamento do projeto..."
            />
          </div>
          <div className="form-actions">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              className="btn btn-primary"
            >
              Salvar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal de Histórico */}
      {isModalOpen && selectedCronograma && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Histórico - ${selectedCronograma.projeto_numero}`}
        >
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <h3 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>{selectedCronograma.projeto_nome}</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Cliente: {selectedCronograma.cliente_nome}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              Status Atual: {selectedCronograma.percentual_conclusao}% concluído
            </p>
            {selectedCronograma.observacoes && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Observação Atual: {selectedCronograma.observacoes}
              </p>
            )}
          </div>

          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Histórico de Alterações</h4>
            {historico.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Nenhuma alteração registrada ainda.</p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {historico.map((h) => (
                  <div key={h.id} style={{ 
                    borderLeft: '4px solid #3b82f6', 
                    paddingLeft: '1rem', 
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    backgroundColor: '#f9fafb',
                    marginBottom: '0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          Percentual: {h.percentual_conclusao}%
                        </p>
                        {h.observacoes && (
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>{h.observacoes}</p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af', minWidth: '140px' }}>
                        <p>{formatDateTime(h.criado_em)}</p>
                        {h.criado_por && <p>por {h.criado_por}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default Cronogramas;
