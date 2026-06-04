// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createQueryWrapper } from "@/test/utils";
import { useCreateInvite, useDeleteInvite, useInvites } from "./invites";

vi.mock("@/lib/api/invites");

import { createInvite, deleteInvite, listInvites } from "@/lib/api/invites";

const mockInvite = {
  id: "inv-1",
  token: "a".repeat(64),
  createdAt: "2026-01-01T00:00:00Z",
  expiresAt: "2026-01-08T00:00:00Z",
};

beforeEach(() => vi.resetAllMocks());

describe("useInvites", () => {
  it("returns invite list from the API", async () => {
    vi.mocked(listInvites).mockResolvedValue([mockInvite]);
    const { result } = renderHook(() => useInvites(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockInvite]);
  });

  it("returns empty array when no invites exist", async () => {
    vi.mocked(listInvites).mockResolvedValue([]);
    const { result } = renderHook(() => useInvites(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useCreateInvite", () => {
  it("calls createInvite with expiresInDays", async () => {
    vi.mocked(createInvite).mockResolvedValue(mockInvite);
    vi.mocked(listInvites).mockResolvedValue([]);
    const { result } = renderHook(() => useCreateInvite(), { wrapper: createQueryWrapper() });
    await act(async () => {
      result.current.mutate(7);
    });
    expect(createInvite).toHaveBeenCalledWith(7);
  });

  it("calls createInvite without arguments when undefined", async () => {
    vi.mocked(createInvite).mockResolvedValue(mockInvite);
    vi.mocked(listInvites).mockResolvedValue([]);
    const { result } = renderHook(() => useCreateInvite(), { wrapper: createQueryWrapper() });
    await act(async () => {
      result.current.mutate(undefined);
    });
    expect(createInvite).toHaveBeenCalledWith(undefined);
  });
});

describe("useDeleteInvite", () => {
  it("calls deleteInvite with invite id", async () => {
    vi.mocked(deleteInvite).mockResolvedValue(undefined);
    vi.mocked(listInvites).mockResolvedValue([]);
    const { result } = renderHook(() => useDeleteInvite(), { wrapper: createQueryWrapper() });
    await act(async () => {
      result.current.mutate("inv-1");
    });
    expect(deleteInvite).toHaveBeenCalledWith("inv-1");
  });
});
