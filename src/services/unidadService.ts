import { Unidad } from '../types/base_type';
import { api } from './api';

export const unidadService = {
  getUnidades: async (): Promise<{ total: number; datos: Unidad[] }> => {
    const response = await api.get('/unidades');
    return response.data;
  },

  getUnidad: async (id: number): Promise<Unidad> => {
    const response = await api.get(`/unidades/${id}`);
    return response.data;
  },

  createUnidad: async (data: Partial<Unidad>): Promise<Unidad> => {
    const response = await api.post('/unidades', data);
    return response.data;
  },

  updateUnidad: async (id: number, data: Partial<Unidad>): Promise<Unidad> => {
    const response = await api.put(`/unidades/${id}`, data);
    return response.data;
  }
};
