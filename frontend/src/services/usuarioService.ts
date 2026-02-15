import api from './api';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  criado_em: string;
  atualizado_em: string;
}

const API_URL = '/api/auth';

const usuarioService = {
  listarTodos: async (): Promise<Usuario[]> => {
    const response = await api.get(`${API_URL}/users`);
    return response.data;
  },

  deletar: async (id: number) => {
    const response = await api.delete(`${API_URL}/users/${id}`);
    return response.data;
  },

  toggleStatus: async (id: number) => {
    const response = await api.patch(`${API_URL}/users/${id}/toggle-status`);
    return response.data;
  },

  enviarResetSenha: async (id: number) => {
    const response = await api.post(`${API_URL}/users/${id}/reset-password`);
    return response.data;
  },
};

export default usuarioService;
