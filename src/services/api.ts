import axios from 'axios';

const api = axios.create({
  baseURL: 'https://projeto-backend-restaurante.lwcbm0.easypanel.host/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      window.location.pathname !== '/login'
    ) {
      // A lógica de logout automático só será executada fora da página de login.
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // É uma boa prática remover o usuário também
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
