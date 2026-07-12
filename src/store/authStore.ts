import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';
import type { AuthUser } from '../api/auth';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authApi.login(email, password);
          localStorage.setItem('fintrack_token', token);
          localStorage.setItem('fintrack_user', JSON.stringify(user));
          set({ token, user, isLoading: false });
        } catch (err: any) {
          console.error("Auth error details:", err);
          let message = 'Login failed';
          if (err.response?.data?.message) {
            message = err.response.data.message;
          } else if (err.message) {
            message = `Network Error: ${err.message}`;
          }
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authApi.register(name, email, password);
          localStorage.setItem('fintrack_token', token);
          localStorage.setItem('fintrack_user', JSON.stringify(user));
          set({ token, user, isLoading: false });
        } catch (err: any) {
          console.error("Auth error details:", err);
          let message = 'Registration failed';
          if (err.response?.data?.message) {
            message = err.response.data.message;
          } else if (err.message) {
            message = `Network Error: ${err.message}`;
          }
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: () => {
        localStorage.removeItem('fintrack_token');
        localStorage.removeItem('fintrack_user');
        localStorage.removeItem('finance-tracker-store');
        set({ token: null, user: null, error: null });
      },

      clearError: () => set({ error: null }),

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
    }),
    {
      name: 'fintrack-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
