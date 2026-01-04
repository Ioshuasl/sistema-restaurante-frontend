
import api from './api';
import { type Menu } from '../types';

export const getMenu = async (): Promise<Menu[]> => {
  const response = await api.get('/menu');
  return response.data;
};
