import { create } from 'zustand';
import { authApi } from '../api/endpoints';
import { setAuthToken } from '../api/client';
import type { PublicUser } from '../api/types';

const STORAGE_KEY = 'qdx:auth';

interface AuthState {
  user: PublicUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

function persist(token: string | null, user: PublicUser | null) {
  if (token && user) localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  else localStorage.removeItem(STORAGE_KEY);
}

function restore(): { token: string | null; user: PublicUser | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as { token: string; user: PublicUser };
    setAuthToken(parsed.token);
    return parsed;
  } catch {
    return { token: null, user: null };
  }
}

const initial = restore();

export const useAuth = create<AuthState>((set) => ({
  user: initial.user,
  token: initial.token,

  login: async (email, password) => {
    const { token, user } = await authApi.login(email, password);
    setAuthToken(token);
    persist(token, user);
    set({ token, user });
  },

  register: async (name, email, password) => {
    const { token, user } = await authApi.register(name, email, password);
    setAuthToken(token);
    persist(token, user);
    set({ token, user });
  },

  logout: () => {
    setAuthToken(null);
    persist(null, null);
    set({ token: null, user: null });
  }
}));

/** Re-validate the stored session once at boot; drop it if the token expired. */
if (initial.token) {
  authApi
    .me()
    .then((user) => {
      persist(initial.token, user);
      useAuth.setState({ user });
    })
    .catch((err) => {
      if (err?.response?.status === 401) useAuth.getState().logout();
    });
}
