import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal';

interface PessoaJuridica {
  id: number;
  razao_social: string;
  nome_fantasia: string;
  sigla: string;
}

interface Contato {
  id: number;
  nome: string;
  pessoa_juridica_id: number;
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

const ContatosPage: React.FC = () => {
  const navigate = useNavigate();
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [empresas, setEmpresas] = useState<PessoaJuridica[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedContato, setSelectedContato] = useState<Contato | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [contatosRes, empresasRes] = await Promise.all([
        axios.get('/api/contatos'),
        axios.get('/api/pessoas-juridicas'),
      ]);
      setContatos(contatosRes.data);
      setEmpresas(empresasRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Não foi possível carregar os dados dos contatos.');
      setLoading(false);
    }
  };

  const getNomeEmpresa = (pessoaId: number) => {
    const empresa = empresas.find(e => e.id === pessoaId);
    return empresa ? empresa.razao_social : 'N/A';
  };

  const handleView = (contato: Contato) => {
    setSelectedContato(contato);
    setIsModalOpen(true);
  };

  const handleEdit = (id: number) => {
    navigate(`/contatos/editar/${id}`);
  };

  const handleDelete = async (contato: Contato) => {
    if (window.confirm(`Tem certeza que deseja excluir o contato "${contato.nome}"?`)) {
      try {
        await axios.delete(`/api/contatos/${contato.id}`);
        setContatos(contatos.filter(c => c.id !== contato.id));
      } catch (err) {
        console.error('Erro ao excluir:', err);
        alert('Erro ao excluir contato');
      }
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get('/api/contatos/export/excel', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contatos_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      const response = await axios.post('/api/contatos/import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(response.data.message);
      if (response.data.erros && response.data.erros.length > 0) {
        alert(`Erros encontrados:\n${response.data.erros.join('\n')}`);
      }

      carregarDados();
    } catch (err: any) {
      console.error('Erro ao importar:', err);
      const message = err.response?.data?.detail || 'Erro ao importar arquivo';
      alert(message);
    } finally {
      event.target.value = '';
    }
  };

  const filteredContatos = contatos.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getNomeEmpresa(c.pessoa_juridica_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas
  const totalContatos = contatos.length;

  if (loading) {
    return <div className="card-body">Carregando...</div>;
  }

  if (error) {
    return <div className="card-body error-message">{error}</div>;
  }

  return (
    <>
      <div className="page-header">
        <h2>Contatos</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/contatos/novo')}>
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
          <div className="stat-value">{totalContatos}</div>
          <div className="stat-label">Total de Contatos</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            placeholder="Filtrar por nome, email ou empresa..."
            className="form-input filter-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-compact">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Empresa</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContatos.map(contato => (
                  <tr key={contato.id}>
                    <td>{contato.nome}</td>
                    <td>{getNomeEmpresa(contato.pessoa_juridica_id)}</td>
                    <td>{contato.email || '-'}</td>
                    <td>{contato.celular || contato.telefone_fixo || '-'}</td>
                    <td>
                      <div className="actions">
                        <button className="btn-action" title="Visualizar" onClick={() => handleView(contato)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button className="btn-action" title="Editar" onClick={() => handleEdit(contato.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button className="btn-action" title="Excluir" onClick={() => handleDelete(contato)}>
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
        title="Detalhes do Contato"
      >
        {selectedContato && (
          <>
            <div className="details-grid">
              <strong>ID:</strong>
              <span>{selectedContato.id}</span>
              <strong>Nome:</strong>
              <span>{selectedContato.nome}</span>
              <strong>Empresa:</strong>
              <span>{getNomeEmpresa(selectedContato.pessoa_juridica_id)}</span>
              <strong>Departamento:</strong>
              <span>{selectedContato.departamento || 'N/A'}</span>
              <strong>Email:</strong>
              <span>{selectedContato.email || 'N/A'}</span>
              <strong>Telefone Fixo:</strong>
              <span>{selectedContato.telefone_fixo || 'N/A'}</span>
              <strong>Celular:</strong>
              <span>{selectedContato.celular || 'N/A'}</span>
            </div>

            <div className="details-section">
              <h4>Histórico</h4>
              <div className="details-grid">
                <strong>Data de Criação:</strong>
                <span>{formatDateTime(selectedContato.criado_em)}</span>
                <strong>Última Atualização:</strong>
                <span>{formatDateTime(selectedContato.atualizado_em)}</span>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default ContatosPage;