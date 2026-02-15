import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputMask from 'react-input-mask';

// Função para validar o CNPJ (dígitos verificadores)
const isValidCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj === '' || cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0), 10)) {
    return false;
  }

  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1), 10)) {
    return false;
  }

  return true;
};


const PessoaJuridicaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    sigla: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    endereco: '',
    complemento: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    cep: '',
    tipo: 'Cliente',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      axios.get(`/api/pessoas-juridicas/${id}`)
        .then(response => {
          setFormData(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Falha ao carregar os dados para edição.');
          setLoading(false);
        });
    }
  }, [id, isEditMode]);

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
    if (!formData.razao_social.trim()) {
      newErrors.razao_social = 'Razão Social é um campo obrigatório.';
    }
    
    const cnpjValue = formData.cnpj.replace(/\D/g, '');
    if (!cnpjValue) {
      newErrors.cnpj = 'CNPJ é um campo obrigatório.';
    } else if (!isValidCNPJ(cnpjValue)) {
      newErrors.cnpj = 'CNPJ inválido.';
    }

    if (formData.sigla && formData.sigla.length > 3) {
      newErrors.sigla = 'A sigla deve ter no máximo 3 caracteres.';
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
    setFieldErrors({});

    const method = isEditMode ? 'put' : 'post';
    const url = isEditMode ? `/api/pessoas-juridicas/${id}` : '/api/pessoas-juridicas';

    try {
      await axios[method](url, formData);
      navigate('/pessoas-juridicas');
    } catch (err: any) {
      setLoading(false);
      const newFieldErrors: { [key: string]: string } = {};

      if (axios.isAxiosError(err) && err.response) {
        const responseData = err.response.data;
        
        let message = '';
        if (responseData) {
          if (responseData.message) message = responseData.message;
          else if (responseData.detail) message = responseData.detail;
          else if (typeof responseData === 'string') message = responseData;
        }

        if (message.toLowerCase().includes('cnpj')) {
          newFieldErrors.cnpj = message;
        }
        else if (message.toLowerCase().includes('sigla')) {
          newFieldErrors.sigla = message;
        }

        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
        } else {
          setError(message || `Erro ${err.response.status}: Ocorreu um problema no servidor.`);
        }

      } else if (err.request) {
        setError('Não foi possível conectar ao servidor. Verifique sua rede.');
      } else {
        setError('Falha ao salvar. Ocorreu um erro inesperado.');
      }
    }
  };

  if (loading && !formData.razao_social) {
    return <div className="card-body">Carregando dados para edição...</div>;
  }

  return (
    <>
      <div className="page-header">
        <h2>{isEditMode ? 'Editar Pessoa Jurídica' : 'Adicionar Nova Pessoa Jurídica'}</h2>
      </div>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="form-layout">
            {error && <div className="form-error-message">{error}</div>}
            
            <div className="form-row">
              <div className="form-group" style={{ flex: 3 }}>
                <label htmlFor="razao_social">Razão Social</label>
                <input
                  type="text"
                  id="razao_social"
                  name="razao_social"
                  className={`form-input ${fieldErrors.razao_social ? 'has-error' : ''}`}
                  value={formData.razao_social}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.razao_social && <span className="form-field-error">{fieldErrors.razao_social}</span>}
              </div>

              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="nome_fantasia">Apelido</label>
                <input
                  type="text"
                  id="nome_fantasia"
                  name="nome_fantasia"
                  className="form-input"
                  value={formData.nome_fantasia}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="sigla">Sigla</label>
                <input
                  type="text"
                  id="sigla"
                  name="sigla"
                  className={`form-input ${fieldErrors.sigla ? 'has-error' : ''}`}
                  value={formData.sigla}
                  onChange={handleChange}
                />
                {fieldErrors.sigla && <span className="form-field-error">{fieldErrors.sigla}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="cnpj">CNPJ</label>
                <InputMask
                  mask="99.999.999/9999-99"
                  value={formData.cnpj}
                  onChange={handleChange}
                  name="cnpj"
                  required
                >
                  {(inputProps: any) => (
                    <input
                      {...inputProps}
                      id="cnpj"
                      className={`form-input ${fieldErrors.cnpj ? 'has-error' : ''}`}
                    />
                  )}
                </InputMask>
                {fieldErrors.cnpj && <span className="form-field-error">{fieldErrors.cnpj}</span>}
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="inscricao_estadual">Inscrição Estadual</label>
                <input type="text" id="inscricao_estadual" name="inscricao_estadual" className="form-input" value={formData.inscricao_estadual} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="inscricao_municipal">Inscrição Municipal</label>
                <input type="text" id="inscricao_municipal" name="inscricao_municipal" className="form-input" value={formData.inscricao_municipal} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 3 }}>
                <label htmlFor="endereco">Endereço</label>
                <input type="text" id="endereco" name="endereco" className="form-input" value={formData.endereco} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="complemento">Complemento</label>
                <input type="text" id="complemento" name="complemento" className="form-input" value={formData.complemento} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="cidade">Cidade</label>
                <input type="text" id="cidade" name="cidade" className="form-input" value={formData.cidade} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="estado">Estado</label>
                <input type="text" id="estado" name="estado" className="form-input" value={formData.estado} onChange={handleChange} maxLength={2} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="cep">CEP</label>
                <InputMask mask="99999-999" value={formData.cep} onChange={handleChange} name="cep">
                  {(inputProps: any) => <input {...inputProps} id="cep" className="form-input" />}
                </InputMask>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="pais">País</label>
                <input type="text" id="pais" name="pais" className="form-input" value={formData.pais} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tipo">Tipo</label>
              <select
                id="tipo"
                name="tipo"
                className="form-select"
                value={formData.tipo}
                onChange={handleChange}
              >
                <option value="Cliente">Cliente</option>
                <option value="Fornecedor">Fornecedor</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/pessoas-juridicas')}>
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

export default PessoaJuridicaForm;