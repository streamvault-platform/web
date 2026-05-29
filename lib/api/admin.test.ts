import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUser, deleteUser, listUsers, updateRole } from "./admin";

vi.mock("./client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "./client";
const mocked = vi.mocked(apiFetch);

beforeEach(() => mocked.mockReset());

describe("listUsers", () => {
  it("calls with default pagination", () => {
    mocked.mockResolvedValue([]);
    listUsers();
    expect(mocked).toHaveBeenCalledWith("/admin/users?page=0&size=20");
  });

  it("passes custom page and size", () => {
    mocked.mockResolvedValue([]);
    listUsers(2, 50);
    expect(mocked).toHaveBeenCalledWith("/admin/users?page=2&size=50");
  });
});

describe("createUser", () => {
  it("POSTs username, password, and role", () => {
    mocked.mockResolvedValue({});
    createUser("alice", "secret", "ARTIST");
    expect(mocked).toHaveBeenCalledWith("/admin/users", {
      method: "POST",
      body: JSON.stringify({ username: "alice", password: "secret", role: "ARTIST" }),
    });
  });
});

describe("updateRole", () => {
  it("PATCHes /admin/users/:id/role with the new role", () => {
    mocked.mockResolvedValue({});
    updateRole("user-1", "ADMIN");
    expect(mocked).toHaveBeenCalledWith("/admin/users/user-1/role", {
      method: "PATCH",
      body: JSON.stringify({ role: "ADMIN" }),
    });
  });
});

describe("deleteUser", () => {
  it("DELETEs /admin/users/:id", () => {
    mocked.mockResolvedValue(undefined);
    deleteUser("user-1");
    expect(mocked).toHaveBeenCalledWith("/admin/users/user-1", { method: "DELETE" });
  });
});
