import api from './apiService';

export async function getAllCategories(){
  const response = await api.get('/categoriaProduto');
  return response.data;
}

export async function getCategoryById(id: number) {
  const response = await api.get(`/categoriaProduto/${id}`);
  return response.data;
}

export async function createCategory(data: { nomeCategoriaProduto: string }) {
  const response = await api.post('/categoriaProduto', data);
  return response.data;
}

export async function updateCategory(id: number, data: { nomeCategoriaProduto: string }){
  const response = await api.put(`/categoriaProduto/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number){
  const response = await api.delete(`/categoriaProduto/${id}`);
  return response.data;
}
