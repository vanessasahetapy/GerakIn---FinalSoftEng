// === FILE: src/store/authStore.ts ===
import { create } from 'zustand';

export type Role = 'user' | 'trainer' | 'admin';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  streak?: number;
  rating?: number;
  specialty?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  role: Role | null;
  login: (user: CurrentUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  currentUser: null,
  role: null,
  login: (user) => set({ isAuthenticated: true, currentUser: user, role: user.role }),
  logout: () => set({ isAuthenticated: false, currentUser: null, role: null }),
}));
