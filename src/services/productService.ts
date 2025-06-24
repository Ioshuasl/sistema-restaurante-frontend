import api from './apiService';
import type { NewProductPayload } from '../types/interfaces-types';

//Busca todos os Produtos
export async function getAllProducts() {
  const response = await api.get('/produto');
  return response.data;
}

//Busca Produto por ID
export async function getProductById(id: number) {
  const response = await api.get(`/produto/${id}`);
  return response.data;
}

//Criar um novo Produto
export async function createProduct(productData: NewProductPayload) {
  const response = await api.post('/produto', productData);
  return response.data;
}

//Atualiza um Produto
export async function updateProduct(id: number, updateData: Partial<NewProductPayload>) {
  const response = await api.put(`/produto/${id}`, updateData);
  return response.data;
}

//Exclui um produto
export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/produto/${id}`);
}

//Toggle Produto entre Ativo e Inativo
export async function toggleProductIsActive(id: number) {
  const response = await api.put(`/produto/${id}/toggle`);
  return response.data;
}
