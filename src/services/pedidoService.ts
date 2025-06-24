import api from './apiService';
import type { Pedido, NewPedidoPayload } from '../types/interfaces-types';

//Cria um novo pedido.
export async function createPedido(pedidoData: NewPedidoPayload) {
  const response = await api.post('/pedido', pedidoData);
  return response.data;
}

//Busca todos os pedidos. Requer autenticação de Admin.
export async function getAllPedidos(){
  const response = await api.get('/pedido');
  return response.data;
}

//Busca pedidos filtrados por forma de pagamento. Requer auth de Admin.
export async function getPedidosByFormaPagamento(formaPagamentoId: number){
    const response = await api.get(`/pedido/formaPagamento/${formaPagamentoId}`);
    return response.data;
}

//Atualiza um pedido existente. Requer auth de Admin.
export async function updatePedido(id: number, updateData: Partial<Pedido>) {
    const response = await api.put(`/pedido/${id}`, updateData);
    return response.data;
}
