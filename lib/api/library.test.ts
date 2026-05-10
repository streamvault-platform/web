import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAlbum,
  getArtist,
  getTrack,
  listAlbums,
  listArtists,
  listTracks,
  searchAlbums,
  searchArtists,
  searchTracks,
} from "./library";

vi.mock("./client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "./client";
const mocked = vi.mocked(apiFetch);

beforeEach(() => mocked.mockReset());

describe("listArtists", () => {
  it("calls the right path with default pagination", () => {
    mocked.mockResolvedValue([]);
    listArtists();
    expect(mocked).toHaveBeenCalledWith("/library/artists?page=0&size=200");
  });

  it("passes custom page and size", () => {
    mocked.mockResolvedValue([]);
    listArtists(2, 50);
    expect(mocked).toHaveBeenCalledWith("/library/artists?page=2&size=50");
  });
});

describe("listAlbums", () => {
  it("calls without artistId by default", () => {
    mocked.mockResolvedValue([]);
    listAlbums();
    const url = mocked.mock.calls[0][0] as string;
    expect(url).toContain("/library/albums");
    expect(url).not.toContain("artistId");
  });

  it("appends artistId when provided", () => {
    mocked.mockResolvedValue([]);
    listAlbums("artist-abc");
    const url = mocked.mock.calls[0][0] as string;
    expect(url).toContain("artistId=artist-abc");
  });
});

describe("listTracks", () => {
  it("calls without albumId by default", () => {
    mocked.mockResolvedValue([]);
    listTracks();
    const url = mocked.mock.calls[0][0] as string;
    expect(url).not.toContain("albumId");
  });

  it("appends albumId when provided", () => {
    mocked.mockResolvedValue([]);
    listTracks("album-xyz");
    const url = mocked.mock.calls[0][0] as string;
    expect(url).toContain("albumId=album-xyz");
  });
});

describe("detail endpoints", () => {
  it("getArtist calls /library/artists/:id", () => {
    mocked.mockResolvedValue({});
    getArtist("id-1");
    expect(mocked).toHaveBeenCalledWith("/library/artists/id-1");
  });

  it("getAlbum calls /library/albums/:id", () => {
    mocked.mockResolvedValue({});
    getAlbum("id-2");
    expect(mocked).toHaveBeenCalledWith("/library/albums/id-2");
  });

  it("getTrack calls /library/tracks/:id", () => {
    mocked.mockResolvedValue({});
    getTrack("id-3");
    expect(mocked).toHaveBeenCalledWith("/library/tracks/id-3");
  });
});

describe("search endpoints", () => {
  it("searchArtists encodes the query", () => {
    mocked.mockResolvedValue([]);
    searchArtists("led zeppelin");
    expect(mocked).toHaveBeenCalledWith("/library/artists?q=led%20zeppelin");
  });

  it("searchAlbums encodes the query", () => {
    mocked.mockResolvedValue([]);
    searchAlbums("abbey road");
    expect(mocked).toHaveBeenCalledWith("/library/albums?q=abbey%20road");
  });

  it("searchTracks encodes the query", () => {
    mocked.mockResolvedValue([]);
    searchTracks("hey jude");
    expect(mocked).toHaveBeenCalledWith("/library/tracks?q=hey%20jude");
  });
});
