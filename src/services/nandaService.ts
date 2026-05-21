import { api } from './api';

export const nandaService = {
  searchDiagnoses: async (query?: string, filters?: any) => {
    // Assuming backend takes query params or body
    const params = query ? { search: query, ...filters } : { ...filters };
    const response = await api.get('/diagnosticos', { params });
    return response.data;
  },

  getDiagnosisById: async (id: string | number) => {
    const response = await api.get(`/diagnosticos/${id}`);
    return response.data;
  },

  getFavoritos: async () => {
    const response = await api.get('/diagnosticos/favoritos');
    return response.data;
  },

  toggleFavorito: async (codigo_nanda: string) => {
    const response = await api.post(`/diagnosticos/${codigo_nanda}/favorito`);
    return response.data;
  },

  getHistorial: async () => {
    const response = await api.get('/diagnosticos/historial');
    return response.data;
  },

  clearHistorial: async () => {
    const response = await api.delete('/diagnosticos/historial');
    return response.data;
  }
};
