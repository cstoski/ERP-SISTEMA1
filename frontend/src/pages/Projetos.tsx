import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal';
import projetoService from '../services/projetoService';
import faturamentoService from '../services/faturamentoService';
import funcionarioService from '../services/funcionarioService';
import { cronogramaService } from '../services/cronogramaService';

interface Projeto {
  id: number;
  numero: string;
  cliente_id: number;
  nome: string;
  contato_id: number;
  tecnico: string;
  valor_orcado: number;
  valor_venda: number;
  prazo_entrega_dias: number;
  data_pedido_compra?: string;
  status: string;
  criado_em: string;
  atualizado_em: string;
}

interface Cliente {
  id: number;
  razao_social: string;
  nome_fantasia: string;
}

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const Projetos: React.FC = () => {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [faturamentoTotalProjeto, setFaturamentoTotalProjeto] = useState<number>(0);
  const [faturamentosProjeto, setFaturamentosProjeto] = useState<any[]>([]);
  const [cronograma, setCronograma] = useState<any | null>(null);
  const [historicoCronograma, setHistoricoCronograma] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAno, setFilterAno] = useState<string>(new Date().getFullYear().toString());
  const [filterTecnico, setFilterTecnico] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string[]>(['Orçando', 'Orçamento Enviado', 'Aguardando pedido de compra']);

  // Extrair ano do número do projeto (TC26010XX -> 26 -> 2026)
  const extrairAno = (numero: string): number => {
    if (numero.startsWith('TC') && numero.length >= 4) {
      const anoAbreviado = parseInt(numero.substring(2, 4));
      // Se o ano abreviado é maior que 30 (assumindo ano atual 26), é 19xx, senão 20xx
      return anoAbreviado > 30 ? 1900 + anoAbreviado : 2000 + anoAbreviado;
    }
    return 0;
  };

  // Obter lista única de técnicos
  const tecnicosUnicos = Array.from(new Set(projetos.map(p => p.tecnico))).sort();

  // Obter lista única de anos
  const anosUnicos = Array.from(new Set(projetos.map(p => extrairAno(p.numero))))
    .filter(a => a > 0)
    .sort((a, b) => b - a); // Ordem decrescente

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Carregando projetos...');
      const token = localStorage.getItem('access_token');
      console.log('Token presente:', !!token);
      const [projetosData, clientesData] = await Promise.all([
        projetoService.listarTodos(),
        projetoService.listarClientes(),
      ]);
      console.log('Projetos carregados:', projetosData);
      console.log('Clientes carregados:', clientesData);
      setProjetos(projetosData);
      setClientes(clientesData);
    } catch (err: any) {
      console.error('Falha ao buscar dados:', err);
      console.error('Erro status:', err?.response?.status);
      console.error('Erro data:', err?.response?.data);
      const errorMessage = err?.response?.data?.detail || 'Não foi possível carregar os dados dos projetos.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getNomeCliente = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return 'N/A';
    return cliente.nome_fantasia || cliente.razao_social;
  };

  const handleView = (projeto: Projeto) => {
    setSelectedProjeto(projeto);
    setIsModalOpen(true);
    carregarFaturamentosProjeto(projeto.id);
    carregarCronogramaProjeto(projeto.id);
  };

  const carregarFaturamentosProjeto = async (projetoId: number) => {
    try {
      const [fats, tecs] = await Promise.all([faturamentoService.listarPorProjeto(projetoId), funcionarioService.listarTodos()]);
      const techMap: Record<number,string> = {};
      tecs.forEach((t:any)=> techMap[t.id] = t.nome);
      const enriched = fats.map((f:any) => ({...f, tecnico_nome: techMap[f.tecnico_id] || 'N/A'}));
      const total = enriched.reduce((s: number, f: any) => s + (Number(f.valor_faturado) || 0), 0);
      setFaturamentoTotalProjeto(total);
      setFaturamentosProjeto(enriched);
    } catch (err) {
      console.error('Erro ao carregar faturamentos do projeto', err);
      setFaturamentoTotalProjeto(0);
      setFaturamentosProjeto([]);
    }
  };

  const carregarCronogramaProjeto = async (projetoId: number) => {
    try {
      const cronogramaData = await cronogramaService.obterPorProjeto(projetoId);
      setCronograma(cronogramaData);
      
      if (cronogramaData && cronogramaData.id) {
        const historico = await cronogramaService.obterHistorico(cronogramaData.id);
        setHistoricoCronograma(historico);
      } else {
        setHistoricoCronograma([]);
      }
    } catch (err) {
      console.error('Erro ao carregar cronograma do projeto', err);
      setCronograma(null);
      setHistoricoCronograma([]);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/projetos/editar/${id}`);
  };

  const handleDelete = async (projeto: Projeto) => {
    if (window.confirm(`Tem certeza que deseja excluir o projeto "${projeto.numero} - ${projeto.nome}"?`)) {
      try {
        await projetoService.deletar(projeto.id);
        setProjetos(projetos.filter(p => p.id !== projeto.id));
      } catch (err) {
        console.error('Falha ao excluir:', err);
        alert('Não foi possível excluir o projeto.');
      }
    }
  };

  const handleExportPdf = async (projeto: Projeto) => {
    try {
      const blob = await projetoService.exportarPdf(projeto.id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `projeto_${projeto.numero}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar PDF do projeto');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await projetoService.exportarExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `projetos_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
    } catch (err) {
      console.error('Erro ao exportar:', err);
      alert('Erro ao exportar arquivo Excel');
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await projetoService.importarExcel(file);
      alert(response.message);
      if (response.erros && response.erros.length > 0) {
        alert(`Erros encontrados:\n${response.erros.join('\n')}`);
      }

      // Recarregar dados
      carregarDados();
    } catch (err: any) {
      console.error('Erro ao importar:', err);
      alert(err.response?.data?.detail || 'Erro ao importar arquivo');
    } finally {
      event.target.value = '';
    }
  };

  // Lista de status únicos (ordenada conforme fluxo do projeto)
  const statusUnicos = [
    'Orçando',
    'Orçamento Enviado',
    'Aguardando pedido de compra',
    'Teste de Viabilidade',
    'Em Execução',
    'Concluído',
    'Declinado'
  ];

  const filteredProjetos = projetos.filter(p => {
    const matchSearchTerm = 
      p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getNomeCliente(p.cliente_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchAno = filterAno === '' || extrairAno(p.numero).toString() === filterAno;
    const matchTecnico = filterTecnico === '' || p.tecnico === filterTecnico;
    const matchStatus = filterStatus.length === 0 || filterStatus.includes(p.status);
    
    return matchSearchTerm && matchAno && matchTecnico && matchStatus;
  });

  // Função para alternar seleção de status
  const toggleStatus = (status: string) => {
    if (filterStatus.includes(status)) {
      setFilterStatus(filterStatus.filter(s => s !== status));
    } else {
      setFilterStatus([...filterStatus, status]);
    }
  };

  // Função para selecionar todos os status
  const selectAllStatus = () => {
    setFilterStatus([...statusUnicos]);
  };

  // Função para limpar todos os status
  const clearAllStatus = () => {
    setFilterStatus([]);
  };

  // Calcular estatísticas (baseado em filteredProjetos para mudar conforme filtros)
  const totalProjetos = filteredProjetos.length;
  const projetosEmExecucao = filteredProjetos.filter(p => p.status === 'Em Execução').length;
  const projetosConcluidos = filteredProjetos.filter(p => p.status === 'Concluído').length;
  
  // Novas estatísticas
  const projetosOrcando = filteredProjetos.filter(p => p.status === 'Orçando').length;
  const valorTotalOrcado = filteredProjetos.reduce((sum, p) => sum + (Number(p.valor_orcado) || 0), 0);
  const valorTotalConcluido = filteredProjetos.filter(p => p.status === 'Concluído').reduce((sum, p) => sum + (Number(p.valor_venda) || 0), 0);

  if (loading) {
    return <div className="card-body">Carregando...</div>;
  }

  if (error) {
    return (
      <>
        <div className="page-header">
          <h2>Projetos</h2>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="form-error-message">{error}</div>
            <details style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Debug Info</summary>
              <pre style={{ marginTop: '0.5rem', fontSize: '0.85rem', overflow: 'auto' }}>
                Token: {localStorage.getItem('access_token')?.substring(0, 50)}...
              </pre>
            </details>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '1rem' }}
              onClick={() => carregarDados()}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h2>Projetos</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/projetos/novo')}>
            Adicionar Novo
          </button>
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            📥 Exportar Excel
          </button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', marginBottom: 0 }}>
            📤 Importar Excel
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalProjetos}</div>
          <div className="stat-label">Total de Projetos</div>
        </div>
        <div className="stat-card stat-card-primary">
          <div className="stat-value">{projetosEmExecucao}</div>
          <div className="stat-label">Em Execução</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-value">{projetosConcluidos}</div>
          <div className="stat-label">Concluídos</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f39c12' }}>
          <div className="stat-value">{projetosOrcando}</div>
          <div className="stat-label">Orçando</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#e74c3c' }}>
          <div className="stat-value stat-value-small">{formatCurrency(valorTotalOrcado)}</div>
          <div className="stat-label">Valor Total Orçado</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#27ae60' }}>
          <div className="stat-value stat-value-small">{formatCurrency(valorTotalConcluido)}</div>
          <div className="stat-label">Valor Total Concluído</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header filter-header">
          <div className="filters-container">
            <input
              type="text"
              placeholder="Filtrar por número, nome, cliente ou status..."
              className="form-input filter-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-input filter-select"
              value={filterAno}
              onChange={(e) => setFilterAno(e.target.value)}
            >
              <option value="">Todos os anos</option>
              {anosUnicos.map(ano => (
                <option key={ano} value={ano.toString()}>{ano}</option>
              ))}
            </select>
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
          </div>
        </div>
        
        <div className="status-filter-container">
          <span className="status-filter-label">Status:</span>
          <div className="status-filter-badges">
            <button
              type="button"
              className={`status-filter-badge ${filterStatus.length === statusUnicos.length ? 'active' : ''}`}
              onClick={selectAllStatus}
            >
              Todos
            </button>
            {statusUnicos.map(status => (
              <button
                key={status}
                type="button"
                className={`status-filter-badge ${filterStatus.includes(status) ? 'active' : ''}`}
                onClick={() => toggleStatus(status)}
              >
                {status}
              </button>
            ))}
            {filterStatus.length > 0 && filterStatus.length < statusUnicos.length && (
              <button
                type="button"
                className="status-filter-badge clear"
                onClick={clearAllStatus}
              >
                ✗ Limpar seleção
              </button>
            )}
          </div>
        </div>
        
        <div className="card-body">
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
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Nome</th>
                  <th>Técnico</th>
                  <th>Valor Orçado</th>
                  <th>Status</th>
                  <th>Ações</th>
                  </tr>
                </thead>
              <tbody>
                {filteredProjetos.map(projeto => (
                  <tr key={projeto.id}>
                    <td><strong>{projeto.numero}</strong></td>
                    <td>{getNomeCliente(projeto.cliente_id)}</td>
                    <td>{projeto.nome}</td>
                    <td>{projeto.tecnico}</td>
                    <td>{formatCurrency(projeto.valor_orcado)}</td>
                    <td>
                      <span className={`badge ${
                        projeto.status === 'Concluído' ? 'badge-success' : 
                        projeto.status === 'Em Execução' ? 'badge-warning' :
                        projeto.status === 'Orçando' ? 'badge-danger' :
                        projeto.status === 'Orçamento Enviado' ? 'badge-blue' :
                        projeto.status === 'Declinado' ? 'badge-danger' :
                        'badge-gray'
                      }`}>
                        {projeto.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn-action" title="Visualizar" onClick={() => handleView(projeto)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button className="btn-action" title="Editar" onClick={() => handleEdit(projeto.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button className="btn-action" title="Gerar PDF" onClick={() => handleExportPdf(projeto)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
                        </button>
                        <button className="btn-action" title="Excluir" onClick={() => handleDelete(projeto)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Detalhes do Projeto"
      >
        {selectedProjeto && (
          <>
            <div className="details-grid">
              <strong>Número:</strong>
              <span>{selectedProjeto.numero}</span>
              <strong>Nome:</strong>
              <span>{selectedProjeto.nome}</span>
              <strong>Cliente:</strong>
              <span>{getNomeCliente(selectedProjeto.cliente_id)}</span>
              <strong>Técnico:</strong>
              <span>{selectedProjeto.tecnico}</span>
              <strong>Status:</strong>
              <span className={`badge ${
                selectedProjeto.status === 'Concluído' ? 'badge-success' : 
                selectedProjeto.status === 'Em Execução' ? 'badge-warning' :
                selectedProjeto.status === 'Orçando' ? 'badge-danger' :
                selectedProjeto.status === 'Orçamento Enviado' ? 'badge-blue' :
                selectedProjeto.status === 'Declinado' ? 'badge-danger' :
                'badge-gray'
              }`}>
                {selectedProjeto.status}
              </span>
              <strong>Faturamento Total:</strong>
              <span>{formatCurrency(faturamentoTotalProjeto)}</span>
            </div>

            <div className="details-section">
              <h4>Valores e Prazos</h4>
              <div className="details-grid">
                <strong>Valor Orçado:</strong>
                <span>{formatCurrency(selectedProjeto.valor_orcado)}</span>
                <strong>Valor de Venda:</strong>
                <span>{formatCurrency(selectedProjeto.valor_venda)}</span>
                <strong>Prazo (dias):</strong>
                <span>{selectedProjeto.prazo_entrega_dias}</span>
                <strong>Data Pedido Compra:</strong>
                <span>{selectedProjeto.data_pedido_compra ? new Date(selectedProjeto.data_pedido_compra).toLocaleDateString('pt-BR') : 'N/A'}</span>
              </div>
            </div>

            <div className="details-section">
              <h4>Histórico</h4>
              <div className="details-grid">
                <strong>Data de Criação:</strong>
                <span>{formatDateTime(selectedProjeto.criado_em)}</span>
                <strong>Última Atualização:</strong>
                <span>{formatDateTime(selectedProjeto.atualizado_em)}</span>
              </div>
            </div>

            <div className="details-section">
              <h4>Faturamentos</h4>
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
                      <th>Data</th>
                      <th>Técnico</th>
                      <th>Valor</th>
                      <th>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faturamentosProjeto.length === 0 && (
                      <tr><td colSpan={4}>Nenhum faturamento registrado para este projeto.</td></tr>
                    )}
                    {faturamentosProjeto.map(f => (
                      <tr key={f.id}>
                        <td>{f.data_faturamento ? new Date(f.data_faturamento).toLocaleDateString('pt-BR') : 'N/A'}</td>
                        <td>{f.tecnico_nome || f.tecnico_id}</td>
                        <td>{formatCurrency(Number(f.valor_faturado) || 0)}</td>
                        <td>{f.observacoes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {cronograma && (
              <div className="details-section">
                <h4>Cronograma de Execução</h4>
                <div className="details-grid">
                  <strong>Percentual de Conclusão:</strong>
                  <span>{cronograma.percentual_conclusao}%</span>
                  <strong>Prazo Status:</strong>
                  <span>
                    <span className={`badge ${
                      cronograma.prazo_status === 'Atrasado' ? 'badge-danger' : 
                      cronograma.prazo_status === 'Urgente' ? 'badge-warning' : 
                      'badge-success'
                    }`}>
                      {cronograma.prazo_status}
                    </span>
                  </span>
                  <strong>Observações:</strong>
                  <span>{cronograma.observacoes || 'N/A'}</span>
                </div>
                
                {historicoCronograma.length > 0 && (
                  <>
                    <h5 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Histórico de Alterações</h5>
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
                            <th>Data</th>
                            <th>Usuário</th>
                            <th>% Conclusão</th>
                            <th>Observações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historicoCronograma.map((h, idx) => (
                            <tr key={idx}>
                              <td>{formatDateTime(h.alterado_em)}</td>
                              <td>{h.usuario_nome || 'N/A'}</td>
                              <td>{h.percentual_conclusao}%</td>
                              <td>{h.observacoes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default Projetos;
