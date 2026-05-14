import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";

import type { Track } from "@/lib/api/library";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { TrackContextMenu } from "@/components/library/TrackContextMenu";
import { useDownloadsStore } from "@/stores/downloads";
import { useIsOnline } from "@/hooks/use-online";
import { formatDuration } from "@/lib/utils/format";

type Props = {
  track: Track;
  onPress: () => void;
};

export function TrackRow({ track, onPress }: Props) {
  const { downloaded, pending } = useDownloadsStore();
  const isOnline = useIsOnline();
  const isDownloaded = Platform.OS !== "web" && !!downloaded[track.id];
  const isPending = Platform.OS !== "web" && !!pending[track.id];
  const isPlayable = isOnline || isDownloaded;

  return (
    <View className={`flex-row items-center px-4 ${!isPlayable ? "opacity-40" : ""}`}>
      <Pressable
        className="flex-1 flex-row items-center py-3 active:opacity-60"
        onPress={isPlayable ? onPress : undefined}
      >
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

      {isPending ? (
        <ActivityIndicator size="small" color="#6366f1" style={{ marginLeft: 8 }} />
      ) : isDownloaded ? (
        <IconSymbol
          name="checkmark.circle.fill"
          size={18}
          color="#6366f1"
          style={{ marginLeft: 8 }}
        />
      ) : null}

      <TrackContextMenu track={track} />
    </View>
  );
}
