// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createQueryWrapper } from "@/test/utils";
import { requestWatchSync, connectWatchSyncWs } from "@/lib/api/watchSync";
import { useSyncStatusStore } from "@/stores/syncStatus";
import { useAlbumSyncStatus, useSyncToWatch, useTrackSyncStatus } from "./watchSync";

vi.mock("@/lib/api/watchSync");
vi.mock("@/stores/auth", () => ({
  useAuthStore: { getState: () => ({ accessToken: "token" }) },
}));
vi.mock("@/stores/settings", () => ({
  useSettingsStore: { getState: () => ({ serverUrl: "http://localhost:8080" }) },
}));

beforeEach(() => {
  vi.resetAllMocks();
  useSyncStatusStore.setState({ synced: {}, syncing: {}, deviceId: "watch-test" });
});

describe("useTrackSyncStatus", () => {
  it("reflects the store state for a given track", () => {
    useSyncStatusStore.getState().markSyncing(["t1"]);
    const { result } = renderHook(() => useTrackSyncStatus("t1"));
    expect(result.current).toEqual({ isSynced: false, isSyncing: true });
  });
});

describe("useAlbumSyncStatus", () => {
  it("is synced only once every track id is synced", () => {
    useSyncStatusStore.getState().markSynced(["t1"]);
    const { result, rerender } = renderHook(({ ids }) => useAlbumSyncStatus(ids), {
      initialProps: { ids: ["t1", "t2"] },
    });
    expect(result.current.isSynced).toBe(false);

    useSyncStatusStore.getState().markSynced(["t2"]);
    rerender({ ids: ["t1", "t2"] });
    expect(result.current.isSynced).toBe(true);
  });
});

describe("useSyncToWatch", () => {
  it("marks tracks syncing and requests sync with the store's deviceId", async () => {
    vi.mocked(requestWatchSync).mockResolvedValue({
      syncRequestId: "req-1",
      status: "PENDING",
      deviceId: "watch-test",
      trackCount: 2,
      manifest: null,
    });

    const { result } = renderHook(() => useSyncToWatch(), { wrapper: createQueryWrapper() });

    await act(async () => {
      result.current.mutate(["t1", "t2"]);
    });

    expect(requestWatchSync).toHaveBeenCalledWith("watch-test", ["t1", "t2"]);
    expect(connectWatchSyncWs).toHaveBeenCalledWith("http://localhost:8080", "token", "watch-test", expect.any(Function));
    expect(useSyncStatusStore.getState().syncing).toEqual({ t1: true, t2: true });
  });
});
