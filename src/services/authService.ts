import { api } from './api';
import { UserProfile } from '../types/base_type';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  requestOTP: async (email: string) => {
    const response = await api.post('/auth/otp/request', { email });
    return response.data;
  },

  verifyOTP: async (email: string, otp_code: string) => {
    const response = await api.post('/auth/otp/verify', { email, otp_code });
    return response.data;
  },

  resetPassword: async (reset_token: string, new_password: string) => {
    const response = await api.post('/auth/password/reset', { reset_token, new_password });
    return response.data;
  }
};
