import { ApiError } from "./client";

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type SetupStatus = {
  configured: boolean;
  openRegistrationEnabled: boolean;
};

// Separate error class so callers can distinguish auth errors from other ApiErrors
export class AuthApiError extends ApiError {}

async function authPost<T>(serverUrl: string, path: string, body: unknown): Promise<T> {
  const response = await fetch(`${serverUrl}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new AuthApiError(response.status, text);
  }
  return response.json();
}

export async function fetchSetupStatus(serverUrl: string): Promise<SetupStatus> {
  const response = await fetch(`${serverUrl}/api/setup/status`);
  if (!response.ok) throw new AuthApiError(response.status, "Failed to reach server");
  return response.json();
}

export async function createAdmin(
  serverUrl: string,
  username: string,
  password: string,
): Promise<TokenResponse> {
  return authPost(serverUrl, "/auth/register", { username, password });
}

export async function register(
  serverUrl: string,
  username: string,
  password: string,
  inviteToken?: string,
): Promise<TokenResponse> {
  return authPost(serverUrl, "/auth/register", { username, password, inviteToken: inviteToken ?? null });
}

export async function checkInvite(serverUrl: string, inviteToken: string): Promise<boolean> {
  const response = await fetch(`${serverUrl}/api/auth/invite?invite=${encodeURIComponent(inviteToken)}`);
  if (!response.ok) throw new AuthApiError(response.status, "Failed to check invite");
  const data = await response.json() as { valid: boolean };
  return data.valid;
}

export async function login(
  serverUrl: string,
  username: string,
  password: string,
): Promise<TokenResponse> {
  return authPost(serverUrl, "/auth/login", { username, password });
}
