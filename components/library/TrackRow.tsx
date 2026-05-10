import { Pressable, Text } from "react-native";

import type { Track } from "@/lib/api/library";
import { formatDuration } from "@/lib/utils/format";

type Props = {
  track: Track;
  onPress: () => void;
};

export function TrackRow({ track, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 active:opacity-60"
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
  );
}
