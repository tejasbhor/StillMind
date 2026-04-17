/**
 * StillMind — Auth Store (Zustand)
 * Persists the current user and manages login/logout.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, type AuthUser, type LoginPayload } from "@/services/api";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.login(payload);
          // Tokens already stored by authApi.login
          localStorage.setItem("sm_user", JSON.stringify(result.user));
          set({ user: result.user, isLoading: false });
        } catch (err: any) {
          set({ error: err.message ?? "Login failed", isLoading: false });
          throw err;
        }
      },

      logout: () => {
        authApi.logout();
        set({ user: null, error: null });
      },

      init: async () => {
        // Rehydrate user from localStorage on app load
        const stored = localStorage.getItem("sm_user");
        if (stored) {
          try {
            const user = JSON.parse(stored);
            set({ user });
          } catch {
            // Invalid stored user, clear it
            localStorage.removeItem("sm_user");
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "sm-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

