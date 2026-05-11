import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { SeekBar } from "@/components/player/SeekBar";
import { formatDuration } from "@/lib/utils/format";
import { usePlaybackStore } from "@/stores/playback";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function PlayerScreen() {
  const { currentTrack, isPlaying, positionMs, durationMs, pause, resume } =
    usePlaybackStore();
  const { seek } = usePlaybackStore();
  const isDark = useColorScheme() === "dark";

  if (!currentTrack) {
    router.back();
    return null;
  }

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  const content = (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2">
        <Pressable onPress={() => router.back()} className="p-2 active:opacity-60">
          <IconSymbol name="chevron.down" size={26} color="#6366f1" />
        </Pressable>
        <Text className="font-semibold text-foreground dark:text-foreground-dark">
          Now Playing
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Artwork placeholder */}
      <View className="mx-8 mt-4 mb-8 aspect-square rounded-2xl bg-surface dark:bg-surface-dark items-center justify-center">
        <IconSymbol name="music.note" size={96} color="#6366f1" />
      </View>

      {/* Track info */}
      <View className="px-8 mb-8">
        <Text
          className="text-2xl font-bold text-foreground dark:text-foreground-dark"
          numberOfLines={1}
        >
          {currentTrack.title}
        </Text>
        <Text
          className="text-base text-foreground-muted dark:text-foreground-muted-dark mt-1"
          numberOfLines={1}
        >
          {currentTrack.artistName ?? "Unknown Artist"}
        </Text>
        {currentTrack.albumTitle && (
          <Text
            className="text-sm text-foreground-muted dark:text-foreground-muted-dark mt-0.5"
            numberOfLines={1}
          >
            {currentTrack.albumTitle}
          </Text>
        )}
      </View>

      {/* Seek bar + timestamps */}
      <View className="px-8 mb-10">
        <View className="mb-2">
          <SeekBar progress={progress} durationMs={durationMs} onSeek={seek} thick />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark">
            {formatDuration(positionMs)}
          </Text>
          <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark">
            {formatDuration(durationMs || null)}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-center gap-12 px-8">
        <Pressable disabled className="p-3 opacity-25">
          <IconSymbol name="backward.fill" size={30} color="#6366f1" />
        </Pressable>

        <Pressable
          onPress={isPlaying ? pause : resume}
          style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#6366f1" }}
          className="items-center justify-center active:opacity-80"
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
        >
          <IconSymbol
            name={isPlaying ? "pause.fill" : "play.fill"}
            size={32}
            color="#ffffff"
          />
        </Pressable>

        <Pressable disabled className="p-3 opacity-25">
          <IconSymbol name="forward.fill" size={30} color="#6366f1" />
        </Pressable>
      </View>
    </>
  );

  if (Platform.OS === "web") {
    return (
      <View
        style={[StyleSheet.absoluteFillObject, { alignItems: "center", justifyContent: "center", padding: 16 }]}
        // @ts-ignore — web-only style
        className="backdrop-blur-md bg-black/10 dark:bg-black/20"
      >
        <View
          className="bg-background dark:bg-background-dark rounded-2xl overflow-hidden py-2 w-full"
          style={{ maxWidth: 440 }}
        >
          {content}
          <View style={{ height: 24 }} />
        </View>
      </View>
    );
  }

  return (
    <BlurView
      intensity={80}
      tint={isDark ? "dark" : "light"}
      style={StyleSheet.absoluteFillObject}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {content}
      </SafeAreaView>
    </BlurView>
  );
}
