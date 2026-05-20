import { api } from './api';
import { Patient, PatientCreate, PatientUpdate, NotaEnfermeria, NotaEnfermeriaCreate } from '../types/base_type';

export const patientService = {
  getPatients: async (search?: string): Promise<Patient[]> => {
    const response = await api.get('/pacientes', {
      params: search ? { search } : undefined,
    });
    return response.data.datos || [];
  },

  getPatientById: async (id: number): Promise<Patient> => {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  },

  createPatient: async (data: PatientCreate): Promise<Patient> => {
    const response = await api.post('/pacientes', data);
    return response.data;
  },

  updatePatient: async (id: number, data: PatientUpdate): Promise<Patient> => {
    const response = await api.put(`/pacientes/${id}`, data);
    return response.data;
  },

  deletePatient: async (id: number): Promise<void> => {
    await api.delete(`/pacientes/${id}`);
  },

  getNotes: async (patientId: number): Promise<NotaEnfermeria[]> => {
    const response = await api.get(`/pacientes/${patientId}/notas`);
    return response.data.datos || [];
  },

  createNote: async (patientId: number, data: NotaEnfermeriaCreate): Promise<NotaEnfermeria> => {
    const response = await api.post(`/pacientes/${patientId}/notas`, data);
    return response.data;
  },
};

