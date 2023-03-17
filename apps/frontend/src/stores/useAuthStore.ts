import { AccountWithoutPassword } from "local-types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  user: AccountWithoutPassword | null;
  loading: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: AccountWithoutPassword | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      loading: true,
      setAccessToken: (accessToken) => set({ accessToken, loading: true }),
      setUser: (user) => set({ user, loading: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
