import { vi } from "vitest";
import "@testing-library/jest-dom";

// Native modules that cannot run in Node — stub them globally
vi.mock("@expo/vector-icons/MaterialIcons", () => ({ default: () => null }));
vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));
vi.mock("expo-modules-core", () => ({
  NativeModulesProxy: {},
  EventEmitter: vi.fn(),
  requireNativeModule: vi.fn(() => ({})),
}));
