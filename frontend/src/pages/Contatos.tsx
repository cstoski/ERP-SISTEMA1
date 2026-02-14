import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { contatoService, Contato, ContatoCreate, ContatoUpdate } from '../services/contatoService';
import { pessoaJuridicaService, PessoaJuridica } from '../services/pessoaJuridicaService';

function Contatos() {
  const location = useLocation();
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [pessoasJuridicas, setPessoasJuridicas] = useState<PessoaJuridica[]>([]);
  const [contatosFiltrados, setContatosFiltrados] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Contato | null>(null);
  const [filtro, setFiltro] = useState('');

  const [formData, setFormData] = useState<Partial<ContatoCreate>>({
    nome: '',
    departamento: '',
    telefone_fixo: '',
    celular: '',
    email: '',
    pessoa_juridica_id: undefined,
  });

  useEffect(() => {
    carregarContatos();
    carregarPessoasJuridicas();
  }, []);

  useEffect(() => {
    // Verifica se há um ID de contato para editar na URL
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId && contatos.length > 0) {
      const contatoParaEditar = contatos.find(c => c.id === parseInt(editId));
      if (contatoParaEditar) {
        handleEdit(contatoParaEditar);
      }
    }
  }, [location.search, contatos]);

  useEffect(() => {
    filtrarContatos();
  }, [filtro, contatos]);

  const carregarContatos = async () => {
    try {
      // Usaremos uma função `listarTodos` que precisa ser criada no service
      const response = await contatoService.listarTodos(); 
      setContatos(response.data);
      setContatosFiltrados(response.data);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarPessoasJuridicas = async () => {
    try {
      const response = await pessoaJuridicaService.listar();
      setPessoasJuridicas(response.data);
    } catch (error) {
      console.error('Erro ao carregar pessoas jurídicas:', error);
    }
  };

  const filtrarContatos = () => {
    if (!filtro) {
      setContatosFiltrados(contatos);
      return;
    }
    const filtroLower = filtro.toLowerCase();
    const filtrados = contatos.filter((contato) => {
      const pessoa = pessoasJuridicas.find(p => p.id === contato.pessoa_juridica_id);
      return (
        contato.nome.toLowerCase().includes(filtroLower) ||
        (contato.departamento?.toLowerCase().includes(filtroLower)) ||
        (contato.email?.toLowerCase().includes(filtroLower)) ||
        (pessoa?.razao_social.toLowerCase().includes(filtroLower))
      );
    });
    setContatosFiltrados(filtrados);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.pessoa_juridica_id) {
        alert("Nome e Empresa são obrigatórios.");
        return;
    }

    const dataToSubmit: ContatoCreate = {
        nome: formData.nome,
        departamento: formData.departamento,
        telefone_fixo: formData.telefone_fixo,
        celular: formData.celular,
        email: formData.email,
        pessoa_juridica_id: formData.pessoa_juridica_id,
    };

    try {
      if (editando) {
        await contatoService.atualizar(editando.id, dataToSubmit as ContatoUpdate);
      } else {
        await contatoService.criar(dataToSubmit);
      }
      resetFormAndState();
      carregarContatos();
    } catch (error: any) {
      console.error('Erro ao salvar contato:', error);
      alert(error.response?.data?.detail || 'Erro ao salvar.');
    }
  };

  const handleEdit = (contato: Contato) => {
    setEditando(contato);
    setFormData({
      nome: contato.nome,
      departamento: contato.departamento || '',
      telefone_fixo: contato.telefone_fixo || '',
      celular: contato.celular || '',
      email: contato.email || '',
      pessoa_juridica_id: contato.pessoa_juridica_id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente deletar este contato?')) {
      try {
        await contatoService.deletar(id);
        carregarContatos();
      } catch (error) {
        console.error('Erro ao deletar contato:', error);
      }
    }
  };
  
  const resetFormAndState = () => {
    setShowForm(false);
    setEditando(null);
    setFormData({
        nome: '',
        departamento: '',
        telefone_fixo: '',
        celular: '',
        email: '',
        pessoa_juridica_id: undefined,
    });
  }

  const getNomeEmpresa = (pessoa_juridica_id: number) => {
    const empresa = pessoasJuridicas.find(p => p.id === pessoa_juridica_id);
    return empresa ? empresa.razao_social : 'N/A';
  }

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Contatos</h2>
          <button className="btn btn-primary" onClick={() => {
            resetFormAndState();
            setShowForm(!showForm);
          }}>
            <span style={{ marginRight: '8px' }}>➕</span>
            {showForm ? 'Cancelar' : 'Novo Contato'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Empresa: *</label>
              <select
                className="form-control"
                value={formData.pessoa_juridica_id || ''}
                onChange={(e) => setFormData({ ...formData, pessoa_juridica_id: parseInt(e.target.value) })}
                required
              >
                <option value="">Selecione uma empresa</option>
                {pessoasJuridicas.map(p => (
                  <option key={p.id} value={p.id}>{p.razao_social}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Nome: *</label>
              <input type="text" className="form-control" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Departamento:</label>
              <input type="text" className="form-control" value={formData.departamento} onChange={(e) => setFormData({ ...formData, departamento: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </form>
        )}

        {!showForm && (
          <>
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Filtrar por nome, departamento, email ou empresa..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>

            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Empresa</th>
                  <th>Departamento</th>
                  <th>Email</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {contatosFiltrados.map(contato => (
                  <tr key={contato.id}>
                    <td>{contato.nome}</td>
                    <td>{getNomeEmpresa(contato.pessoa_juridica_id)}</td>
                    <td>{contato.departamento || '-'}</td>
                    <td>{contato.email || '-'}</td>
                    <td>
                      <button className="btn btn-warning btn-sm" onClick={() => handleEdit(contato)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(contato.id)} style={{ marginLeft: '5px' }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default Contatos;