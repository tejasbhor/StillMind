/**
 * StillMind — Auth Store (Zustand)
 * Persists the current user and manages login/logout.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, type AuthUser, type LoginPayload } from "@/services/api";
import { tokenStore } from "@/services/api";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  setAuth: (user: AuthUser) => void;
  logout: () => Promise<void>;
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

      setAuth: (user) => {
        localStorage.setItem("sm_user", JSON.stringify(user));
        set({ user, isLoading: false, error: null });
      },

      logout: async () => {
        await authApi.logout();
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

        // Best-effort: refresh + sync user from backend.
        // This keeps role/email accurate and supports cookie-based refresh.
        let token = tokenStore.getAccess();
        if (!token) {
          token = await authApi.refresh();
        }
        if (!token) {
          localStorage.removeItem("sm_user");
          set({ user: null });
          return;
        }

        try {
          const me = await authApi.me();
          localStorage.setItem("sm_user", JSON.stringify(me));
          set({ user: me });
        } catch {
          // If token is invalid/expired, clear local user (refresh logic will handle redirect).
          localStorage.removeItem("sm_user");
          set({ user: null });
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

