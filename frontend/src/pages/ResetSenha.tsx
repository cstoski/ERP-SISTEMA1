import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/auth.css';

const ResetSenha: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token não fornecido. Link inválido ou expirado.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'newPassword') {
      setNewPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
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

    if (!token) {
      setError('Token não fornecido');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccess(true);
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' 
          } 
        });
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      const message = err?.response?.data?.detail || 'Erro ao redefinir senha. Tente novamente.';
      setError(message);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-body">
            <div className="auth-card-header">
              <h2 className="auth-card-title">Reset de Senha</h2>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div className="form-error-message">
                {error || 'Carregando...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card-body">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Reset de Senha</h2>
            <p className="auth-card-subtitle">Digite sua nova senha</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="form-error-message">{error}</div>
            )}

            {success && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '4px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                ✓ Senha redefinida com sucesso! Redirecionando para login...
              </div>
            )}

            <div className="form-group">
              <label htmlFor="newPassword">Nova Senha *</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className={`form-input ${fieldErrors.newPassword ? 'has-error' : ''}`}
                value={newPassword}
                onChange={handleChange}
                placeholder="Digite sua nova senha (mínimo 6 caracteres)"
                disabled={loading}
                required
              />
              {fieldErrors.newPassword && (
                <span className="form-field-error">{fieldErrors.newPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirme a Senha *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input ${fieldErrors.confirmPassword ? 'has-error' : ''}`}
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirme sua nova senha"
                disabled={loading}
                required
              />
              {fieldErrors.confirmPassword && (
                <span className="form-field-error">{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetSenha;
