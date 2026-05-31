import { Stack, router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AlbumRow } from "@/components/library/AlbumRow";
import { TrackRow } from "@/components/library/TrackRow";
import { useAlbums, useArtist, useTracksByArtist } from "@/lib/hooks/library";
import { usePlaybackStore } from "@/stores/playback";
import type { Track } from "@/lib/api/library";

export default function ArtistAlbumsScreen() {
  const { artistId, artistName } = useLocalSearchParams<{
    artistId: string;
    artistName: string;
  }>();

  const { data: artist } = useArtist(artistId);
  const { data: albumPages, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useAlbums(artistId);
  const { data: allTracks } = useTracksByArtist(artistId);
  const { play, playQueue } = usePlaybackStore();

  const albums = albumPages?.pages.flat() ?? [];
  const standaloneTracks = allTracks ?? [];

  const onTrackPress = (track: Track) => {
    if (standaloneTracks.length > 1) {
      const idx = standaloneTracks.indexOf(track);
      playQueue(standaloneTracks, idx >= 0 ? idx : 0);
    } else {
      play(track);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["bottom"]}>
      <Stack.Screen options={{ title: artist?.name ?? artistName ?? "Albums" }} />

      {isPending ? (
        <ActivityIndicator className="flex-1" />
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground-muted dark:text-foreground-muted-dark">
            Failed to load albums
          </Text>
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <AlbumRow
              album={item}
              onPress={() =>
                router.push({
                  pathname: "/library/albums/[albumId]",
                  params: { albumId: item.id, albumTitle: item.title },
                })
              }
            />
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px mx-4 bg-border dark:bg-border-dark" />
          )}
          ListEmptyComponent={
            standaloneTracks.length === 0 ? (
              <View className="flex-1 items-center justify-center py-16">
                <Text className="text-foreground-muted dark:text-foreground-muted-dark">
                  No albums
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            <>
              {isFetchingNextPage && <ActivityIndicator className="py-4" />}
              {standaloneTracks.length > 0 && (
                <View>
                  {albums.length > 0 && (
                    <View className="h-px mx-4 bg-border dark:bg-border-dark" />
                  )}
                  <Text className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted dark:text-foreground-muted-dark">
                    Tracks
                  </Text>
                  {standaloneTracks.map((track, index) => (
                    <View key={track.id}>
                      <TrackRow track={track} onPress={() => onTrackPress(track)} />
                      {index < standaloneTracks.length - 1 && (
                        <View className="h-px mx-4 bg-border dark:bg-border-dark" />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          }
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
        />
      )}
    </SafeAreaView>
  );
}
