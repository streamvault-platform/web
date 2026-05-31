import { Tabs, router } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function TabsLayout() {
  const isDark = useColorScheme() === "dark";
  const { role } = useCurrentUser();
  const isArtistOrAdmin = role === "ARTIST" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: isDark ? "#a1a1aa" : "#71717a",
        tabBarStyle: {
          backgroundColor: isDark ? "#09090b" : "#ffffff",
          borderTopColor: isDark ? "#3f3f46" : "#e4e4e7",
        },
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="music.note" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="magnifyingglass" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="__studio_link"
        options={{
          title: "Studio",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="waveform" size={24} color={color} />
          ),
          tabBarButton: isArtistOrAdmin
            ? (props) => <HapticTab {...props} onPress={() => router.push("/studio")} />
            : () => null,
        }}
      />
      <Tabs.Screen
        name="__admin_link"
        options={{
          title: "Admin",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.2" size={24} color={color} />
          ),
          tabBarButton: isAdmin
            ? (props) => <HapticTab {...props} onPress={() => router.push("/admin")} />
            : () => null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="gearshape" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
