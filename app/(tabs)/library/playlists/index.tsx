import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePlaylists, useCreatePlaylist } from "@/lib/hooks/playlists";

function PlaylistRow({
  id,
  name,
  trackCount,
}: {
  id: string;
  name: string;
  trackCount: number;
}) {
  return (
    <Pressable
      onPress={() => router.push(`/library/playlists/${id}`)}
      className="flex-row items-center px-4 py-3.5 active:opacity-60"
    >
      <MaterialIcons name="queue-music" size={20} color="#6366f1" style={{ marginRight: 12 }} />
      <View className="flex-1">
        <Text className="text-base font-medium text-foreground dark:text-foreground-dark">
          {name}
        </Text>
        <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark">
          {trackCount} {trackCount === 1 ? "song" : "songs"}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#71717a" />
    </Pressable>
  );
}

export default function PlaylistsScreen() {
  const { data: playlists = [], isPending } = usePlaylists();
  const createPlaylist = useCreatePlaylist();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  function handleCreate() {
    if (newName.trim()) {
      createPlaylist.mutate(newName.trim(), {
        onSuccess: () => {
          setNewName("");
          setIsCreating(false);
        },
      });
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background dark:bg-background-dark">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Playlists",
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: "600",
          },
          headerStyle: {
            backgroundColor: "#fafafa",
          },
          headerTintColor: "#000",
          headerShadowVisible: false,
        }}
      />

      <View className="flex-1">
        {isCreating && (
          <View className="bg-surface dark:bg-surface-dark px-4 py-4 border-b border-border dark:border-border-dark">
            <Text className="text-sm font-semibold uppercase tracking-widest text-foreground-muted dark:text-foreground-muted-dark mb-2">
              New Playlist
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                placeholder="Playlist name"
                placeholderTextColor="#a1a1aa"
                value={newName}
                onChangeText={setNewName}
                onSubmitEditing={handleCreate}
                autoFocus
                className="flex-1 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg text-foreground dark:text-foreground-dark"
                style={{ paddingHorizontal: 12, paddingVertical: 8 }}
              />
              <Pressable
                onPress={handleCreate}
                disabled={!newName.trim() || createPlaylist.isPending}
                className="px-4 py-2 rounded-lg bg-indigo-500 active:opacity-70"
                style={{ opacity: !newName.trim() || createPlaylist.isPending ? 0.5 : 1 }}
              >
                <Text className="text-white font-medium">Create</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View className="px-4 py-3 gap-2">
          <Pressable
            onPress={() => setIsCreating(!isCreating)}
            className="flex-row items-center px-3 py-2.5 rounded-lg bg-indigo-500 active:opacity-70"
          >
            <MaterialIcons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text className="text-base font-medium text-white">New Playlist</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/library/playlists/public")}
            className="flex-row items-center px-3 py-2.5 rounded-lg border border-border dark:border-border-dark active:opacity-70"
          >
            <MaterialIcons name="public" size={20} color="#6366f1" style={{ marginRight: 8 }} />
            <Text className="text-base font-medium text-foreground dark:text-foreground-dark">Browse Public Playlists</Text>
          </Pressable>
        </View>

        {isPending ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-foreground-muted dark:text-foreground-muted-dark">
              Loading...
            </Text>
          </View>
        ) : playlists.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <MaterialIcons
              name="queue-music"
              size={48}
              color="#a1a1aa"
              style={{ marginBottom: 12 }}
            />
            <Text className="text-center text-foreground-muted dark:text-foreground-muted-dark">
              No playlists yet
            </Text>
            <Text className="text-center text-sm text-foreground-muted dark:text-foreground-muted-dark mt-2">
              Create one to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlaylistRow
                id={item.id}
                name={item.name}
                trackCount={item.trackCount}
              />
            )}
            ItemSeparatorComponent={() => (
              <View className="h-px mx-4 bg-border dark:bg-border-dark" />
            )}
            scrollEnabled={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
