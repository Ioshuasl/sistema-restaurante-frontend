import api from './apiService';
import type { NewUserPayload } from '../types/interfaces-types';

// Busca todos os Usuários 
export async function getAllUsers() {
  const response = await api.get('/user');
  return response.data;
}

// Busca Usuário por ID
export async function getUserById(id: number) {
  const response = await api.get(`/user/${id}`);
  return response.data;
}

// Cria um novo Usuário
export async function createUser(userData: NewUserPayload) {
  const response = await api.post('/user', userData);
  return response.data;
}

// Atualiza um Usuário
export async function updateUser(id: number, updateData: Partial<NewUserPayload>) {
  const response = await api.put(`/user/${id}`, updateData);
  return response.data;
}

// Deleta um usuário
export async function deleteUser(id: number) {
  await api.delete(`/user/${id}`);
}
