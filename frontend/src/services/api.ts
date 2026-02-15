import axios from 'axios';

// Em desenvolvimento, usar proxy do vite (baseURL vazio)
// Em produção, usar URL absoluta da API
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // Em desenvolvimento, o vite proxy cuida de /api
    return '';
  }
  return import.meta.env.VITE_API_URL || '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

console.log('[API] Configurado com baseURL:', getBaseURL() || '(vazio - usando proxy do vite)');

// Attach Authorization header when token is present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const fullUrl = (config.baseURL || '') + (config.url || '');
  console.log('[API] Request:', config.method?.toUpperCase(), fullUrl);
  console.log('[API] Token presente:', !!token);
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('[API] Header Authorization adicionado');
  }
  return config;
});

// Log de respostas para diagnóstico
api.interceptors.response.use(
  (response) => {
    const fullUrl = (response.config.baseURL || '') + (response.config.url || '');
    console.log('[API] Response OK:', response.status, fullUrl);
    return response;
  },
  (error) => {
    const fullUrl = (error.config?.baseURL || '') + (error.config?.url || '');
    console.error('[API] Response Error:', error.response?.status, fullUrl);
    console.error('[API] Error data:', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
