import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import faturamentoService, { Faturamento } from '../services/faturamentoService';
import funcionarioService from '../services/funcionarioService';
import projetoService from '../services/projetoService';

interface Projeto { id: number; numero: string; nome: string }
interface Funcionario { id: number; nome: string }

const Faturamentos: React.FC = () => {
  const navigate = useNavigate();
  const [faturamentos, setFaturamentos] = useState<Faturamento[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [tecnicos, setTecnicos] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaturamento, setSelectedFaturamento] = useState<Faturamento | null>(null);
  const [faturamentoToDelete, setFaturamentoToDelete] = useState<Faturamento | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fats, projs, tecs] = await Promise.all([
        faturamentoService.listarTodos(),
        projetoService.listarTodos(),
        funcionarioService.listarTecnicos(),
      ]);
      setFaturamentos(fats as Faturamento[]);
      setProjetos(projs.map((p: any) => ({ id: p.id, numero: p.numero, nome: p.nome })));
      setTecnicos(tecs as Funcionario[]);
    } catch (err) {
      console.error("Falha ao carregar dados:", err);
      setError("Não foi possível carregar os faturamentos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!faturamentoToDelete) return;

    try {
      await faturamentoService.deletar(faturamentoToDelete.id);
      setFaturamentos(faturamentos.filter(f => f.id !== faturamentoToDelete.id));
      setFaturamentoToDelete(null); // Fecha o modal de confirmação
    } catch (err) {
      console.error('Falha ao excluir o faturamento:', err);
      alert(`Não foi possível excluir o faturamento. Verifique o console para mais detalhes.`);
      setFaturamentoToDelete(null);
    }
  };

  const openDeleteModal = (faturamento: Faturamento) => {
    setFaturamentoToDelete(faturamento);
  };

  const getProjetoNome = (projetoId: number) => {
    const projeto = projetos.find(p => p.id === projetoId);
    return projeto ? `${projeto.numero} - ${projeto.nome}` : 'N/A';
  };

  const getTecnicoNome = (tecnicoId: number) => {
    const tecnico = tecnicos.find(t => t.id === tecnicoId);
    return tecnico ? tecnico.nome : 'N/A';
  };

  const filteredFaturamentos = faturamentos.filter(f => {
    const projeto = projetos.find(p => p.id === f.projeto_id);
    const tecnico = tecnicos.find(t => t.id === f.tecnico_id);
    const searchTermLower = searchTerm.toLowerCase();

    return (
      (projeto?.nome.toLowerCase().includes(searchTermLower) ||
      projeto?.numero.toLowerCase().includes(searchTermLower)) ||
      (tecnico?.nome.toLowerCase().includes(searchTermLower)) ||
      (f.observacoes?.toLowerCase().includes(searchTermLower))
    );
  });

  if (loading) {
    return <div className="card-body">Carregando...</div>;
  }

  if (error) {
    return <div className="card-body error-message">{error}</div>;
  }

  return (
    <>
      <div className="page-header">
        <h2>Faturamentos</h2>
        <button className="btn btn-primary" onClick={() => navigate('/faturamentos/novo')}>
          Adicionar Novo
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            placeholder="Filtrar por projeto, técnico ou observações..."
            className="form-input filter-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Técnico</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th>Data</th>
                  <th>Observações</th>
                  <th style={{ width: '120px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaturamentos.map(f => (
                  <tr key={f.id}>
                    <td>{getProjetoNome(f.projeto_id)}</td>
                    <td>{getTecnicoNome(f.tecnico_id)}</td>
                    <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(f.valor_faturado) || 0)}</td>
                    <td>{f.data_faturamento ? new Date(f.data_faturamento).toLocaleDateString('pt-BR') : 'N/A'}</td>
                    <td>{f.observacoes}</td>
                    <td>
                      <div className="actions">
                        <button className="btn-action" title="Visualizar" onClick={() => { setSelectedFaturamento(f); setIsModalOpen(true); }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button className="btn-action" title="Editar" onClick={() => navigate(`/faturamentos/editar/${f.id}`)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button className="btn-action" title="Excluir" onClick={() => openDeleteModal(f)}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalhes do Faturamento">
        {selectedFaturamento && (
          <div className="details-grid">
            <strong>Projeto:</strong><span>{getProjetoNome(selectedFaturamento.projeto_id)}</span>
            <strong>Técnico:</strong><span>{getTecnicoNome(selectedFaturamento.tecnico_id)}</span>
            <strong>Valor Faturado:</strong><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedFaturamento.valor_faturado) || 0)}</span>
            <strong>Data do Faturamento:</strong><span>{selectedFaturamento.data_faturamento ? new Date(selectedFaturamento.data_faturamento).toLocaleDateString('pt-BR') : 'N/A'}</span>
            <strong>Observações:</strong><span>{selectedFaturamento.observacoes || 'Nenhuma'}</span>
            <strong>Criado em:</strong><span>{new Date(selectedFaturamento.criado_em!).toLocaleString('pt-BR')}</span>
            <strong>Atualizado em:</strong><span>{new Date(selectedFaturamento.atualizado_em!).toLocaleString('pt-BR')}</span>
          </div>
        )}
      </Modal>

      {faturamentoToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setFaturamentoToDelete(null)}
          title="Confirmar Exclusão"
        >
          <div>
            <p>Você tem certeza que deseja excluir o faturamento do projeto <strong>{getProjetoNome(faturamentoToDelete.projeto_id)}</strong> no valor de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(faturamentoToDelete.valor_faturado) || 0)}</strong>?</p>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setFaturamentoToDelete(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Excluir
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Faturamentos;