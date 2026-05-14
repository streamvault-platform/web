import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addTrackToPlaylist,
  copyPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  listPlaylists,
  listPublicPlaylists,
  removeTrackFromPlaylist,
  renamePlaylist,
  setPlaylistVisibility,
} from "./playlists";

vi.mock("./client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "./client";
const mocked = vi.mocked(apiFetch);

beforeEach(() => mocked.mockReset());

describe("listPlaylists", () => {
  it("calls GET /playlists", () => {
    mocked.mockResolvedValue([]);
    listPlaylists();
    expect(mocked).toHaveBeenCalledWith("/playlists");
  });
});

describe("getPlaylist", () => {
  it("calls GET /playlists/:id", () => {
    mocked.mockResolvedValue({});
    getPlaylist("p1");
    expect(mocked).toHaveBeenCalledWith("/playlists/p1");
  });
});

describe("createPlaylist", () => {
  it("calls POST /playlists with name body", () => {
    mocked.mockResolvedValue({});
    createPlaylist("My Mix");
    expect(mocked).toHaveBeenCalledWith("/playlists", {
      method: "POST",
      body: JSON.stringify({ name: "My Mix" }),
    });
  });
});

describe("renamePlaylist", () => {
  it("calls PATCH /playlists/:id with name body", () => {
    mocked.mockResolvedValue({});
    renamePlaylist("p1", "New Name");
    expect(mocked).toHaveBeenCalledWith("/playlists/p1", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name" }),
    });
  });
});

describe("deletePlaylist", () => {
  it("calls DELETE /playlists/:id", () => {
    mocked.mockResolvedValue(undefined);
    deletePlaylist("p1");
    expect(mocked).toHaveBeenCalledWith("/playlists/p1", { method: "DELETE" });
  });
});

describe("addTrackToPlaylist", () => {
  it("calls POST /playlists/:playlistId/tracks with trackId body", () => {
    mocked.mockResolvedValue({});
    addTrackToPlaylist("p1", "t1");
    expect(mocked).toHaveBeenCalledWith("/playlists/p1/tracks", {
      method: "POST",
      body: JSON.stringify({ trackId: "t1" }),
    });
  });
});

describe("removeTrackFromPlaylist", () => {
  it("calls DELETE /playlists/:playlistId/tracks/:trackId", () => {
    mocked.mockResolvedValue(undefined);
    removeTrackFromPlaylist("p1", "t1");
    expect(mocked).toHaveBeenCalledWith("/playlists/p1/tracks/t1", {
      method: "DELETE",
    });
  });
});

describe("listPublicPlaylists", () => {
  it("calls GET /playlists/public", () => {
    mocked.mockResolvedValue([]);
    listPublicPlaylists();
    expect(mocked).toHaveBeenCalledWith("/playlists/public");
  });
});

describe("setPlaylistVisibility", () => {
  it("calls PATCH /playlists/:id/visibility with isPublic body", () => {
    mocked.mockResolvedValue(undefined);
    setPlaylistVisibility("p1", true);
    expect(mocked).toHaveBeenCalledWith("/playlists/p1/visibility", {
      method: "PATCH",
      body: JSON.stringify({ isPublic: true }),
    });
  });
});

describe("copyPlaylist", () => {
  it("calls POST /playlists/:id/copy", () => {
    mocked.mockResolvedValue({});
    copyPlaylist("p1");
    expect(mocked).toHaveBeenCalledWith("/playlists/p1/copy", {
      method: "POST",
    });
  });
});
