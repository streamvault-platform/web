import { Redirect, Stack } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function AdminLayout() {
  const { role } = useCurrentUser();
  const isDark = useColorScheme() === "dark";
  if (role !== "ADMIN") return <Redirect href="/library" />;
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
