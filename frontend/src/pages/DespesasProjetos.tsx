import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import despesaProjetoService, { DespesaProjeto } from '../services/despesaProjetoService';

const DespesasProjetos: React.FC = () => {
  const navigate = useNavigate();
  const [despesas, setDespesas] = useState<DespesaProjeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      setLoading(true);
      const response = await despesaProjetoService.listar();
      setDespesas(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao carregar despesas:', err);
      setError('Erro ao carregar despesas de projetos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (despesa: DespesaProjeto) => {
    if (!window.confirm(`Deseja realmente excluir a despesa ${despesa.numero_despesa}?`)) {
      return;
    }

    try {
      await despesaProjetoService.deletar(despesa.id);
      setDespesas(despesas.filter(d => d.id !== despesa.id));
      alert('Despesa excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir despesa:', err);
      alert('Erro ao excluir despesa.');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      'Rascunho': 'badge-secondary',
      'Enviado': 'badge-info',
      'Confirmado': 'badge-success',
      'Parcialmente Entregue': 'badge-warning',
      'Entregue': 'badge-primary',
      'Cancelado': 'badge-danger',
    };
    return statusClasses[status] || 'badge-secondary';
  };

  const filtradas = despesas.filter(despesa => {
    const termo = searchTerm.toLowerCase();
    const matchSearch = !searchTerm ||
      despesa.numero_despesa.toLowerCase().includes(termo) ||
      despesa.projeto?.numero.toLowerCase().includes(termo) ||
      despesa.projeto?.nome.toLowerCase().includes(termo) ||
      despesa.fornecedor?.razao_social.toLowerCase().includes(termo);
    
    const matchStatus = !filterStatus || despesa.status === filterStatus;
    
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <h2>Despesas de Projetos</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/despesas-projetos/novo')}>
            Novo
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header filter-header">
          <div className="filters-container">
            <div className="filter-item">
              <label>Buscar</label>
              <input
                type="text"
                className="form-input"
                placeholder="Número, projeto ou fornecedor"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-item">
              <label>Status</label>
              <select
                className="form-input"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Rascunho">Rascunho</option>
                <option value="Enviado">Enviado</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Parcialmente Entregue">Parcialmente Entregue</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-body">
          {loading && <p>Carregando...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && (
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
                    <th style={{ width: '150px' }}>Número</th>
                    <th>Projeto</th>
                    <th>Fornecedor</th>
                    <th>Técnico</th>
                    <th>Status</th>
                    <th style={{ width: '100px' }}>Data Pedido</th>
                    <th style={{ width: '100px' }}>Previsão</th>
                    <th style={{ width: '100px' }}>Valor Frete</th>
                    <th style={{ width: '120px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map(despesa => (
                    <tr key={despesa.id}>
                      <td><strong>{despesa.numero_despesa}</strong></td>
                      <td>
                        {despesa.projeto?.numero} - {despesa.projeto?.nome}
                      </td>
                      <td>{despesa.fornecedor?.razao_social}</td>
                      <td>{despesa.tecnico_responsavel?.nome}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(despesa.status)}`}>
                          {despesa.status}
                        </span>
                      </td>
                      <td>{formatDate(despesa.data_pedido)}</td>
                      <td>{formatDate(despesa.previsao_entrega || '')}</td>
                      <td>{formatCurrency(despesa.valor_frete)}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="btn-action"
                            title="Editar"
                            onClick={() => navigate(`/despesas-projetos/editar/${despesa.id}`)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button
                            className="btn-action"
                            title="Excluir"
                            onClick={() => handleDelete(despesa)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtradas.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center">
                        Nenhuma despesa encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DespesasProjetos;
