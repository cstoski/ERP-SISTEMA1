import api from './api';

const authService = {
  register: (payload: { username: string; email: string; password: string; role?: string }) =>
    api.post('/api/auth/register', payload),
  
  login: async (payload: { username: string; password: string }) => {
    try {
      console.log('Enviando login para:', payload);
      
      // Enviar como JSON - FastAPI aceitará
      const res = await api.post('/api/auth/token', {
        username: payload.username,
        password: payload.password,
      });
      
      console.log('Resposta de login:', res.data);
      
      const data = res.data;
      if (data?.access_token) {
        console.log('[authService] Salvando token no localStorage...');
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('username', payload.username);
        console.log('[authService] Token salvo. Verificando:', !!localStorage.getItem('access_token'));
        
        // Obter dados completos do usuário (incluindo role)
        try {
          const userRes = await api.get('/api/auth/me');
          const userData = userRes.data;
          localStorage.setItem('user_role', userData.role || 'user');
          console.log('[authService] Role do usuário:', userData.role);
          console.log('[authService] localStorage após login:', {
            access_token: !!localStorage.getItem('access_token'),
            username: localStorage.getItem('username'),
            user_role: localStorage.getItem('user_role')
          });
        } catch (err) {
          console.error('Erro ao obter dados do usuário:', err);
          localStorage.setItem('user_role', 'user');
        }
      }
      return data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  getProfile: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');
  },

  setToken: (token: string) => {
    localStorage.setItem('access_token', token);
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const res = await api.post('/api/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  },

  updateProfile: async (username?: string, email?: string) => {
    const payload: { username?: string; email?: string } = {};
    if (username) payload.username = username;
    if (email) payload.email = email;
    
    const res = await api.patch('/api/auth/me', payload);
    
    // Atualizar localStorage se username foi alterado
    if (username) {
      localStorage.setItem('username', username);
    }
    
    return res.data;
  },
};

export default authService;