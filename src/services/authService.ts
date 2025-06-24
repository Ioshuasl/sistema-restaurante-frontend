import api from "./apiService";
import type { LoginCredentials} from '../types/interfaces-types';

/**
 * Configura o token JWT no cabeçalho de autorização para todas as requisições futuras.
 * @param {string | null} token - O token JWT retornado pela API ou null para limpar.
 */
export function setAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export async function login(credentials: LoginCredentials){
  const response = await api.post('/login', credentials);
  return response.data;
}
