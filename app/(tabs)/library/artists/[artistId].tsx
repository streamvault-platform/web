import { Stack, router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AlbumRow } from "@/components/library/AlbumRow";
import { useAlbums, useArtist } from "@/lib/hooks/library";

export default function ArtistAlbumsScreen() {
  const { artistId, artistName } = useLocalSearchParams<{
    artistId: string;
    artistName: string;
  }>();

  const { data: artist } = useArtist(artistId);
  const { data: albums, isPending, isError } = useAlbums(artistId);

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
            <View className="flex-1 items-center justify-center py-16">
              <Text className="text-foreground-muted dark:text-foreground-muted-dark">
                No albums
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
