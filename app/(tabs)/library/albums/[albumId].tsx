import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CoverImage } from "@/components/library/CoverImage";
import { TrackRow } from "@/components/library/TrackRow";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAlbum, useAlbumTracks } from "@/lib/hooks/library";
import { useAlbumSyncStatus, useSyncToWatch } from "@/lib/hooks/watchSync";
import { usePlaybackStore } from "@/stores/playback";

export default function AlbumTracksScreen() {
  const { albumId, albumTitle } = useLocalSearchParams<{
    albumId: string;
    albumTitle: string;
  }>();

  const { data: album } = useAlbum(albumId);
  const { data: tracks = [], isPending, isError } = useAlbumTracks(albumId);
  const { playQueue } = usePlaybackStore();
  const syncToWatch = useSyncToWatch();
  const trackIds = tracks.map((t) => t.id);
  const { isSynced, isSyncing } = useAlbumSyncStatus(trackIds);

  const title = album?.title ?? albumTitle ?? "Tracks";
  const watchSyncLabel = isSyncing ? "Syncing…" : isSynced ? "Synced to Watch" : "Sync to Watch";

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
              <View className="px-4 py-4 flex-row items-center gap-4 border-b border-border dark:border-border-dark">
                <CoverImage coverUrl={album.coverUrl} size={72} />
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold text-foreground dark:text-foreground-dark"
                    numberOfLines={1}
                  >
                    {album.title}
                  </Text>
                  <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark mt-0.5">
                    {[album.artistName, album.year].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                {Platform.OS === "ios" && trackIds.length > 0 && (
                  <Pressable
                    onPress={() => { if (!isSyncing) syncToWatch.mutate(trackIds); }}
                    disabled={isSyncing}
                    className="items-center px-2 py-1 active:opacity-60"
                    style={{ opacity: isSyncing ? 0.5 : 1 }}
                  >
                    {isSyncing ? (
                      <ActivityIndicator size="small" color="#71717a" />
                    ) : (
                      <IconSymbol
                        name="applewatch"
                        size={20}
                        color={isSynced ? "#6366f1" : "#71717a"}
                      />
                    )}
                    <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark mt-1">
                      {watchSyncLabel}
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <TrackRow track={item} onPress={() => playQueue(tracks ?? [], index)} />
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
