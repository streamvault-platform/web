// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createQueryWrapper } from "@/test/utils";
import {
  addToLibrary,
  getAlbum,
  getArtist,
  getMyLibrary,
  listAlbums,
  listArtists,
  listTracks,
  removeFromLibrary,
  searchAlbums,
  searchArtists,
  searchTracks,
} from "@/lib/api/library";
import {
  useAddToLibrary,
  useAlbum,
  useAlbums,
  useArtist,
  useArtists,
  useMyLibrary,
  useRemoveFromLibrary,
  useSearch,
  useTracks,
} from "./library";

vi.mock("@/lib/api/library");

const mockArtist = { id: "a1", name: "The Beatles" };
const mockAlbum = { id: "alb1", title: "Abbey Road", artistId: "a1", artistName: "The Beatles", year: 1969 };
const mockTrack = {
  id: "t1", title: "Hey Jude", filePath: "/f.mp3",
  artistId: "a1", artistName: "The Beatles",
  albumId: "alb1", albumTitle: "Abbey Road",
  trackNumber: 1, discNumber: null, durationMs: 431000,
  genre: "Rock", year: 1969, mimeType: "audio/mpeg",
};

beforeEach(() => vi.resetAllMocks());

describe("useArtists", () => {
  it("returns artist list from the API", async () => {
    vi.mocked(listArtists).mockResolvedValue([mockArtist]);
    const { result } = renderHook(() => useArtists(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockArtist]);
  });
});

describe("useArtist", () => {
  it("fetches a single artist by id", async () => {
    vi.mocked(getArtist).mockResolvedValue(mockArtist);
    const { result } = renderHook(() => useArtist("a1"), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockArtist);
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useArtist(""), { wrapper: createQueryWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
    expect(getArtist).not.toHaveBeenCalled();
  });
});

describe("useAlbums", () => {
  it("calls listAlbums without artistId by default", async () => {
    vi.mocked(listAlbums).mockResolvedValue([mockAlbum]);
    const { result } = renderHook(() => useAlbums(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listAlbums).toHaveBeenCalledWith(undefined);
  });

  it("passes artistId to listAlbums", async () => {
    vi.mocked(listAlbums).mockResolvedValue([mockAlbum]);
    renderHook(() => useAlbums("a1"), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(vi.mocked(listAlbums)).toHaveBeenCalled());
    expect(listAlbums).toHaveBeenCalledWith("a1");
  });
});

describe("useAlbum", () => {
  it("fetches a single album by id", async () => {
    vi.mocked(getAlbum).mockResolvedValue(mockAlbum);
    const { result } = renderHook(() => useAlbum("alb1"), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAlbum);
  });
});

describe("useTracks", () => {
  it("passes albumId to listTracks", async () => {
    vi.mocked(listTracks).mockResolvedValue([mockTrack]);
    renderHook(() => useTracks("alb1"), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(vi.mocked(listTracks)).toHaveBeenCalled());
    expect(listTracks).toHaveBeenCalledWith("alb1");
  });
});

describe("useSearch", () => {
  it("does not fetch when query is empty", () => {
    const { result } = renderHook(() => useSearch(""), { wrapper: createQueryWrapper() });
    expect(result.current.isPending).toBe(false);
    expect(searchArtists).not.toHaveBeenCalled();
  });

  it("fires all three searches and returns combined results", async () => {
    vi.mocked(searchArtists).mockResolvedValue([mockArtist]);
    vi.mocked(searchAlbums).mockResolvedValue([mockAlbum]);
    vi.mocked(searchTracks).mockResolvedValue([mockTrack]);

    const { result } = renderHook(() => useSearch("beatles"), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.artists).toEqual([mockArtist]);
    expect(result.current.albums).toEqual([mockAlbum]);
    expect(result.current.tracks).toEqual([mockTrack]);
  });

  it("returns empty arrays while loading", () => {
    vi.mocked(searchArtists).mockResolvedValue([]);
    vi.mocked(searchAlbums).mockResolvedValue([]);
    vi.mocked(searchTracks).mockResolvedValue([]);

    const { result } = renderHook(() => useSearch("q"), { wrapper: createQueryWrapper() });
    expect(result.current.artists).toEqual([]);
    expect(result.current.albums).toEqual([]);
    expect(result.current.tracks).toEqual([]);
  });
});

const mockLibraryTrack = {
  trackId: "t1",
  artistId: "a1",
  albumId: "alb1",
  title: "Hey Jude",
  artist: "The Beatles",
  album: "Abbey Road",
  durationMs: 431_000,
  mimeType: "audio/mpeg",
  addedAt: "2024-01-01T00:00:00Z",
};

describe("useMyLibrary", () => {
  it("returns tracks, derived artists and albums", async () => {
    vi.mocked(getMyLibrary).mockResolvedValue([mockLibraryTrack]);
    const { result } = renderHook(() => useMyLibrary(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.tracks.length).toBe(1));

    expect(result.current.tracks[0]).toEqual(mockLibraryTrack);
    expect(result.current.artists).toEqual([{ id: "a1", name: "The Beatles" }]);
    expect(result.current.albums).toEqual([
      { id: "alb1", title: "Abbey Road", artistId: "a1", artistName: "The Beatles", year: null },
    ]);
  });

  it("isInLibrary returns true for a track in the library", async () => {
    vi.mocked(getMyLibrary).mockResolvedValue([mockLibraryTrack]);
    const { result } = renderHook(() => useMyLibrary(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.tracks.length).toBe(1));
    expect(result.current.isInLibrary("t1")).toBe(true);
  });

  it("isInLibrary returns false for a track not in the library", async () => {
    vi.mocked(getMyLibrary).mockResolvedValue([mockLibraryTrack]);
    const { result } = renderHook(() => useMyLibrary(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.tracks.length).toBe(1));
    expect(result.current.isInLibrary("other-track")).toBe(false);
  });

  it("deduplicates artists and albums when a library has multiple tracks on the same album", async () => {
    const track2 = { ...mockLibraryTrack, trackId: "t2", title: "Come Together" };
    vi.mocked(getMyLibrary).mockResolvedValue([mockLibraryTrack, track2]);
    const { result } = renderHook(() => useMyLibrary(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.tracks.length).toBe(2));
    expect(result.current.artists).toHaveLength(1);
    expect(result.current.albums).toHaveLength(1);
  });
});

describe("useAddToLibrary", () => {
  it("calls addToLibrary with the trackId", async () => {
    vi.mocked(addToLibrary).mockResolvedValue(mockLibraryTrack);
    vi.mocked(getMyLibrary).mockResolvedValue([]);
    const { result } = renderHook(() => useAddToLibrary(), { wrapper: createQueryWrapper() });
    await act(async () => { result.current.mutate("t1"); });
    expect(addToLibrary).toHaveBeenCalledWith("t1", expect.anything());
  });
});

describe("useRemoveFromLibrary", () => {
  it("calls removeFromLibrary with the trackId", async () => {
    vi.mocked(removeFromLibrary).mockResolvedValue(undefined);
    vi.mocked(getMyLibrary).mockResolvedValue([]);
    const { result } = renderHook(() => useRemoveFromLibrary(), { wrapper: createQueryWrapper() });
    await act(async () => { result.current.mutate("t1"); });
    expect(removeFromLibrary).toHaveBeenCalledWith("t1", expect.anything());
  });
});
