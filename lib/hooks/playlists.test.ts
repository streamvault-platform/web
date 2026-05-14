// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createQueryWrapper } from "@/test/utils";
import {
  addTrackToPlaylist,
  copyPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  listPlaylists,
  listPublicPlaylists,
  removeTrackFromPlaylist,
  setPlaylistVisibility,
} from "@/lib/api/playlists";
import {
  useAddTrackToPlaylist,
  useCopyPlaylist,
  useCreatePlaylist,
  useDeletePlaylist,
  usePlaylist,
  usePlaylists,
  usePublicPlaylists,
  useRemoveTrackFromPlaylist,
  useSetPlaylistVisibility,
} from "./playlists";

vi.mock("@/lib/api/playlists");

const mockPlaylist = {
  id: "p1",
  ownerId: "u1",
  ownerName: "user1",
  name: "My Mix",
  isPublic: false,
  trackCount: 5,
  createdAt: "2024-01-01T00:00:00Z",
};

const mockPlaylistDetail = {
  id: "p1",
  ownerId: "u1",
  ownerName: "user1",
  name: "My Mix",
  isPublic: false,
  createdAt: "2024-01-01T00:00:00Z",
  tracks: [
    {
      trackId: "t1",
      title: "Song 1",
      artistName: "Artist A",
      albumTitle: "Album X",
      durationMs: 180000,
      mimeType: "audio/mpeg",
      position: 0,
    },
  ],
};

beforeEach(() => vi.resetAllMocks());

describe("usePlaylists", () => {
  it("returns playlist list from the API", async () => {
    vi.mocked(listPlaylists).mockResolvedValue([mockPlaylist]);
    const { result } = renderHook(() => usePlaylists(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockPlaylist]);
  });
});

describe("usePlaylist", () => {
  it("fetches a single playlist by id", async () => {
    vi.mocked(getPlaylist).mockResolvedValue(mockPlaylistDetail);
    const { result } = renderHook(() => usePlaylist("p1"), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPlaylistDetail);
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => usePlaylist(""), {
      wrapper: createQueryWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
    expect(getPlaylist).not.toHaveBeenCalled();
  });
});

describe("useCreatePlaylist", () => {
  it("calls createPlaylist with the name", async () => {
    vi.mocked(createPlaylist).mockResolvedValue(mockPlaylist);
    vi.mocked(listPlaylists).mockResolvedValue([]);
    const { result } = renderHook(() => useCreatePlaylist(), {
      wrapper: createQueryWrapper(),
    });
    await act(async () => {
      result.current.mutate("My Mix");
    });
    expect(createPlaylist).toHaveBeenCalledWith("My Mix");
  });
});

describe("useDeletePlaylist", () => {
  it("calls deletePlaylist with the id", async () => {
    vi.mocked(deletePlaylist).mockResolvedValue(undefined);
    vi.mocked(listPlaylists).mockResolvedValue([]);
    const { result } = renderHook(() => useDeletePlaylist(), {
      wrapper: createQueryWrapper(),
    });
    await act(async () => {
      result.current.mutate("p1");
    });
    expect(deletePlaylist).toHaveBeenCalledWith("p1");
  });
});

describe("useAddTrackToPlaylist", () => {
  it("calls addTrackToPlaylist with correct args", async () => {
    vi.mocked(addTrackToPlaylist).mockResolvedValue({
      trackId: "t1",
      title: "Song 1",
      artistName: "Artist A",
      albumTitle: "Album X",
      durationMs: 180000,
      mimeType: "audio/mpeg",
      position: 0,
    });
    vi.mocked(getPlaylist).mockResolvedValue(mockPlaylistDetail);
    const { result } = renderHook(() => useAddTrackToPlaylist(), {
      wrapper: createQueryWrapper(),
    });
    await act(async () => {
      result.current.mutate({ playlistId: "p1", trackId: "t1" });
    });
    expect(addTrackToPlaylist).toHaveBeenCalledWith("p1", "t1");
  });
});

describe("useRemoveTrackFromPlaylist", () => {
  it("calls removeTrackFromPlaylist with correct args", async () => {
    vi.mocked(removeTrackFromPlaylist).mockResolvedValue(undefined);
    vi.mocked(getPlaylist).mockResolvedValue(mockPlaylistDetail);
    const { result } = renderHook(() => useRemoveTrackFromPlaylist(), {
      wrapper: createQueryWrapper(),
    });
    await act(async () => {
      result.current.mutate({ playlistId: "p1", trackId: "t1" });
    });
    expect(removeTrackFromPlaylist).toHaveBeenCalledWith("p1", "t1");
  });
});

describe("usePublicPlaylists", () => {
  it("returns public playlist list from the API", async () => {
    vi.mocked(listPublicPlaylists).mockResolvedValue([mockPlaylist]);
    const { result } = renderHook(() => usePublicPlaylists(), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockPlaylist]);
  });
});

describe("useSetPlaylistVisibility", () => {
  it("calls setPlaylistVisibility with correct args", async () => {
    vi.mocked(setPlaylistVisibility).mockResolvedValue(undefined);
    vi.mocked(listPlaylists).mockResolvedValue([]);
    const { result } = renderHook(() => useSetPlaylistVisibility(), {
      wrapper: createQueryWrapper(),
    });
    await act(async () => {
      result.current.mutate({ id: "p1", isPublic: true });
    });
    expect(setPlaylistVisibility).toHaveBeenCalledWith("p1", true);
  });
});

describe("useCopyPlaylist", () => {
  it("calls copyPlaylist with the id", async () => {
    vi.mocked(copyPlaylist).mockResolvedValue(mockPlaylist);
    vi.mocked(listPlaylists).mockResolvedValue([]);
    const { result } = renderHook(() => useCopyPlaylist(), {
      wrapper: createQueryWrapper(),
    });
    await act(async () => {
      result.current.mutate("p1");
    });
    expect(copyPlaylist).toHaveBeenCalledWith("p1");
  });
});
