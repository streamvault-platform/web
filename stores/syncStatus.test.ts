import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
}));

const { useSyncStatusStore } = await import("./syncStatus");

describe("useSyncStatusStore", () => {
  beforeEach(() => {
    useSyncStatusStore.setState({ synced: {}, syncing: {} });
  });

  it("generates a stable deviceId", () => {
    expect(useSyncStatusStore.getState().deviceId).toMatch(/^watch-/);
  });

  it("marks tracks as syncing", () => {
    useSyncStatusStore.getState().markSyncing(["t1", "t2"]);
    const { syncing, synced } = useSyncStatusStore.getState();
    expect(syncing).toEqual({ t1: true, t2: true });
    expect(synced).toEqual({});
  });

  it("moves tracks from syncing to synced", () => {
    useSyncStatusStore.getState().markSyncing(["t1", "t2"]);
    useSyncStatusStore.getState().markSynced(["t1"]);
    const { syncing, synced } = useSyncStatusStore.getState();
    expect(syncing).toEqual({ t2: true });
    expect(synced).toEqual({ t1: true });
  });
});
