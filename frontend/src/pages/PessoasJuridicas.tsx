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
  // Endereço
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  // Contato Principal
  telefone?: string;
  email?: string;
  // Inscrições
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  // Timestamps e Relações
  created_at: string;
  updated_at: string;
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

  const filteredPessoas = pessoas.filter(p =>
    p.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cnpj.includes(searchTerm) ||
    p.sigla.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="card-body">Carregando...</div>;
  }

  if (error) {
    return <div className="card-body error-message">{error}</div>;
  }

  return (
    <>
      <div className="page-header">
        <h2>Pessoas Jurídicas</h2>
        <button className="btn btn-primary" onClick={() => navigate('/pessoas-juridicas/nova')}>
          Adicionar Nova
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            placeholder="Filtrar por razão social, nome fantasia, CNPJ ou sigla..."
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
                  <th>Razão Social</th>
                  <th>Nome Fantasia</th>
                  <th>Sigla</th>
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
                    <td>{pessoa.nome_fantasia}</td>
                    <td>{pessoa.sigla}</td>
                    <td>{formatCNPJ(pessoa.cnpj)}</td>
                    <td>{pessoa.cidade && pessoa.uf ? `${pessoa.cidade}/${pessoa.uf}` : 'N/A'}</td>
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
        title="Detalhes da Pessoa Jurídica"
      >
        {selectedPessoa && (
          <>
            <div className="details-grid">
              <strong>ID:</strong>
              <span>{selectedPessoa.id}</span>
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
              <strong>Email Principal:</strong>
              <span>{selectedPessoa.email || 'N/A'}</span>
              <strong>Telefone Principal:</strong>
              <span>{selectedPessoa.telefone || 'N/A'}</span>
              <strong>Tipo:</strong>
              <span>{selectedPessoa.tipo}</span>
            </div>

            <div className="details-section">
              <h4>Endereço</h4>
              <div className="details-grid">
                <strong>Logradouro:</strong>
                <span>{selectedPessoa.logradouro || 'N/A'}, {selectedPessoa.numero || 's/n'}</span>
                <strong>Complemento:</strong>
                <span>{selectedPessoa.complemento || 'N/A'}</span>
                <strong>Bairro:</strong>
                <span>{selectedPessoa.bairro || 'N/A'}</span>
                <strong>Cidade/UF:</strong>
                <span>{selectedPessoa.cidade || 'N/A'} / {selectedPessoa.uf || 'N/A'}</span>
                <strong>CEP:</strong>
                <span>{selectedPessoa.cep || 'N/A'}</span>
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
                <span>{formatDateTime(selectedPessoa.created_at)}</span>
                <strong>Última Atualização:</strong>
                <span>{formatDateTime(selectedPessoa.updated_at)}</span>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default PessoasJuridicas;