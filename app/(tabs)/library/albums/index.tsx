import { Stack, router } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AlbumRow } from "@/components/library/AlbumRow";
import { useAlbums } from "@/lib/hooks/library";

export default function AlbumsScreen() {
  const { data: albums, isPending, isError } = useAlbums();

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["bottom"]}>
      <Stack.Screen options={{ title: "Albums" }} />

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
                No albums yet
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
