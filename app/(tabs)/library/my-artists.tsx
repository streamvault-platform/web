import { Stack, router } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArtistRow } from "@/components/library/ArtistRow";
import { useMyLibrary } from "@/lib/hooks/library";

export default function MyArtistsScreen() {
  const { artists, tracks } = useMyLibrary();
  const isLoading = tracks.length === 0 && artists.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["bottom"]}>
      <Stack.Screen options={{ title: "My Artists" }} />

      {isLoading ? (
        <ActivityIndicator className="flex-1" />
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
                No artists in your library yet
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
