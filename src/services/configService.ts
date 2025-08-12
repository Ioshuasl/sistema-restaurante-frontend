import api from './api';
import { type Config, type UpdateConfigPayload } from '../types/interfaces-types';

export const getConfig = async (): Promise<Config> => {
  const response = await api.get('/config');
  console.log(response.data)
  return response.data;
};

export const updateConfig = async (payload: UpdateConfigPayload): Promise<Config> => {
    // O backend atualiza a configuração com ID 1, então não é necessário passar o ID
    const response = await api.put('/config', payload);
    return response.data;
};