import api from './apiService';
import type { Config } from '../types/interfaces-types';

//Busca as configurações do sistema. Requer auth de Admin.
export async function getConfig(){
  const response = await api.get('/config');
  return response.data;
}

//Atualiza as configurações do sistema. Requer auth de Admin.
export async function updateConfig(configData: Partial<Config>){
  const response = await api.put('/config', configData);
  return response.data;
}
