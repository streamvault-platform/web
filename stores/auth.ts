import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const KEY_ACCESS = "sv_access_token";
const KEY_REFRESH = "sv_refresh_token";

// SecureStore.isAvailableAsync() checks the underlying native module at runtime.
// On web, expo-secure-store ships an empty native module, so it returns false there.
// We resolve this once at startup and reuse it for all token operations.
let secureStoreAvailable: boolean | null = null;
async function isSecure(): Promise<boolean> {
  if (secureStoreAvailable === null) {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
  }
  return secureStoreAvailable;
}

const storage = {
  get: async (key: string) =>
    (await isSecure()) ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key),
  set: async (key: string, value: string) =>
    (await isSecure()) ? SecureStore.setItemAsync(key, value) : AsyncStorage.setItem(key, value),
  delete: async (key: string) =>
    (await isSecure()) ? SecureStore.deleteItemAsync(key) : AsyncStorage.removeItem(key),
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
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
      storage.get(KEY_ACCESS),
      storage.get(KEY_REFRESH),
    ]);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: !!access });
  },

  setTokens: async (access, refresh) => {
    await Promise.all([
      storage.set(KEY_ACCESS, access),
      storage.set(KEY_REFRESH, refresh),
    ]);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  clearTokens: async () => {
    await Promise.all([
      storage.delete(KEY_ACCESS),
      storage.delete(KEY_REFRESH),
    ]);
    set({ accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
