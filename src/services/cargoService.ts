import api from './apiService';

//Busca uma lista de todos os cargos.
export async function getAllCargos() {
  const response = await api.get('/cargos');
  return response.data;
}

//Busca um cargo específico pelo ID.
export async function getCargoById(id: number) {
  const response = await api.get(`/cargos/${id}`);
  return response.data;
}

//Cria um novo cargo. Requer auth de Admin.
export async function createCargo(cargoData: { nome: string; descricao?: string }) {
  const response = await api.post('/cargos', cargoData);
  return response.data;
}

//Atualiza um cargo existente. Requer auth de Admin.
export async function updateCargo(id: number, cargoData: { nome?: string; descricao?: string }) {
  const response = await api.put(`/cargos/${id}`, cargoData);
  return response.data;
}

//Deleta um cargo. Requer auth de Admin.
export async function deleteCargo(id: number) {
  await api.delete(`/cargos/${id}`);
}
