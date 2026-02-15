import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal';
import projetoService from '../services/projetoService';
import faturamentoService from '../services/faturamentoService';
import funcionarioService from '../services/funcionarioService';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAno, setFilterAno] = useState<string>('');
  const [filterTecnico, setFilterTecnico] = useState<string>('');

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
      const [projetosData, clientesData] = await Promise.all([
        projetoService.listarTodos(),
        projetoService.listarClientes(),
      ]);
      setProjetos(projetosData);
      setClientes(clientesData);
      setError(null);
    } catch (err) {
      console.error('Falha ao buscar dados:', err);
      setError('Não foi possível carregar os dados dos projetos.');
    } finally {
      setLoading(false);
    }
  };

  const getNomeCliente = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.razao_social : 'N/A';
  };

  const handleView = (projeto: Projeto) => {
    setSelectedProjeto(projeto);
    setIsModalOpen(true);
    carregarFaturamentosProjeto(projeto.id);
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

  const filteredProjetos = projetos.filter(p => {
    const matchSearchTerm = 
      p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getNomeCliente(p.cliente_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchAno = filterAno === '' || extrairAno(p.numero).toString() === filterAno;
    const matchTecnico = filterTecnico === '' || p.tecnico === filterTecnico;
    
    return matchSearchTerm && matchAno && matchTecnico;
  });

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
    return <div className="card-body error-message">{error}</div>;
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
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Nome</th>
                  <th>Técnico</th>
                  <th>Valor de Venda</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjetos.map(projeto => (
                  <tr key={projeto.id}>
                    <td><strong>{projeto.numero}</strong></td>
                    <td>{projeto.nome}</td>
                    <td>{getNomeCliente(projeto.cliente_id)}</td>
                    <td>{projeto.tecnico}</td>
                    <td>{formatCurrency(projeto.valor_venda)}</td>
                    <td>
                      <span className={`badge ${
                        projeto.status === 'Concluído' ? 'badge-success' : 
                        projeto.status === 'Em Execução' ? 'badge-blue' :
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
              <span>{selectedProjeto.status}</span>
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
                <table className="table">
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
          </>
        )}
      </Modal>
    </>
  );
};

export default Projetos;
