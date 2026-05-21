import { api } from './api';
import { UserProfile } from '../types/base_type';

export const adminService = {
  getMetrics: async () => {
    const response = await api.get('/admin/metrics');
    return response.data;
  },

  getUsuarios: async (): Promise<UserProfile[]> => {
    const response = await api.get('/admin/usuarios');
    return response.data;
  },

  updateUsuarioEstado: async (userId: number, activo: boolean) => {
    const response = await api.patch(`/admin/usuarios/${userId}/estado`, { activo });
    return response.data;
  },

  updateUsuarioRol: async (userId: number, nuevo_rol: string) => {
    const response = await api.patch(`/admin/usuarios/${userId}/rol`, { nuevo_rol });
    return response.data;
  },

  getAuditoria: async () => {
    const response = await api.get('/admin/auditoria');
    return response.data;
  }
};
