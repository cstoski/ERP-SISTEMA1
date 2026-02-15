import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import funcionarioService from '../services/funcionarioService';

interface Funcionario {
  id: number;
  nome: string;
  departamento?: string;
  telefone_fixo?: string;
  celular?: string;
  email?: string;
  criado_em: string;
  atualizado_em: string;
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

const Funcionarios: React.FC = () => {
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const data = await funcionarioService.listarTodos();
      setFuncionarios(data);
      setError(null);
    } catch (err) {
      console.error('Falha ao buscar dados:', err);
      setError('Não foi possível carregar os dados dos funcionários.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsModalOpen(true);
  };

  const handleEdit = (id: number) => {
    navigate(`/funcionarios/editar/${id}`);
  };

  const handleDelete = async (funcionario: Funcionario) => {
    if (window.confirm(`Tem certeza que deseja excluir o funcionário "${funcionario.nome}"?`)) {
      try {
        await funcionarioService.deletar(funcionario.id);
        setFuncionarios(funcionarios.filter(f => f.id !== funcionario.id));
      } catch (err) {
        console.error('Falha ao excluir:', err);
        alert('Não foi possível excluir o funcionário.');
      }
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await funcionarioService.exportarExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `funcionarios_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      const response = await funcionarioService.importarExcel(file);
      alert(response.message);
      if (response.erros && response.erros.length > 0) {
        alert(`Erros encontrados:\n${response.erros.join('\n')}`);
      }

      carregarDados();
    } catch (err: any) {
      console.error('Erro ao importar:', err);
      alert(err.response?.data?.detail || 'Erro ao importar arquivo');
    } finally {
      event.target.value = '';
    }
  };

  const filteredFuncionarios = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.departamento && f.departamento.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f.celular && f.celular.includes(searchTerm))
  );

  const totalFuncionarios = funcionarios.length;

  if (loading) {
    return <div className="card-body">Carregando...</div>;
  }

  if (error) {
    return <div className="card-body error-message">{error}</div>;
  }

  return (
    <>
      <div className="page-header">
        <h2>Funcionários</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/funcionarios/novo')}>
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
          <div className="stat-value">{totalFuncionarios}</div>
          <div className="stat-label">Total de Funcionários</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            placeholder="Filtrar por nome, departamento, email ou celular..."
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
                  <th>Nome</th>
                  <th>Departamento</th>
                  <th>Email</th>
                  <th>Celular</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFuncionarios.map(funcionario => (
                  <tr key={funcionario.id}>
                    <td><strong>{funcionario.nome}</strong></td>
                    <td>{funcionario.departamento || 'N/A'}</td>
                    <td>{funcionario.email || 'N/A'}</td>
                    <td>{funcionario.celular || 'N/A'}</td>
                    <td>
                      <div className="actions">
                        <button className="btn-action" title="Visualizar" onClick={() => handleView(funcionario)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button className="btn-action" title="Editar" onClick={() => handleEdit(funcionario.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button className="btn-action" title="Excluir" onClick={() => handleDelete(funcionario)}>
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
        title="Detalhes do Funcionário"
      >
        {selectedFuncionario && (
          <>
            <div className="details-grid">
              <strong>Nome:</strong>
              <span>{selectedFuncionario.nome}</span>
              <strong>Departamento:</strong>
              <span>{selectedFuncionario.departamento || 'N/A'}</span>
              <strong>Email:</strong>
              <span>{selectedFuncionario.email || 'N/A'}</span>
              <strong>Telefone Fixo:</strong>
              <span>{selectedFuncionario.telefone_fixo || 'N/A'}</span>
              <strong>Celular:</strong>
              <span>{selectedFuncionario.celular || 'N/A'}</span>
            </div>

            <div className="details-section">
              <h4>Histórico</h4>
              <div className="details-grid">
                <strong>Data de Criação:</strong>
                <span>{formatDateTime(selectedFuncionario.criado_em)}</span>
                <strong>Última Atualização:</strong>
                <span>{formatDateTime(selectedFuncionario.atualizado_em)}</span>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default Funcionarios;
