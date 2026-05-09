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

/**
 * Base fetch wrapper. Reads serverUrl and accessToken from stores at call time
 * so it always uses the latest values without needing to be recreated.
 *
 * path should start with "/" (e.g. "/tracks", "/auth/login").
 * All paths are prefixed with /api automatically.
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const serverUrl = useSettingsStore.getState().serverUrl;
  const accessToken = useAuthStore.getState().accessToken;

  if (!serverUrl) {
    throw new ApiError(0, "Server URL not configured. Go to Settings.");
  }

  const response = await fetch(`${serverUrl}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
