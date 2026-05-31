import { useState } from "react";
import { Alert, FlatList, Platform, Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { CoverArtUploader } from "@/components/studio/CoverArtUploader";
import { MetadataForm } from "@/components/studio/MetadataForm";
import { useAlbums } from "@/lib/hooks/library";
import { useDeleteAlbum, useUpdateAlbumMetadata } from "@/lib/hooks/studio";
import type { Album } from "@/lib/api/library";

export default function StudioAlbumsScreen() {
  const { data: albumPages } = useAlbums();
  const albums = albumPages?.pages.flat() ?? [];
  const { mutate: updateMetadata } = useUpdateAlbumMetadata();
  const { mutate: deleteAlbum } = useDeleteAlbum();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{ title?: string; year?: string }>({});

  function startEdit(album: Album) {
    setEditing(album.id);
    setForm({ title: album.title, year: album.year?.toString() ?? "" });
  }

  function saveEdit(albumId: string) {
    updateMetadata(
      {
        albumId,
        data: {
          title: form.title || undefined,
          year: form.year ? Number(form.year) : undefined,
        },
      },
      { onSuccess: () => setEditing(null) }
    );
  }

  function handleDelete(album: Album) {
    const confirm = Platform.OS === "web"
      ? window.confirm(`Delete album "${album.title}"? Tracks will keep their files but lose the album association.`)
      : false;

    if (Platform.OS !== "web") {
      Alert.alert(
        "Delete album",
        `Delete "${album.title}"? Tracks will keep their files but lose the album association.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => deleteAlbum(album.id) },
        ]
      );
      return;
    }
    if (confirm) deleteAlbum(album.id);
  }

  return (
    <View style={{ flex: 1 }} className="bg-background dark:bg-background-dark">
      <Stack.Screen options={{ title: "Manage Albums" }} />
      <FlatList
        data={albums}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 12 }}
        renderItem={({ item }) => (
          <View className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4">
            <View className="flex-row gap-4 mb-4">
              <CoverArtUploader albumId={item.id} currentCoverUrl={item.coverUrl} />
              <View className="flex-1">
                <Text className="font-semibold text-foreground dark:text-foreground-dark" numberOfLines={1}>
                  {item.title}
                </Text>
                {item.artistName && (
                  <Text className="text-foreground-muted dark:text-foreground-muted-dark text-sm">
                    {item.artistName}
                  </Text>
                )}
                {item.year && (
                  <Text className="text-foreground-muted dark:text-foreground-muted-dark text-xs">
                    {item.year}
                  </Text>
                )}
              </View>
            </View>

            {editing === item.id ? (
              <View className="gap-3">
                <MetadataForm
                  values={form}
                  onChange={setForm}
                  showTrackFields={false}
                />
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => setEditing(null)}
                    className="flex-1 py-2.5 rounded-lg items-center border border-border dark:border-border-dark active:opacity-70"
                  >
                    <Text className="text-foreground-muted dark:text-foreground-muted-dark text-sm font-medium">
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => saveEdit(item.id)}
                    className="flex-1 py-2.5 rounded-lg items-center bg-indigo-600 active:opacity-80"
                  >
                    <Text className="text-white text-sm font-medium">Save</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => startEdit(item)}
                  className="flex-1 py-2.5 rounded-lg items-center border border-border dark:border-border-dark active:opacity-70"
                >
                  <Text className="text-foreground-muted dark:text-foreground-muted-dark text-sm font-medium">
                    Edit
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item)}
                  className="flex-1 py-2.5 rounded-lg items-center border border-destructive dark:border-destructive-dark active:opacity-70"
                >
                  <Text className="text-destructive dark:text-destructive-dark text-sm font-medium">
                    Delete
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}
