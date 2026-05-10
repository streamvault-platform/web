import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let refreshing: Promise<void> | null = null;

async function attemptRefresh(serverUrl: string): Promise<void> {
  const { refreshToken, setTokens, clearTokens } = useAuthStore.getState();
  if (!refreshToken) {
    await clearTokens();
    throw new ApiError(401, "Session expired");
  }
  try {
    const res = await fetch(`${serverUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      await clearTokens();
      throw new ApiError(401, "Session expired");
    }
    const tokens = (await res.json()) as { accessToken: string; refreshToken: string };
    await setTokens(tokens.accessToken, tokens.refreshToken);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    await clearTokens();
    throw new ApiError(0, "Could not refresh session");
  }
}

function doFetch(serverUrl: string, path: string, options?: RequestInit): Promise<Response> {
  const { accessToken } = useAuthStore.getState();
  return fetch(`${serverUrl}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options?.headers as Record<string, string> ?? {}),
    },
  });
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const serverUrl = useSettingsStore.getState().serverUrl;
  if (!serverUrl) throw new ApiError(0, "Server URL not configured. Go to Settings.");

  let response = await doFetch(serverUrl, path, options);

  if (response.status === 401) {
    if (!refreshing) {
      refreshing = attemptRefresh(serverUrl).finally(() => {
        refreshing = null;
      });
    }
    await refreshing; 
    response = await doFetch(serverUrl, path, options);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
