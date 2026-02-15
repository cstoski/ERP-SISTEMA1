import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/auth.css';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Usuário é obrigatório';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Usuário deve ter no mínimo 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não conferem';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpar erro do campo ao começar a digitar
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      // Redirecionar para login após cadastro bem-sucedido
      navigate('/login', { state: { message: 'Cadastro realizado com sucesso! Sua conta foi criada mas está pendente de ativação por um administrador. Você será notificado quando sua conta for ativada.' } });
    } catch (err: any) {
      setLoading(false);
      const message = err?.response?.data?.detail || 'Erro ao cadastrar. Tente novamente.';
      setError(message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card-body">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Cadastro</h2>
            <p className="auth-card-subtitle">Crie sua conta no sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="form-error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Usuário *</label>
              <input
                type="text"
                id="username"
                name="username"
                className={`form-input ${fieldErrors.username ? 'has-error' : ''}`}
                value={formData.username}
                onChange={handleChange}
                placeholder="Digite um nome de usuário"
                required
              />
              {fieldErrors.username && <span className="form-field-error">{fieldErrors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite seu email"
                required
              />
              {fieldErrors.email && <span className="form-field-error">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha *</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Digite sua senha (mínimo 6 caracteres)"
                required
              />
              {fieldErrors.password && <span className="form-field-error">{fieldErrors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirme a Senha *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input ${fieldErrors.confirmPassword ? 'has-error' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirme sua senha"
                required
              />
              {fieldErrors.confirmPassword && <span className="form-field-error">{fieldErrors.confirmPassword}</span>}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-footer">
          <p>
            Já tem uma conta? <a href="/login">Faça login aqui</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;