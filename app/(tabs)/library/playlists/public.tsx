import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCopyPlaylist, usePublicPlaylists } from "@/lib/hooks/playlists";

export default function PublicPlaylistsScreen() {
  const { data: playlists = [], isPending } = usePublicPlaylists();
  const copyPlaylist = useCopyPlaylist();

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background dark:bg-background-dark">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Public Playlists",
          headerTitleStyle: { fontSize: 16, fontWeight: "600" },
          headerStyle: { backgroundColor: "#fafafa" },
          headerTintColor: "#000",
          headerShadowVisible: false,
        }}
      />

      {isPending ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-foreground-muted dark:text-foreground-muted-dark">
            Loading...
          </Text>
        </View>
      ) : playlists.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <MaterialIcons name="public" size={48} color="#a1a1aa" style={{ marginBottom: 12 }} />
          <Text className="text-center text-foreground-muted dark:text-foreground-muted-dark">
            No public playlists yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center px-4 py-3.5">
              <MaterialIcons
                name="queue-music"
                size={20}
                color="#6366f1"
                style={{ marginRight: 12 }}
              />
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground dark:text-foreground-dark">
                  {item.name}
                </Text>
                <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark">
                  by {item.ownerName} · {item.trackCount}{" "}
                  {item.trackCount === 1 ? "song" : "songs"}
                </Text>
              </View>
              <Pressable
                onPress={() => copyPlaylist.mutate(item.id)}
                disabled={copyPlaylist.isPending}
                className="px-3 py-1.5 rounded-lg bg-indigo-500 active:opacity-70"
                style={{ opacity: copyPlaylist.isPending ? 0.5 : 1 }}
              >
                <Text className="text-white text-sm font-medium">Copy</Text>
              </Pressable>
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px mx-4 bg-border dark:bg-border-dark" />
          )}
        />
      )}
    </SafeAreaView>
  );
}
