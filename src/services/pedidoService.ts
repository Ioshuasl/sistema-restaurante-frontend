import api from './api';
import { type Pedido, type CreatePedidoPayload, type UpdatePedidoPayload } from '../types/interfaces-types';

export const createPedido = async (payload: CreatePedidoPayload): Promise<Pedido> => {
  const response = await api.post('/pedido', payload);
  return response.data;
};

export const getAllPedidos = async (): Promise<Pedido[]> => {
  const response = await api.get('/pedido');
  return response.data.rows;
};

export const countAllPedidos = async (): Promise<Pedido[]> => {
  const response = await api.get('/pedido/count');
  return response.data;
};

export const getPedidoById = async (id: number): Promise<Pedido> => {
  const response = await api.get(`/pedido/${id}`);
  return response.data;
};

export const getPedidosByFormaPagamento = async (formaPagamentoId: number): Promise<Pedido[]> => {
  const response = await api.get(`/pedido/formaPagamento/${formaPagamentoId}`);
  return response.data;
};

export const updatePedido = async (id: number, payload: UpdatePedidoPayload): Promise<Pedido> => {
  const response = await api.put(`/pedido/${id}`, payload);
  return response.data;
};