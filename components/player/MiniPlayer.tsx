import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { SeekBar } from "@/components/player/SeekBar";
import { usePlaybackStore } from "@/stores/playback";
import { useQueueStore } from "@/stores/queue";

const TAB_BAR_HEIGHT = 49;

export function MiniPlayer() {
  const { bottom } = useSafeAreaInsets();
  const pathname = usePathname();
  const { currentTrack, isPlaying, positionMs, durationMs, pause, resume, seek, next, previous } =
    usePlaybackStore();
  const { hasNext, hasPrevious } = useQueueStore();

  if (!currentTrack) return null;
  if (pathname === "/player") return null;

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  return (
    <View
      style={{ position: "absolute", bottom: TAB_BAR_HEIGHT + bottom, left: 0, right: 0 }}
      className="bg-surface dark:bg-surface-dark border-t border-border dark:border-border-dark"
    >
      <SeekBar progress={progress} durationMs={durationMs} onSeek={seek} />

      <View className="flex-row items-center px-4 py-3 gap-3">
        <Pressable
          onPress={previous}
          style={{ opacity: hasPrevious ? 1 : 0.3 }}
          className="p-2 active:opacity-60"
          accessibilityLabel="Previous"
        >
          <IconSymbol name="backward.fill" size={20} color="#6366f1" />
        </Pressable>

        <Pressable className="flex-1 active:opacity-60" onPress={() => router.push("/player")}>
          <Text
            className="font-medium text-foreground dark:text-foreground-dark"
            numberOfLines={1}
          >
            {currentTrack.title}
          </Text>
          <Text
            className="text-sm text-foreground-muted dark:text-foreground-muted-dark"
            numberOfLines={1}
          >
            {currentTrack.artistName}
          </Text>
        </Pressable>

        <Pressable
          onPress={isPlaying ? pause : resume}
          className="p-2 active:opacity-60"
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
        >
          <IconSymbol
            name={isPlaying ? "pause.fill" : "play.fill"}
            size={24}
            color="#6366f1"
          />
        </Pressable>

        <Pressable
          onPress={next}
          style={{ opacity: hasNext ? 1 : 0.3 }}
          className="p-2 active:opacity-60"
          accessibilityLabel="Next"
        >
          <IconSymbol name="forward.fill" size={20} color="#6366f1" />
        </Pressable>
      </View>
    </View>
  );
}
