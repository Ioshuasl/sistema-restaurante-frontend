import api from './apiService';

//Busca todas as formas de pagamento.
export async function getAllFormasPagamento() {
  const response = await api.get('/formaPagamento');
  return response.data;
}

//Cria uma nova forma de pagamento. Requer auth de Admin.
export async function createFormaPagamento(data: { nomeFormaPagamento: string }) {
  const response = await api.post('/formaPagamento', data);
  return response.data;
}

//Atualiza uma forma de pagamento. Requer auth de Admin.
export async function updateFormaPagamento(id: number, data: { nomeFormaPagamento: string }) {
  const response = await api.put(`/formaPagamento/${id}`, data);
  return response.data;
}

//Deleta uma forma de pagamento. Requer auth de Admin.
export async function deleteFormaPagamento(id: number) {
  const response = await api.delete(`/formaPagamento/${id}`);
  return response.data;
}
