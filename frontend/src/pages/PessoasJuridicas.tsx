import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pessoaJuridicaService, PessoaJuridica, PessoaJuridicaCreate } from '../services/pessoaJuridicaService';
import { contatoService, Contato } from '../services/contatoService';

function PessoasJuridicas() {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState<PessoaJuridica[]>([]);
  const [pessoasFiltradas, setPessoasFiltradas] = useState<PessoaJuridica[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [visualizando, setVisualizando] = useState<PessoaJuridica | null>(null);
  const [editando, setEditando] = useState<PessoaJuridica | null>(null);
  const [filtro, setFiltro] = useState('');
  const [cnpjError, setCnpjError] = useState('');
  const [contatos, setContatos] = useState<Contato[]>([]);
  
  const [formData, setFormData] = useState<PessoaJuridicaCreate>({
    razao_social: '',
    nome_fantasia: '',
    sigla: '',
    tipo: 'Cliente',
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
  }

  const validateCnpj = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14) {
      setCnpjError('CNPJ deve conter 14 dígitos');
      return false;
    }

    if (/^(\d)\1+$/.test(cnpj)) {
      setCnpjError('CNPJ inválido (dígitos repetidos)');
      return false;
    }

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) {
      setCnpjError('CNPJ inválido');
      return false;
    }

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) {
      setCnpjError('CNPJ inválido');
      return false;
    }

    setCnpjError('');
    return true;
  };

  const formatCnpj = (cnpj: string) => {
    if (!cnpj) return '';
    const cnpjLimp = cnpj.replace(/[^\d]/g, '');
    if (cnpjLimp.length !== 14) return cnpj; // Retorna o valor original se não tiver 14 dígitos
    return cnpjLimp.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    if (rawValue.length <= 14) {
      validateCnpj(rawValue);
      setFormData({ ...formData, cnpj: rawValue });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCnpj(formData.cnpj)) {
      alert('Por favor, corrija os erros antes de salvar.');
      return;
    }
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
        tipo: 'Cliente',
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
    } catch (error: any) {
      console.error('Erro ao salvar pessoa jurídica:', error);
      const errorMessage = error.response?.data?.detail || 'Erro ao salvar. Verifique os dados e tente novamente.';
      alert(errorMessage);
    }
  };

  const handleEdit = (pessoa: PessoaJuridica) => {
    setEditando(pessoa);
    setVisualizando(null);
    setFormData({
      razao_social: pessoa.razao_social,
      nome_fantasia: pessoa.nome_fantasia || '',
      sigla: pessoa.sigla || '',
      tipo: pessoa.tipo || 'Cliente',
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

  const handleView = async (pessoa: PessoaJuridica) => {
    setVisualizando(pessoa);
    setShowForm(false);
    setEditando(null);
    try {
      const response = await contatoService.listar(pessoa.id);
      setContatos(response.data);
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
      setContatos([]);
    }
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

  const handleEditContato = (contatoId: number) => {
    navigate(`/contatos?edit=${contatoId}`);
  };

  const handleDeleteContato = async (id: number) => {
    if (window.confirm('Deseja realmente deletar este contato?')) {
      try {
        await contatoService.deletar(id);
        if (visualizando) {
          // Recarrega os contatos da pessoa jurídica atual
          const response = await contatoService.listar(visualizando.id);
          setContatos(response.data);
        }
      } catch (error) {
        console.error('Erro ao deletar contato:', error);
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
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
              <div><strong>Tipo:</strong> {visualizando.tipo}</div>
              <div><strong>CNPJ:</strong> {formatCnpj(visualizando.cnpj)}</div>
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
              className="btn btn-secondary" 
              style={{ marginTop: '20px' }}
              onClick={() => setVisualizando(null)}
            >
              <span style={{ marginRight: '8px' }}>✖</span>
              Fechar
            </button>

            <div style={{ marginTop: '30px' }}>
              <h4>Contatos Associados</h4>
              <table className="table table-sm table-striped table-hover">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Departamento</th>
                    <th>Email</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contatos.length > 0 ? (
                    contatos.map(contato => (
                      <tr key={contato.id}>
                        <td>{contato.nome}</td>
                        <td>{contato.departamento || '-'}</td>
                        <td>{contato.email || '-'}</td>
                        <td>
                          <button className="btn btn-warning btn-sm" onClick={() => handleEditContato(contato.id)}>✏️ Editar</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteContato(contato.id)} style={{ marginLeft: '5px' }}>🗑️ Excluir</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center">Nenhum contato encontrado para esta empresa.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Razão Social: *</label>
              <input
                type="text"
                className="form-control"
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Nome Fantasia:</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nome_fantasia}
                  onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Sigla: * (máx. 3 caracteres)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                  maxLength={3}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo: *</label>
                <select
                  className="form-control"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  required
                >
                  <option value="Cliente">Cliente</option>
                  <option value="Fornecedor">Fornecedor</option>
                  <option value="Cliente/Fornecedor">Cliente/Fornecedor</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>CNPJ: *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formatCnpj(formData.cnpj)}
                  onChange={handleCnpjChange}
                  required
                  maxLength={18}
                  placeholder="XX.XXX.XXX/XXXX-XX"
                />
                {cnpjError && <small className="form-text text-danger">{cnpjError}</small>}
              </div>
              <div className="form-group">
                <label>Inscrição Estadual:</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.inscricao_estadual}
                  onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Inscrição Municipal:</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.inscricao_municipal}
                  onChange={(e) => setFormData({ ...formData, inscricao_municipal: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Endereço:</label>
              <input
                type="text"
                className="form-control"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Complemento:</label>
              <input
                type="text"
                className="form-control"
                value={formData.complemento}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '15px' }}>
              <div className="form-group">
                <label>Cidade:</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                  maxLength={2}
                />
              </div>
              <div className="form-group">
                <label>CEP:</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>País:</label>
                <input
                  type="text"
                  className="form-control"
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

        {!visualizando && !showForm && (
          <>
            <div style={{ marginTop: '20px', marginBottom: '15px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Filtrar por Razão Social, Nome Fantasia ou CNPJ..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>

            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Razão Social</th>
                  <th>Nome Fantasia</th>
                  <th>Sigla</th>
                  <th>Tipo</th>
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
                    <td>{pessoa.tipo}</td>
                    <td>{formatCnpj(pessoa.cnpj)}</td>
                    <td>{pessoa.cidade}/{pessoa.estado}</td>
                    <td className="actions">
                      <button className="btn btn-primary" onClick={() => handleView(pessoa)} title="Visualizar">
                        <span>👁</span>
                      </button>
                      <button className="btn btn-primary" onClick={() => handleEdit(pessoa)} title="Editar">
                        <span>✏️</span>
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(pessoa.id)} title="Deletar">
                        <span>🗑️</span>
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