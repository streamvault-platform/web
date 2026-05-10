// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createQueryWrapper } from "@/test/utils";
import {
  getAlbum,
  getArtist,
  listAlbums,
  listArtists,
  listTracks,
  searchAlbums,
  searchArtists,
  searchTracks,
} from "@/lib/api/library";
import {
  useAlbum,
  useAlbums,
  useArtist,
  useArtists,
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
