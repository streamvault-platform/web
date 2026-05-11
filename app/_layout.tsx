import "../global.css";

import { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/stores/auth";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { PlaybackSync } from "@/components/player/PlaybackSync";
import { setupAudioPlayer } from "@/lib/audio/setup";

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated, loadTokens } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadTokens().finally(() => setReady(true));
    setupAudioPlayer().catch(console.error);
  }, [loadTokens]);

  if (!ready) {
    return (
      <View
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PlaybackSync />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="player"
          options={{ presentation: "transparentModal", headerShown: false }}
        />
      </Stack>
      {!isAuthenticated && <Redirect href="/(auth)/setup" />}
      {isAuthenticated && <MiniPlayer />}
      <StatusBar style={isDark ? "light" : "dark"} />
    </QueryClientProvider>
  );
}
