import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";

import type { Track } from "@/lib/api/library";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useDownloadsStore } from "@/stores/downloads";
import { formatDuration } from "@/lib/utils/format";

type Props = {
  track: Track;
  onPress: () => void;
};

export function TrackRow({ track, onPress }: Props) {
  const { downloaded, pending, download, remove } = useDownloadsStore();
  const isDownloaded = !!downloaded[track.id];
  const isPending = !!pending[track.id];

  function handleDownload() {
    if (isPending) return;
    if (isDownloaded) {
      remove(track.id);
    } else {
      download(track);
    }
  }

  return (
    <View className="flex-row items-center px-4 py-3">
      <Pressable className="flex-1 flex-row items-center active:opacity-60" onPress={onPress}>
        {track.trackNumber != null && (
          <Text className="w-7 mr-3 text-sm text-right text-foreground-muted dark:text-foreground-muted-dark">
            {track.trackNumber}
          </Text>
        )}
        <Text
          className="flex-1 text-base text-foreground dark:text-foreground-dark"
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text className="ml-3 text-sm text-foreground-muted dark:text-foreground-muted-dark">
          {formatDuration(track.durationMs)}
        </Text>
      </Pressable>

      {Platform.OS !== "web" && (
        <Pressable onPress={handleDownload} className="pl-3 p-1 active:opacity-60">
          {isPending ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : isDownloaded ? (
            <IconSymbol name="checkmark.circle.fill" size={20} color="#6366f1" />
          ) : (
            <IconSymbol name="arrow.down.circle" size={20} color="#71717a" />
          )}
        </Pressable>
      )}
    </View>
  );
}
