import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
