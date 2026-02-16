import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal';

interface Contato {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
}

interface PessoaJuridica {
  id: number;
  razao_social: string;
  nome_fantasia: string;
  sigla: string;
  cnpj: string;
  tipo: 'Cliente' | 'Fornecedor' | string;
  endereco?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  pais?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  criado_em: string;
  atualizado_em: string;
  contatos: Contato[];
}

const formatCNPJ = (cnpj: string) => {
  if (!cnpj) return '';
  return cnpj.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  );
};

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

const PessoasJuridicas: React.FC = () => {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState<PessoaJuridica[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPessoa, setSelectedPessoa] = useState<PessoaJuridica | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('/api/pessoas-juridicas')
      .then(response => {
        setPessoas(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Falha ao buscar dados: ", err);
        setError('Não foi possível carregar os dados das pessoas jurídicas.');
        setLoading(false);
      });
  }, []);

  const handleView = (pessoa: PessoaJuridica) => {
    setSelectedPessoa(pessoa);
    setIsModalOpen(true);
  };

  const handleEdit = (id: number) => {
    navigate(`/pessoas-juridicas/editar/${id}`);
  };

  const handleDelete = async (pessoa: PessoaJuridica) => {
    const companyName = pessoa.nome_fantasia || pessoa.razao_social;
    if (window.confirm(`Tem certeza que deseja excluir a empresa "${companyName}"?`)) {
      try {
        await axios.delete(`/api/pessoas-juridicas/${pessoa.id}`);
        setPessoas(pessoas.filter(p => p.id !== pessoa.id));
      } catch (err) {
        console.error('Falha ao excluir o registro:', err);
        alert(`Não foi possível excluir o registro de "${companyName}". Verifique o console para mais detalhes.`);
      }
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get('/api/pessoas-juridicas/export/excel', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pessoas_juridicas_${new Date().toISOString().split('T')[0]}.xlsx`);
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/pessoas-juridicas/import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(response.data.message);
      if (response.data.erros && response.data.erros.length > 0) {
        alert(`Erros encontrados:\n${response.data.erros.join('\n')}`);
      }

      // Recarregar dados
      axios.get('/api/pessoas-juridicas')
        .then(result => {
          setPessoas(result.data);
        })
        .catch(err => console.error('Erro ao recarregar:', err));
    } catch (err: any) {
      console.error('Erro ao importar:', err);
      const message = err.response?.data?.detail || 'Erro ao importar arquivo';
      alert(message);
    } finally {
      // Limpar input
      event.target.value = '';
    }
  };

  const filteredPessoas = pessoas.filter(p =>
    p.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cnpj.includes(searchTerm) ||
    p.sigla.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas
  const totalCadastros = pessoas.length;
  const totalClientes = pessoas.filter(p => p.tipo === 'Cliente').length;
  const totalFornecedores = pessoas.filter(p => p.tipo === 'Fornecedor').length;

  if (loading) {
    return <div className="card-body">Carregando...</div>;
  }

  if (error) {
    return <div className="card-body error-message">{error}</div>;
  }

  return (
    <>
      <div className="page-header">
        <h2>Empresas</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/pessoas-juridicas/nova')}>
            Adicionar Nova
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
          <div className="stat-value">{totalCadastros}</div>
          <div className="stat-label">Total de Cadastros</div>
        </div>
        <div className="stat-card stat-card-primary">
          <div className="stat-value">{totalClientes}</div>
          <div className="stat-label">Clientes</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-value">{totalFornecedores}</div>
          <div className="stat-label">Fornecedores</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            placeholder="Filtrar por razão social ou CNPJ..."
            className="form-input filter-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  <th>Razão Social</th>
                  <th>CNPJ</th>
                  <th>Cidade/UF</th>
                  <th>Tipo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPessoas.map(pessoa => (
                  <tr key={pessoa.id}>
                    <td>{pessoa.razao_social}</td>
                    <td>{formatCNPJ(pessoa.cnpj)}</td>
                    <td>{pessoa.cidade && pessoa.estado ? `${pessoa.cidade}/${pessoa.estado}` : 'N/A'}</td>
                    <td>
                      <span className={`badge ${pessoa.tipo === 'Cliente' ? 'badge-blue' : 'badge-green'}`}>
                        {pessoa.tipo}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn-action" title="Visualizar" onClick={() => handleView(pessoa)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button className="btn-action" title="Editar" onClick={() => handleEdit(pessoa.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button className="btn-action" title="Excluir" onClick={() => handleDelete(pessoa)}>
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
        title="Detalhes da Empresa"
      >
        {selectedPessoa && (
          <>
            <div className="details-grid">
              <strong>Razão Social:</strong>
              <span>{selectedPessoa.razao_social}</span>
              <strong>Nome Fantasia:</strong>
              <span>{selectedPessoa.nome_fantasia}</span>
              <strong>Sigla:</strong>
              <span>{selectedPessoa.sigla}</span>
              <strong>CNPJ:</strong>
              <span>{formatCNPJ(selectedPessoa.cnpj)}</span>
              <strong>Inscrição Estadual:</strong>
              <span>{selectedPessoa.inscricao_estadual || 'N/A'}</span>
              <strong>Inscrição Municipal:</strong>
              <span>{selectedPessoa.inscricao_municipal || 'N/A'}</span>
              <strong>Tipo:</strong>
              <span>{selectedPessoa.tipo}</span>
              <strong>País:</strong>
              <span>{selectedPessoa.pais || 'N/A'}</span>
            </div>

            <div className="details-section">
              <h4>Endereço</h4>
              <div className="details-grid">
                <strong>Endereço:</strong>
                <span>{selectedPessoa.endereco || 'N/A'}</span>
                <strong>Complemento:</strong>
                <span>{selectedPessoa.complemento || 'N/A'}</span>
                <strong>Cidade/Estado:</strong>
                <span>{selectedPessoa.cidade || 'N/A'} / {selectedPessoa.estado || 'N/A'}</span>
                <strong>CEP:</strong>
                <span>{selectedPessoa.cep || 'N/A'}</span>
                <strong>País:</strong>
                <span>{selectedPessoa.pais || 'N/A'}</span>
              </div>
            </div>

            <div className="details-section">
              <h4>Contatos</h4>
              {selectedPessoa.contatos && selectedPessoa.contatos.length > 0 ? (
                <ul className="contacts-list">
                  {selectedPessoa.contatos.map(contato => (
                    <li key={contato.id}>
                      <strong>{contato.nome}</strong> ({contato.cargo || 'N/A'})<br />
                      <span>Email: {contato.email}</span><br />
                      <span>Telefone: {contato.telefone}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum contato cadastrado.</p>
              )}
            </div>

            <div className="details-section">
              <h4>Histórico</h4>
              <div className="details-grid">
                <strong>Data de Criação:</strong>
                <span>{formatDateTime(selectedPessoa.criado_em)}</span>
                <strong>Última Atualização:</strong>
                <span>{formatDateTime(selectedPessoa.atualizado_em)}</span>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default PessoasJuridicas;