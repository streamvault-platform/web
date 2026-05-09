import { beforeEach, describe, expect, it, vi } from "vitest";

// AsyncStorage is a native module — mock it for tests
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

// Import after mocks are in place
const { useSettingsStore } = await import("./settings");

describe("useSettingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({ serverUrl: "" });
  });

  it("initialises with an empty server URL", () => {
    expect(useSettingsStore.getState().serverUrl).toBe("");
  });

  it("stores the server URL", () => {
    useSettingsStore.getState().setServerUrl("http://localhost:8080");
    expect(useSettingsStore.getState().serverUrl).toBe("http://localhost:8080");
  });

  it("strips trailing slashes", () => {
    useSettingsStore.getState().setServerUrl("http://localhost:8080///");
    expect(useSettingsStore.getState().serverUrl).toBe("http://localhost:8080");
  });
});
