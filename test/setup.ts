import { vi } from "vitest";
import "@testing-library/jest-dom";

// Native modules that cannot run in Node — stub them globally
vi.mock("@expo/vector-icons/MaterialIcons", () => ({ default: () => null }));
vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    multiGet: vi.fn(),
    multiSet: vi.fn(),
    multiRemove: vi.fn(),
  },
}));
vi.mock("expo-modules-core", () => ({
  NativeModulesProxy: {},
  EventEmitter: vi.fn(),
  requireNativeModule: vi.fn(() => ({})),
}));
vi.mock("expo-file-system", () => {
  class MockFile {
    uri: string;
    size = 0;
    exists = false;
    delete = vi.fn();
    constructor(pathOrDir: unknown, name?: string) {
      this.uri = name ? `${String(pathOrDir)}/${name}` : String(pathOrDir);
    }
    static downloadFileAsync = vi.fn();
  }
  class MockDirectory {
    exists = false;
    create = vi.fn();
    delete = vi.fn();
  }
  return { File: MockFile, Directory: MockDirectory, Paths: { document: "/mock-documents" } };
});
