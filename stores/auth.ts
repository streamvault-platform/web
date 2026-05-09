import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const KEY_ACCESS = "sv_access_token";
const KEY_REFRESH = "sv_refresh_token";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  /** Call on app start to hydrate in-memory state from SecureStore */
  loadTokens: () => Promise<void>;
  setTokens: (access: string, refresh: string) => Promise<void>;
  clearTokens: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  loadTokens: async () => {
    const [access, refresh] = await Promise.all([
      SecureStore.getItemAsync(KEY_ACCESS),
      SecureStore.getItemAsync(KEY_REFRESH),
    ]);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: !!access });
  },

  setTokens: async (access, refresh) => {
    await Promise.all([
      SecureStore.setItemAsync(KEY_ACCESS, access),
      SecureStore.setItemAsync(KEY_REFRESH, refresh),
    ]);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  clearTokens: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEY_ACCESS),
      SecureStore.deleteItemAsync(KEY_REFRESH),
    ]);
    set({ accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
