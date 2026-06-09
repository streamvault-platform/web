import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/watch-bridge", () => ({
  sendConfigToWatch: vi.fn(),
}));

const { sendConfigToWatch } = await import("@/modules/watch-bridge");
const { useWatchSyncStore } = await import("./watchSync");

const mockSend = vi.mocked(sendConfigToWatch);

const config = {
  serverUrl: "http://localhost:8080",
  accessToken: "access",
  refreshToken: "refresh",
};

describe("useWatchSyncStore", () => {
  beforeEach(() => {
    useWatchSyncStore.setState({ lastSyncedAt: null });
    mockSend.mockReset();
  });

  it("starts with no last sync timestamp", () => {
    expect(useWatchSyncStore.getState().lastSyncedAt).toBeNull();
  });

  it("calls sendConfigToWatch with the supplied config", async () => {
    mockSend.mockResolvedValue(undefined);
    await useWatchSyncStore.getState().sendConfig(config);
    expect(mockSend).toHaveBeenCalledWith(config);
  });

  it("sets lastSyncedAt after a successful send", async () => {
    mockSend.mockResolvedValue(undefined);
    const before = Date.now();
    await useWatchSyncStore.getState().sendConfig(config);
    expect(useWatchSyncStore.getState().lastSyncedAt).toBeGreaterThanOrEqual(before);
  });

  it("propagates errors from the native module", async () => {
    mockSend.mockRejectedValue(new Error("native error"));
    await expect(useWatchSyncStore.getState().sendConfig(config)).rejects.toThrow("native error");
    expect(useWatchSyncStore.getState().lastSyncedAt).toBeNull();
  });
});
