import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestWatchSync, getWatchSyncStatus } from "./watchSync";

vi.mock("./client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "./client";
const mocked = vi.mocked(apiFetch);

beforeEach(() => mocked.mockReset());

describe("requestWatchSync", () => {
  it("POSTs deviceId and trackIds to /sync/request", () => {
    mocked.mockResolvedValue({});
    requestWatchSync("watch-1", ["t1", "t2"]);
    expect(mocked).toHaveBeenCalledWith("/sync/request", {
      method: "POST",
      body: JSON.stringify({ deviceId: "watch-1", trackIds: ["t1", "t2"] }),
    });
  });
});

describe("getWatchSyncStatus", () => {
  it("calls /sync/status/:id", () => {
    mocked.mockResolvedValue({});
    getWatchSyncStatus("req-1");
    expect(mocked).toHaveBeenCalledWith("/sync/status/req-1");
  });
});
