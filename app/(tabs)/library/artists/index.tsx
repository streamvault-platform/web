import { Stack, router } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArtistRow } from "@/components/library/ArtistRow";
import { useArtists } from "@/lib/hooks/library";

export default function ArtistsScreen() {
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useArtists();
  const artists = data?.pages.flat() ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["bottom"]}>
      <Stack.Screen options={{ title: "Artists" }} />

      {isPending ? (
        <ActivityIndicator className="flex-1" />
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground-muted dark:text-foreground-muted-dark">
            Failed to load artists
          </Text>
        </View>
      ) : (
        <FlatList
          data={artists}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <ArtistRow
              artist={item}
              onPress={() =>
                router.push({
                  pathname: "/library/artists/[artistId]",
                  params: { artistId: item.id, artistName: item.name },
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
                No artists yet
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator className="py-4" /> : null
          }
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
        />
      )}
    </SafeAreaView>
  );
}
