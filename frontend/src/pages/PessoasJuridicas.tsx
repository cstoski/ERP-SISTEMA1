import React, { useState, useEffect } from 'react';
import { pessoaJuridicaService, PessoaJuridica, PessoaJuridicaCreate } from '../services/pessoaJuridicaService';

function PessoasJuridicas() {
  const [pessoas, setPessoas] = useState<PessoaJuridica[]>([]);
  const [pessoasFiltradas, setPessoasFiltradas] = useState<PessoaJuridica[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [visualizando, setVisualizando] = useState<PessoaJuridica | null>(null);
  const [editando, setEditando] = useState<PessoaJuridica | null>(null);
  const [filtro, setFiltro] = useState('');
  const [formData, setFormData] = useState<PessoaJuridicaCreate>({
    razao_social: '',
    nome_fantasia: '',
    sigla: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    endereco: '',
    complemento: '',
    cidade: 'Curitiba',
    estado: 'PR',
    cep: '',
    pais: 'Brasil',
  });

  useEffect(() => {
    carregarPessoas();
  }, []);

  useEffect(() => {
    filtrarPessoas();
  }, [filtro, pessoas]);

  const carregarPessoas = async () => {
    try {
      const response = await pessoaJuridicaService.listar();
      setPessoas(response.data);
      setPessoasFiltradas(response.data);
    } catch (error) {
      console.error('Erro ao carregar pessoas jurídicas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPessoas = () => {
    if (!filtro) {
      setPessoasFiltradas(pessoas);
      return;
    }

    const filtroLower = filtro.toLowerCase();
    const filtradas = pessoas.filter((pessoa) => {
      return (
        pessoa.razao_social.toLowerCase().includes(filtroLower) ||
        (pessoa.nome_fantasia?.toLowerCase().includes(filtroLower)) ||
        pessoa.cnpj.includes(filtro)
      );
    });
    setPessoasFiltradas(filtradas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando) {
        await pessoaJuridicaService.atualizar(editando.id, formData);
      } else {
        await pessoaJuridicaService.criar(formData);
      }
      setShowForm(false);
      setEditando(null);
      setFormData({
        razao_social: '',
        nome_fantasia: '',
        sigla: '',
        cnpj: '',
        inscricao_estadual: '',
        inscricao_municipal: '',
        endereco: '',
        complemento: '',
        cidade: 'Curitiba',
        estado: 'PR',
        cep: '',
        pais: 'Brasil',
      });
      carregarPessoas();
    } catch (error) {
      console.error('Erro ao salvar pessoa jurídica:', error);
      alert('Erro ao salvar. Verifique os dados e tente novamente.');
    }
  };

  const handleEdit = (pessoa: PessoaJuridica) => {
    setEditando(pessoa);
    setVisualizando(null);
    setFormData({
      razao_social: pessoa.razao_social,
      nome_fantasia: pessoa.nome_fantasia || '',
      sigla: pessoa.sigla || '',
      cnpj: pessoa.cnpj,
      inscricao_estadual: pessoa.inscricao_estadual || '',
      inscricao_municipal: pessoa.inscricao_municipal || '',
      endereco: pessoa.endereco || '',
      complemento: pessoa.complemento || '',
      cidade: pessoa.cidade,
      estado: pessoa.estado,
      cep: pessoa.cep || '',
      pais: pessoa.pais,
    });
    setShowForm(true);
  };

  const handleView = (pessoa: PessoaJuridica) => {
    setVisualizando(pessoa);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente deletar esta pessoa jurídica?')) {
      try {
        await pessoaJuridicaService.deletar(id);
        carregarPessoas();
      } catch (error) {
        console.error('Erro ao deletar pessoa jurídica:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Pessoas Jurídicas</h2>
          <button className="btn btn-primary" onClick={() => {
            setShowForm(!showForm);
            setVisualizando(null);
            setEditando(null);
          }}>
            <span style={{ marginRight: '8px' }}>➕</span>
            {showForm ? 'Cancelar' : 'Nova Pessoa Jurídica'}
          </button>
        </div>

        {visualizando && (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3>Detalhes da Pessoa Jurídica</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div><strong>Razão Social:</strong> {visualizando.razao_social}</div>
              <div><strong>Nome Fantasia:</strong> {visualizando.nome_fantasia || '-'}</div>
              <div><strong>Sigla:</strong> {visualizando.sigla}</div>
              <div><strong>CNPJ:</strong> {visualizando.cnpj}</div>
              <div><strong>Inscrição Estadual:</strong> {visualizando.inscricao_estadual || '-'}</div>
              <div><strong>Inscrição Municipal:</strong> {visualizando.inscricao_municipal || '-'}</div>
              <div><strong>Endereço:</strong> {visualizando.endereco || '-'}</div>
              <div><strong>Complemento:</strong> {visualizando.complemento || '-'}</div>
              <div><strong>Cidade:</strong> {visualizando.cidade}</div>
              <div><strong>Estado:</strong> {visualizando.estado}</div>
              <div><strong>CEP:</strong> {visualizando.cep || '-'}</div>
              <div><strong>País:</strong> {visualizando.pais}</div>
              <div><strong>Data de Criação:</strong> {formatDate(visualizando.criado_em)}</div>
              <div><strong>Última Alteração:</strong> {formatDate(visualizando.atualizado_em)}</div>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '15px' }}
              onClick={() => setVisualizando(null)}
            >
              <span style={{ marginRight: '8px' }}>✖</span>
              Fechar
            </button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Razão Social: *</label>
              <input
                type="text"
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Nome Fantasia:</label>
              <input
                type="text"
                value={formData.nome_fantasia}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Sigla: * (máx. 3 caracteres)</label>
              <input
                type="text"
                value={formData.sigla}
                onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                maxLength={3}
                required
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>CNPJ: *</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Inscrição Estadual:</label>
                <input
                  type="text"
                  value={formData.inscricao_estadual}
                  onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Inscrição Municipal:</label>
                <input
                  type="text"
                  value={formData.inscricao_municipal}
                  onChange={(e) => setFormData({ ...formData, inscricao_municipal: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Endereço:</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Complemento:</label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '15px' }}>
              <div className="form-group">
                <label>Cidade:</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <input
                  type="text"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                  maxLength={2}
                />
              </div>
              <div className="form-group">
                <label>CEP:</label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>País:</label>
                <input
                  type="text"
                  value={formData.pais}
                  onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">
              <span style={{ marginRight: '8px' }}>💾</span>
              {editando ? 'Atualizar' : 'Salvar'}
            </button>
          </form>
        )}

        {!visualizando && (
          <>
            <div style={{ marginTop: '20px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="🔍 Filtrar por Razão Social, Nome Fantasia ou CNPJ..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Razão Social</th>
                  <th>Nome Fantasia</th>
                  <th>Sigla</th>
                  <th>CNPJ</th>
                  <th>Cidade/Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pessoasFiltradas.map((pessoa) => (
                  <tr key={pessoa.id}>
                    <td>{pessoa.razao_social}</td>
                    <td>{pessoa.nome_fantasia || '-'}</td>
                    <td>{pessoa.sigla}</td>
                    <td>{pessoa.cnpj}</td>
                    <td>{pessoa.cidade}/{pessoa.estado}</td>
                    <td className="actions">
                      <button className="btn btn-primary" onClick={() => handleView(pessoa)}>
                        <span style={{ marginRight: '5px' }}>👁</span>
                        Visualizar
                      </button>
                      <button className="btn btn-primary" onClick={() => handleEdit(pessoa)}>
                        <span style={{ marginRight: '5px' }}>✏️</span>
                        Editar
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(pessoa.id)}>
                        <span style={{ marginRight: '5px' }}>🗑️</span>
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pessoasFiltradas.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                Nenhuma pessoa jurídica encontrada.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PessoasJuridicas;
