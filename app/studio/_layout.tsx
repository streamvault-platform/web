import { Redirect, Stack } from "expo-router";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function StudioLayout() {
  const { role } = useCurrentUser();
  if (role !== "ADMIN" && role !== "ARTIST") return <Redirect href="/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
