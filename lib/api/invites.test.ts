import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInvite, deleteInvite, listInvites } from "./invites";

vi.mock("./client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "./client";
const mocked = vi.mocked(apiFetch);

beforeEach(() => mocked.mockReset());

describe("listInvites", () => {
  it("calls apiFetch with /admin/invites", () => {
    mocked.mockResolvedValue([]);
    listInvites();
    expect(mocked).toHaveBeenCalledWith("/admin/invites");
  });
});

describe("createInvite", () => {
  it("POSTs with expiresInDays when provided", () => {
    mocked.mockResolvedValue({});
    createInvite(7);
    expect(mocked).toHaveBeenCalledWith("/admin/invites", {
      method: "POST",
      body: JSON.stringify({ expiresInDays: 7 }),
    });
  });

  it("sends expiresInDays as null when omitted", () => {
    mocked.mockResolvedValue({});
    createInvite();
    expect(mocked).toHaveBeenCalledWith("/admin/invites", {
      method: "POST",
      body: JSON.stringify({ expiresInDays: null }),
    });
  });

  it("sends expiresInDays as null when undefined", () => {
    mocked.mockResolvedValue({});
    createInvite(undefined);
    expect(mocked).toHaveBeenCalledWith("/admin/invites", {
      method: "POST",
      body: JSON.stringify({ expiresInDays: null }),
    });
  });
});

describe("deleteInvite", () => {
  it("DELETEs /admin/invites/:id", () => {
    mocked.mockResolvedValue(undefined);
    deleteInvite("inv-1");
    expect(mocked).toHaveBeenCalledWith("/admin/invites/inv-1", {
      method: "DELETE",
    });
  });
});
