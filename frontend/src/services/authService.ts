import api from './api';

const authService = {
  register: (payload: { username: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', payload),
  login: async (payload: { username: string; password: string }) => {
    const params = new URLSearchParams();
    params.append('username', payload.username);
    params.append('password', payload.password);

    const res = await api.post('/auth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = res.data;
    if (data?.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    return data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
  },
  setToken: (token: string) => {
    localStorage.setItem('access_token', token);
  },
};

export default authService;