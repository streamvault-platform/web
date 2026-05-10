import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TrackRow } from "@/components/library/TrackRow";
import { useAlbum, useTracks } from "@/lib/hooks/library";
import { usePlaybackStore } from "@/stores/playback";

export default function AlbumTracksScreen() {
  const { albumId, albumTitle } = useLocalSearchParams<{
    albumId: string;
    albumTitle: string;
  }>();

  const { data: album } = useAlbum(albumId);
  const { data: tracks, isPending, isError } = useTracks(albumId);
  const { play } = usePlaybackStore();

  const title = album?.title ?? albumTitle ?? "Tracks";

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["bottom"]}>
      <Stack.Screen options={{ title }} />

      {isPending ? (
        <ActivityIndicator className="flex-1" />
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground-muted dark:text-foreground-muted-dark">
            Failed to load tracks
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(t) => t.id}
          ListHeaderComponent={
            album ? (
              <View className="px-4 py-3 border-b border-border dark:border-border-dark">
                <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark">
                  {[album.artistName, album.year].filter(Boolean).join(" · ")}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TrackRow track={item} onPress={() => play(item)} />
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px mx-4 bg-border dark:bg-border-dark" />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <Text className="text-foreground-muted dark:text-foreground-muted-dark">
                No tracks
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
