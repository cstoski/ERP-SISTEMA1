import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

const AlterarSenha: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'perfil' | 'senha'>('perfil');
  
  // Estado para edição de perfil
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [successProfile, setSuccessProfile] = useState(false);
  
  // Estado para alteração de senha
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [successPassword, setSuccessPassword] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      const user = await authService.getProfile();
      setCurrentUser(user);
      setUsername(user.username);
      setEmail(user.email);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  };

  const validateProfileForm = (): string | null => {
    if (!username.trim()) return 'Usuário é obrigatório';
    if (username.length < 3) return 'Usuário deve ter no mínimo 3 caracteres';
    if (!email.trim()) return 'Email é obrigatório';
    if (!email.includes('@') || !email.includes('.')) return 'Email inválido';
    return null;
  };

  const validatePasswordForm = (): string | null => {
    if (!oldPassword) return 'Senha atual é obrigatória';
    if (!newPassword) return 'Nova senha é obrigatória';
    if (!confirmPassword) return 'Confirmação de senha é obrigatória';
    if (newPassword.length < 6) return 'Nova senha deve ter no mínimo 6 caracteres';
    if (newPassword !== confirmPassword) return 'As senhas não coincidem';
    return null;
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateProfileForm();
    if (validationError) {
      setErrorProfile(validationError);
      return;
    }

    try {
      setLoadingProfile(true);
      setErrorProfile(null);
      
      // Só enviar os campos que foram alterados
      const usernameChanged = username !== currentUser?.username;
      const emailChanged = email !== currentUser?.email;
      
      await authService.updateProfile(
        usernameChanged ? username : undefined,
        emailChanged ? email : undefined
      );
      
      setSuccessProfile(true);
      setCurrentUser({ username, email });
      setTimeout(() => setSuccessProfile(false), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Erro ao atualizar perfil';
      setErrorProfile(String(errorMsg));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validatePasswordForm();
    if (validationError) {
      setErrorPassword(validationError);
      return;
    }

    try {
      setLoadingPassword(true);
      setErrorPassword(null);
      await authService.changePassword(oldPassword, newPassword);
      setSuccessPassword(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessPassword(false), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Erro ao alterar senha';
      setErrorPassword(String(errorMsg));
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Meu Perfil</h2>
      </div>
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="card-body">
          {/* Abas */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid #e0e0e0',
            marginBottom: '1.5rem',
            gap: '0'
          }}>
            <button
              onClick={() => setActiveTab('perfil')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: activeTab === 'perfil' ? '#007bff' : '#f5f5f5',
                color: activeTab === 'perfil' ? 'white' : '#333',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === 'perfil' ? 'bold' : 'normal',
                borderBottom: activeTab === 'perfil' ? '3px solid #007bff' : 'none'
              }}
              className="btn"
            >
              Dados Pessoais
            </button>
            <button
              onClick={() => setActiveTab('senha')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: activeTab === 'senha' ? '#007bff' : '#f5f5f5',
                color: activeTab === 'senha' ? 'white' : '#333',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === 'senha' ? 'bold' : 'normal',
                borderBottom: activeTab === 'senha' ? '3px solid #007bff' : 'none'
              }}
              className="btn"
            >
              Alterar Senha
            </button>
          </div>

          {/* Aba de Perfil */}
          {activeTab === 'perfil' && (
            <form onSubmit={handleSubmitProfile}>
              {errorProfile && (
                <div className="form-error-message" style={{ marginBottom: '1rem' }}>
                  {errorProfile}
                </div>
              )}
              
              {successProfile && (
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}>
                  ✓ Perfil atualizado com sucesso!
                </div>
              )}

              <div className="form-group">
                <label>Usuário *</label>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nome de usuário"
                  disabled={loadingProfile}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email"
                  disabled={loadingProfile}
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loadingProfile}
                >
                  {loadingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          )}

          {/* Aba de Senha */}
          {activeTab === 'senha' && (
            <form onSubmit={handleSubmitPassword}>
              {errorPassword && (
                <div className="form-error-message" style={{ marginBottom: '1rem' }}>
                  {errorPassword}
                </div>
              )}
              
              {successPassword && (
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}>
                  ✓ Senha alterada com sucesso!
                </div>
              )}

              <div className="form-group">
                <label>Senha Atual *</label>
                <input
                  type="password"
                  className="form-input"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  disabled={loadingPassword}
                />
              </div>

              <div className="form-group">
                <label>Nova Senha *</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite uma nova senha"
                  disabled={loadingPassword}
                />
              </div>

              <div className="form-group">
                <label>Confirmar Senha *</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  disabled={loadingPassword}
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loadingPassword}
                >
                  {loadingPassword ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default AlterarSenha;
