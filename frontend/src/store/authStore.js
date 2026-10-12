import { create } from 'zustand';
import { authApi } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('fh_user') || 'null'),
  token: localStorage.getItem('fh_token') || null,
  isAuthenticated: !!localStorage.getItem('fh_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      const { token, id, displayName, role } = res.data;
      const user = { id, email: res.data.email, displayName, role };
      localStorage.setItem('fh_token', token);
      localStorage.setItem('fh_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.register(userData);
      const { token, id, displayName, role } = res.data;
      const user = { id, email: res.data.email, displayName, role };
      localStorage.setItem('fh_token', token);
      localStorage.setItem('fh_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('fh_token');
    localStorage.removeItem('fh_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  refreshUser: async () => {
    try {
      const res = await authApi.getMe();
      if (res.data) {
        localStorage.setItem('fh_user', JSON.stringify(res.data));
        set({ user: res.data });
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }
}));
