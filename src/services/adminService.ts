import { UserProfile, UnidadBoardColumn } from '../types/base_type';
import { api } from './api';

export const adminService = {
  getMetrics: async () => {
    const response = await api.get('/metrics');
    return response.data;
  },

  getUsuarios: async (): Promise<UserProfile[]> => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  updateUsuarioEstado: async (userId: number, activo: boolean) => {
    const response = await api.patch(`/usuarios/${userId}/estado`, { activo });
    return response.data;
  },

  updateUsuarioRol: async (userId: number, rol_id: number) => {
    const response = await api.patch(`/usuarios/${userId}/rol`, { rol_id });
    return response.data;
  },

  getAuditoria: async () => {
    const response = await api.get('/auditoria');
    return response.data;
  },
  
  getRemissionsBoard: async (): Promise<UnidadBoardColumn[]> => {
    const response = await api.get('/remisiones-board');
    return response.data;
  }
};
