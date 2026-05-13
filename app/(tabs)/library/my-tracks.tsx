import { Stack } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TrackRow } from "@/components/library/TrackRow";
import { useMyLibrary } from "@/lib/hooks/library";
import { usePlaybackStore } from "@/stores/playback";
import type { Track } from "@/lib/api/library";

function libraryTrackToTrack(t: ReturnType<typeof useMyLibrary>["tracks"][number]): Track {
  return {
    id: t.trackId,
    title: t.title,
    filePath: "",
    artistId: t.artistId,
    artistName: t.artist,
    albumId: t.albumId,
    albumTitle: t.album,
    trackNumber: null,
    discNumber: null,
    durationMs: t.durationMs,
    genre: null,
    year: null,
    mimeType: t.mimeType,
  };
}

export default function MyTracksScreen() {
  const { tracks } = useMyLibrary();
  const { playQueue } = usePlaybackStore();

  const fullTracks = tracks.map(libraryTrackToTrack);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["bottom"]}>
      <Stack.Screen options={{ title: "My Songs" }} />

      <FlatList
        data={fullTracks}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => (
          <TrackRow track={item} onPress={() => playQueue(fullTracks, index)} />
        )}
        ItemSeparatorComponent={() => (
          <View className="h-px mx-4 bg-border dark:bg-border-dark" />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-foreground-muted dark:text-foreground-muted-dark">
              No songs in your library yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
