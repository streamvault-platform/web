import { useAuthStore } from "@/stores/auth";

export function useCurrentUser() {
  const { username, role, isAuthenticated } = useAuthStore();
  return { username, role, isAuthenticated };
}
