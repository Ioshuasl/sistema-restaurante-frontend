import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3300/api', // URL base da sua API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Ou de onde você armazena
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Lógica para logout automático
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;