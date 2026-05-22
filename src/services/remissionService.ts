import { Remision, RemisionCreate } from '../types/base_type';
import { api } from './api';

export const remissionService = {
  getRemisiones: async (skip: number = 0, limit: number = 100, unidad_id?: number, estado?: string): Promise<{ total: number; datos: Remision[] }> => {
    let url = `/remisiones?skip=${skip}&limit=${limit}`;
    if (unidad_id) url += `&unidad_id=${unidad_id}`;
    if (estado) url += `&estado=${estado}`;
    const response = await api.get(url);
    return response.data;
  },

  getRemission: async (id: number): Promise<Remision> => {
    const response = await api.get(`/remisiones/${id}`);
    return response.data;
  },

  createRemission: async (data: RemisionCreate): Promise<Remision> => {
    const response = await api.post('/remisiones', data);
    return response.data;
  },

  updateRemission: async (id: number, data: Partial<Remision>): Promise<Remision> => {
    const response = await api.put(`/remisiones/${id}`, data);
    return response.data;
  },

  changeState: async (id: number, estado: string): Promise<Remision> => {
    const response = await api.post(`/remisiones/${id}/estado?estado=${estado}`);
    return response.data;
  }
};
