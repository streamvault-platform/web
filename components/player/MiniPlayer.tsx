import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePlaybackStore } from "@/stores/playback";

const TAB_BAR_HEIGHT = 49;

export function MiniPlayer() {
  const { bottom } = useSafeAreaInsets();
  const { currentTrack, isPlaying, positionMs, durationMs, pause, resume, seek } =
    usePlaybackStore();
  const [barWidth, setBarWidth] = useState(0);

  if (!currentTrack) return null;

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  return (
    <View
      style={{ position: "absolute", bottom: TAB_BAR_HEIGHT + bottom, left: 0, right: 0 }}
      className="bg-surface dark:bg-surface-dark border-t border-border dark:border-border-dark"
    >
      {/* Seek bar */}
      <Pressable
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        onPress={(e) => {
          if (!barWidth || !durationMs) return;
          seek(Math.round((e.nativeEvent.locationX / barWidth) * durationMs));
        }}
        className="h-1 bg-border dark:bg-border-dark"
      >
        <View
          className="h-full bg-indigo-500"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </Pressable>

      {/* Track info + controls */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <View className="flex-1">
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
        </View>

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
      </View>
    </View>
  );
}
