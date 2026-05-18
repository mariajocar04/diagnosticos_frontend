import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { UserProfile } from '../types/base_type';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isGuest: boolean;
  
  // Actions
  setToken: (token: string | null) => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  setGuestMode: (isGuest: boolean) => void;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isGuest: false,

  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync('jwt_token', token);
    } else {
      await SecureStore.deleteItemAsync('jwt_token');
    }
    set({ token });
  },

  setUser: (user) => set({ user }),

  setGuestMode: (isGuest) => set({ isGuest }),

  logout: async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    set({ token: null, user: null, isGuest: false });
  },

  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('jwt_token');
      if (token) {
        set({ token });
      }
    } catch (e) {
      console.error('Failed to load auth from secure store', e);
    }
  }
}));
