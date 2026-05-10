import { Stack } from "expo-router";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function LibraryLayout() {
  const isDark = useColorScheme() === "dark";
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? "#09090b" : "#ffffff" },
        headerTintColor: isDark ? "#fafafa" : "#09090b",
        headerShadowVisible: false,
        headerBackTitle: "",
      }}
    />
  );
}
