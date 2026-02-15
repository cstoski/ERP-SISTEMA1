import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import '../../styles/auth.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Usuário ou email é obrigatório';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }

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
      console.log('Tentando login com:', { username, password });
      await authService.login({ username, password });
      console.log('Login realizado com sucesso');
      
      // fetch profile and store simple display name
      try {
        const profile = await authService.getProfile();
        if (profile && profile.username) localStorage.setItem('username', profile.username);
      } catch (err) {
        console.warn('Erro ao carregar perfil:', err);
        // ignore
      }
      
      navigate(from, { replace: true });
    } catch (err: any) {
      setLoading(false);
      console.error('Erro ao fazer login:', err);
      
      // Extrair mensagem de erro de diferentes formatos
      let errorMessage = 'Erro ao fazer login';
      if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card-body">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Login</h2>
            <p className="auth-card-subtitle">Acesse sua conta no sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="form-error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Usuário ou email *</label>
              <input
                type="text"
                id="username"
                name="username"
                className={`form-input ${fieldErrors.username ? 'has-error' : ''}`}
                value={username}
                onChange={handleChange}
                placeholder="Digite seu usuário ou email"
                required
              />
              {fieldErrors.username && <span className="form-field-error">{fieldErrors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha *</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                value={password}
                onChange={handleChange}
                placeholder="Digite sua senha"
                required
              />
              {fieldErrors.password && <span className="form-field-error">{fieldErrors.password}</span>}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-footer">
          <p>
            Não tem uma conta? <a href="/signup">Cadastre-se aqui</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
