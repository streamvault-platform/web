import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthApiError, checkInvite, fetchSetupStatus, register } from "./auth";

function makeResponse(
  body: unknown,
  ok = true,
  status = 200,
): Response {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown as Response;
}

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => mockFetch.mockReset());

describe("fetchSetupStatus", () => {
  it("returns configured and openRegistrationEnabled", async () => {
    mockFetch.mockResolvedValue(makeResponse({ configured: true, openRegistrationEnabled: false }));
    const result = await fetchSetupStatus("http://localhost:8080");
    expect(result).toEqual({ configured: true, openRegistrationEnabled: false });
  });

  it("throws AuthApiError on non-ok response", async () => {
    mockFetch.mockResolvedValue(makeResponse(null, false, 500));
    await expect(fetchSetupStatus("http://localhost:8080")).rejects.toThrow(AuthApiError);
  });
});

describe("checkInvite", () => {
  it("returns true when invite is valid", async () => {
    mockFetch.mockResolvedValue(makeResponse({ valid: true }));
    const result = await checkInvite("http://localhost:8080", "abc123");
    expect(result).toBe(true);
  });

  it("returns false when invite is invalid", async () => {
    mockFetch.mockResolvedValue(makeResponse({ valid: false }));
    const result = await checkInvite("http://localhost:8080", "abc123");
    expect(result).toBe(false);
  });

  it("URL-encodes the invite token", async () => {
    mockFetch.mockResolvedValue(makeResponse({ valid: true }));
    await checkInvite("http://localhost:8080", "token+with spaces");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/invite?invite=token%2Bwith%20spaces"
    );
  });

  it("throws AuthApiError on non-ok response", async () => {
    mockFetch.mockResolvedValue(makeResponse(null, false, 500));
    await expect(checkInvite("http://localhost:8080", "abc123")).rejects.toThrow(AuthApiError);
  });
});

describe("register", () => {
  it("POSTs username, password, and inviteToken", async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ accessToken: "at", refreshToken: "rt" })
    );
    const result = await register("http://localhost:8080", "alice", "s3cr3t", "abc123");
    expect(result).toEqual({ accessToken: "at", refreshToken: "rt" });
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/register",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "alice", password: "s3cr3t", inviteToken: "abc123" }),
      })
    );
  });

  it("sends inviteToken as null when omitted", async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ accessToken: "at", refreshToken: "rt" })
    );
    await register("http://localhost:8080", "alice", "s3cr3t");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/register",
      expect.objectContaining({
        body: JSON.stringify({ username: "alice", password: "s3cr3t", inviteToken: null }),
      })
    );
  });

  it("throws AuthApiError on non-ok response", async () => {
    mockFetch.mockResolvedValue(makeResponse(null, false, 400));
    await expect(
      register("http://localhost:8080", "alice", "s3cr3t", "abc123")
    ).rejects.toThrow(AuthApiError);
  });

  it("throws AuthApiError with 409 on username conflict", async () => {
    mockFetch.mockResolvedValue(makeResponse(null, false, 409));
    try {
      await register("http://localhost:8080", "alice", "s3cr3t");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AuthApiError);
      expect((e as AuthApiError).status).toBe(409);
    }
  });
});
