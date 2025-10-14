import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../lib/api";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      signIn: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
          await api.post("/auth/login", { email, password });
          const { data } = await api.get("/auth/me");
          set({ user: data, loading: false });
        } catch (e) {
          const msg =
            e?.response?.data?.message || e.message || "Unable to sign in.";
          set({ error: msg, loading: false });
          throw e;
        }
      },

      signUp: async ({ email, password, displayName }) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post("/auth/signup", {
            email,
            password,
            displayName,
          });
          set({ user: data, loading: false });
        } catch (e) {
          const msg =
            e?.response?.data?.message || e.message || "Unable to sign up.";
          set({ error: msg, loading: false });
          throw e;
        }
      },

      signOut: async () => {
        try {
          await api.post("/auth/logout");
        } catch {}
        set({ user: null });
      },
    }),
    {
      name: "fueltracker-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user }),
    }
  )
);
