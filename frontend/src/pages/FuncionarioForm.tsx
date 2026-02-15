import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InputMask from 'react-input-mask';
import funcionarioService from '../services/funcionarioService';

interface Funcionario {
  nome: string;
  departamento?: string;
  telefone_fixo?: string;
  celular?: string;
  email?: string;
}

const FuncionarioForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Funcionario>({
    nome: '',
    departamento: '',
    telefone_fixo: '',
    celular: '',
    email: '',
  });

  useEffect(() => {
    if (isEditMode) {
      carregarFuncionario();
    }
  }, [id]);

  const carregarFuncionario = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const funcionario = await funcionarioService.obter(parseInt(id));
      setFormData(funcionario);
    } catch (err) {
      console.error('Erro ao carregar funcionário:', err);
      alert('Erro ao carregar funcionário');
      navigate('/funcionarios');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      if (isEditMode && id) {
        await funcionarioService.atualizar(parseInt(id), formData);
        alert('Funcionário atualizado com sucesso!');
      } else {
        await funcionarioService.criar(formData);
        alert('Funcionário criado com sucesso!');
      }
      navigate('/funcionarios');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      const errorMsg = err.response?.data?.detail || 'Erro ao salvar funcionário';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h2>{isEditMode ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                name="nome"
                placeholder="Digite o nome do funcionário"
                className={`form-input ${errors.nome ? 'input-error' : ''}`}
                value={formData.nome}
                onChange={handleChange}
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Departamento</label>
                <input
                  type="text"
                  name="departamento"
                  placeholder="Digite o departamento"
                  className="form-input"
                  value={formData.departamento || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Digite o email"
                  className="form-input"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Telefone Fixo</label>
                <InputMask
                  mask="(99) 9999-9999"
                  name="telefone_fixo"
                  placeholder="(XX) 9999-9999"
                  className="form-input"
                  value={formData.telefone_fixo || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Celular</label>
                <InputMask
                  mask="(99) 99999-9999"
                  name="celular"
                  placeholder="(XX) 99999-9999"
                  className="form-input"
                  value={formData.celular || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/funcionarios')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FuncionarioForm;
