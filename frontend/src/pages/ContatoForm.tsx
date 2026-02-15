import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputMask from 'react-input-mask';

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

const ContatoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [empresas, setEmpresas] = useState<PessoaJuridica[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    pessoa_juridica_id: 0,
    departamento: '',
    telefone_fixo: '',
    celular: '',
    email: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    carregarEmpresas();
    if (isEditMode) {
      carregarContato();
    }
  }, [id]);

  const carregarEmpresas = async () => {
    try {
      const response = await axios.get('/api/pessoas-juridicas');
      setEmpresas(response.data);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
      setError('Erro ao carregar empresas');
    }
  };

  const carregarContato = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/contatos/${id}`);
      setFormData({
        nome: response.data.nome,
        pessoa_juridica_id: response.data.pessoa_juridica_id,
        departamento: response.data.departamento || '',
        telefone_fixo: response.data.telefone_fixo || '',
        celular: response.data.celular || '',
        email: response.data.email || '',
      });
    } catch (err) {
      console.error('Erro ao carregar contato:', err);
      setError('Contato não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.pessoa_juridica_id) {
      newErrors.pessoa_juridica_id = 'Empresa é obrigatória';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const method = isEditMode ? 'put' : 'post';
    const url = isEditMode ? `/api/contatos/${id}` : '/api/contatos';

    try {
      await axios[method](url, formData);
      navigate('/contatos');
    } catch (err: any) {
      setLoading(false);
      if (axios.isAxiosError(err) && err.response) {
        const message = err.response?.data?.detail || 'Erro ao salvar contato';
        setError(message);
      } else {
        setError('Erro ao salvar contato');
      }
    }
  };

  if (loading && isEditMode) {
    return <div className="card-body">Carregando dados...</div>;
  }

  return (
    <>
      <div className="page-header">
        <h2>{isEditMode ? 'Editar Contato' : 'Adicionar Novo Contato'}</h2>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="form-layout">
            {error && <div className="form-error-message">{error}</div>}

            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="nome">Nome *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  className={`form-input ${fieldErrors.nome ? 'has-error' : ''}`}
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.nome && <span className="form-field-error">{fieldErrors.nome}</span>}
              </div>

              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="pessoa_juridica_id">Empresa *</label>
                <select
                  id="pessoa_juridica_id"
                  name="pessoa_juridica_id"
                  className={`form-select ${fieldErrors.pessoa_juridica_id ? 'has-error' : ''}`}
                  value={formData.pessoa_juridica_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma empresa</option>
                  {empresas.map(empresa => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.razao_social}
                    </option>
                  ))}
                </select>
                {fieldErrors.pessoa_juridica_id && <span className="form-field-error">{fieldErrors.pessoa_juridica_id}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="departamento">Departamento</label>
                <input
                  type="text"
                  id="departamento"
                  name="departamento"
                  className="form-input"
                  value={formData.departamento}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="telefone_fixo">Telefone Fixo</label>
                <InputMask
                  mask="(99) 9999-9999"
                  value={formData.telefone_fixo}
                  onChange={handleChange}
                  name="telefone_fixo"
                >
                  {(inputProps: any) => <input {...inputProps} id="telefone_fixo" className="form-input" />}
                </InputMask>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="celular">Celular</label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={formData.celular}
                  onChange={handleChange}
                  name="celular"
                >
                  {(inputProps: any) => <input {...inputProps} id="celular" className="form-input" />}
                </InputMask>
              </div>

              <div className="form-group" style={{ flex: 1.5 }}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/contatos')}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ContatoForm;
