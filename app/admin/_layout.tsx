import { Redirect, Stack } from "expo-router";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function AdminLayout() {
  const { role } = useCurrentUser();
  if (role !== "ADMIN") return <Redirect href="/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
