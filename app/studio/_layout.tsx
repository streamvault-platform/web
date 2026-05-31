import { Redirect, Stack } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function StudioLayout() {
  const { role } = useCurrentUser();
  const isDark = useColorScheme() === "dark";
  if (role !== "ADMIN" && role !== "ARTIST") return <Redirect href="/library" />;
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? "#09090b" : "#ffffff" },
        headerTintColor: isDark ? "#ffffff" : "#09090b",
        headerShadowVisible: false,
      }}
    />
  );
}
