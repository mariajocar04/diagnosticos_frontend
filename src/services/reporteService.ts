import { api } from './api';

export const reporteService = {
  exportPatientPdf: async (paciente_id: number) => {
    // Return Blob to handle file download in frontend
    const response = await api.get(`/reportes/paciente/${paciente_id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getHistorialReportes: async () => {
    const response = await api.get('/reportes/historial');
    return response.data;
  }
};
