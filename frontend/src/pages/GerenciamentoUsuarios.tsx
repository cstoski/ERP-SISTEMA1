import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import usuarioService, { Usuario } from '../services/usuarioService';

const GerenciamentoUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('user_role') || 'user';
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [usuarioToResetPassword, setUsuarioToResetPassword] = useState<Usuario | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se é admin
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }
    carregarUsuarios();
  }, [userRole, navigate]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuarioService.listarTodos();
      setUsuarios(data);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      const errorMsg = err?.response?.data?.detail || 'Erro ao carregar usuários';
      setError(String(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (usuario: Usuario) => {
    try {
      setLoading(true);
      await usuarioService.toggleStatus(usuario.id);
      setSuccessMessage(`Usuário ${usuario.is_active ? 'desativado' : 'ativado'} com sucesso`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await carregarUsuarios();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Erro ao atualizar status';
      setError(String(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!usuarioToDelete) return;

    try {
      setLoading(true);
      await usuarioService.deletar(usuarioToDelete.id);
      setSuccessMessage('Usuário deletado com sucesso');
      setTimeout(() => setSuccessMessage(null), 3000);
      setUsuarioToDelete(null);
      await carregarUsuarios();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Erro ao deletar usuário';
      setError(String(errorMsg));
      setUsuarioToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!usuarioToResetPassword) return;

    try {
      setLoading(true);
      await usuarioService.enviarResetSenha(usuarioToResetPassword.id);
      setSuccessMessage(`Email de reset enviado para ${usuarioToResetPassword.email}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setUsuarioToResetPassword(null);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Erro ao enviar reset de senha';
      setError(String(errorMsg));
      setUsuarioToResetPassword(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && usuarios.length === 0) {
    return <div className="card-body">Carregando...</div>;
  }

  return (
    <>
      <div className="page-header">
        <h2>Gerenciamento de Usuários</h2>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-body">
            <div className="form-error-message">{error}</div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-body">
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '4px'
            }}>
              ✓ {successMessage}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {usuarios.length === 0 ? (
            <p>Nenhum usuário cadastrado.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '280px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(usuario => (
                    <tr key={usuario.id}>
                      <td>{usuario.username}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: usuario.role === 'admin' ? '#e3f2fd' : '#f5f5f5',
                          color: usuario.role === 'admin' ? '#1976d2' : '#333',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}>
                          {usuario.role}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: usuario.is_active ? '#d4edda' : '#f8d7da',
                          color: usuario.is_active ? '#155724' : '#721c24',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}>
                          {usuario.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="actions" style={{ gap: '0.5rem' }}>
                          <button
                            className="btn-action"
                            onClick={() => handleToggleStatus(usuario)}
                            disabled={loading}
                            title={usuario.is_active ? 'Desativar' : 'Ativar'}
                          >
                            {usuario.is_active ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 12a11.05 11.05 0 0 0-22 0dm.5 2"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5.523 0-10-4.477-10-10S6.477 0 12 0s10 4.477 10 10M1 1l22 22"></path></svg>
                            )}
                          </button>
                          <button
                            className="btn-action"
                            onClick={() => setUsuarioToResetPassword(usuario)}
                            disabled={loading}
                            title="Enviar reset de senha"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="11" r="8"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path><path d="M12 11v-4"></path><path d="M12 11h4"></path></svg>
                          </button>
                          <button
                            className="btn-action"
                            onClick={() => setUsuarioToDelete(usuario)}
                            disabled={loading}
                            title="Deletar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação de reset de senha */}
      {usuarioToResetPassword && (
        <Modal
          isOpen={true}
          onClose={() => setUsuarioToResetPassword(null)}
          title="Enviar Email de Reset de Senha"
        >
          <div>
            <p>Enviar email de reset de senha para <strong>{usuarioToResetPassword.email}</strong>?</p>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setUsuarioToResetPassword(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleResetPassword}
              >
                Enviar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de confirmação de exclusão */}
      {usuarioToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setUsuarioToDelete(null)}
          title="Confirmar Exclusão"
        >
          <div>
            <p>Você tem certeza que deseja deletar o usuário <strong>{usuarioToDelete.username}</strong>?</p>
            <p style={{ color: '#d32f2f', fontSize: '0.9rem' }}>Esta ação não pode ser desfeita.</p>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setUsuarioToDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Deletar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default GerenciamentoUsuarios;
