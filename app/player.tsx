import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { SeekBar } from "@/components/player/SeekBar";
import { VolumeSlider } from "@/components/player/VolumeSlider";
import { formatDuration } from "@/lib/utils/format";
import { usePlaybackStore } from "@/stores/playback";
import { useQueueStore } from "@/stores/queue";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function PlayerScreen() {
  const [showQueue, setShowQueue] = useState(false);

  const { currentTrack, lastTrack, isPlaying, positionMs, durationMs, volume, pause, resume, seek, setVolume, next, previous } =
    usePlaybackStore();
  const { hasNext, hasPrevious, tracks, currentIndex } = useQueueStore();

  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  const displayTrack = currentTrack ?? lastTrack;
  if (!displayTrack) return null;

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  const content = (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2">
        <Pressable onPress={() => router.back()} className="p-2 active:opacity-60">
          <IconSymbol name="chevron.down" size={26} color="#6366f1" />
        </Pressable>
        <Text className="font-semibold text-foreground dark:text-foreground-dark">
          Now Playing
        </Text>
        <Pressable
          onPress={() => setShowQueue((q) => !q)}
          className="p-2 active:opacity-60"
          accessibilityLabel="Toggle queue"
        >
          <IconSymbol
            name="list.bullet"
            size={22}
            color={showQueue ? "#6366f1" : "#71717a"}
          />
        </Pressable>
      </View>

      {/* Artwork or Queue */}
      <View style={{ flex: 1, paddingHorizontal: showQueue ? 0 : 32, paddingVertical: 16 }}>
        {showQueue ? (
          <FlatList
            data={tracks}
            keyExtractor={(t, index) => `${t.id}-${index}`}
            renderItem={({ item, index }) => (
              <View
                className="px-4 py-3 flex-row items-center gap-3"
                style={{
                  backgroundColor:
                    index === currentIndex ? "rgba(99,102,241,0.08)" : undefined,
                }}
              >
                {index === currentIndex ? (
                  <IconSymbol name="music.note" size={14} color="#6366f1" />
                ) : (
                  <Text className="w-3.5 text-xs text-center text-foreground-muted dark:text-foreground-muted-dark">
                    {index + 1}
                  </Text>
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    className="text-sm font-medium"
                    numberOfLines={1}
                    style={{ color: index === currentIndex ? "#6366f1" : undefined }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className="text-xs text-foreground-muted dark:text-foreground-muted-dark"
                    numberOfLines={1}
                  >
                    {item.artistName}
                  </Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => (
              <View className="h-px mx-4 bg-border dark:bg-border-dark" />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-16">
                <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark">
                  Queue is empty
                </Text>
              </View>
            }
          />
        ) : (
          <View
            style={{ flex: 1, borderRadius: 16 }}
            className="bg-surface dark:bg-surface-dark items-center justify-center"
          >
            <IconSymbol name="music.note" size={96} color="#6366f1" />
          </View>
        )}
      </View>

      {/* Track info */}
      <View className="px-8 mb-6">
        <Text
          className="text-2xl font-bold text-foreground dark:text-foreground-dark"
          numberOfLines={1}
        >
          {displayTrack.title}
        </Text>
        <Text
          className="text-base text-foreground-muted dark:text-foreground-muted-dark mt-1"
          numberOfLines={1}
        >
          {displayTrack.artistName ?? "Unknown Artist"}
        </Text>
        {displayTrack.albumTitle && (
          <Text
            className="text-sm text-foreground-muted dark:text-foreground-muted-dark mt-0.5"
            numberOfLines={1}
          >
            {displayTrack.albumTitle}
          </Text>
        )}
      </View>

      {/* Seek bar + timestamps */}
      <View className="px-8 mb-8">
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

      {/* Volume */}
      <View className="mb-6">
        <VolumeSlider volume={volume} onVolumeChange={setVolume} />
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-center gap-12 px-8 mb-4">
        <Pressable
          onPress={previous}
          style={{ opacity: (hasPrevious || positionMs > 3000) ? 1 : 0.25 }}
          className="p-3 active:opacity-60"
          accessibilityLabel="Previous"
        >
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

        <Pressable
          onPress={next}
          style={{ opacity: hasNext ? 1 : 0.25 }}
          className="p-3 active:opacity-60"
          accessibilityLabel="Next"
        >
          <IconSymbol name="forward.fill" size={30} color="#6366f1" />
        </Pressable>
      </View>
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", padding: 16 }}
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
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {content}
      </View>
    </BlurView>
  );
}
