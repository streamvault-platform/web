import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { PlaylistTrack } from "@/lib/api/playlists";
import type { Track } from "@/lib/api/library";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { TrackContextMenu } from "@/components/library/TrackContextMenu";
import { formatDuration } from "@/lib/utils/format";
import { usePlaylist, useDeletePlaylist, useRenamePlaylist, useSetPlaylistVisibility } from "@/lib/hooks/playlists";
import { useMyLibrary } from "@/lib/hooks/library";
import { useAuthStore } from "@/stores/auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDownloadsStore } from "@/stores/downloads";
import { usePlaybackStore } from "@/stores/playback";

function playlistTrackToTrack(pt: PlaylistTrack): Track {
  return {
    id: pt.trackId,
    title: pt.title,
    artistId: null,
    artistName: pt.artistName,
    albumId: null,
    albumTitle: pt.albumTitle,
    trackNumber: null,
    discNumber: null,
    durationMs: pt.durationMs,
    genre: null,
    year: null,
    mimeType: pt.mimeType,
    filePath: "",
  };
}

export default function PlaylistDetailScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { data: playlist, isPending } = usePlaylist(playlistId || "");
  const { playQueue } = usePlaybackStore();
  const { username: userId } = useAuthStore();
  const isDark = useColorScheme() === "dark";

  const { downloaded, pending } = useDownloadsStore();
  const { isInLibrary } = useMyLibrary();
  const setVisibility = useSetPlaylistVisibility();
  const deletePlaylist = useDeletePlaylist();
  const renamePlaylist = useRenamePlaylist();

  const [menuVisible, setMenuVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [newName, setNewName] = useState("");

  const isOwner = !!userId && !!playlist && playlist.ownerId === userId;

  function handlePlayAll() {
    if (!playlist?.tracks.length) return;
    const tracks = playlist.tracks.map(playlistTrackToTrack);
    playQueue(tracks, 0);
  }

  function handlePlayTrack(index: number) {
    if (!playlist) return;
    const tracks = playlist.tracks.map(playlistTrackToTrack);
    playQueue(tracks, index);
  }

  function openOwnerMenu() {
    if (!playlist) return;
    const visLabel = playlist.isPublic ? "Make Private" : "Make Public";
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Cancel", "Rename", visLabel, "Delete Playlist"], cancelButtonIndex: 0, destructiveButtonIndex: 3 },
        (i) => {
          if (i === 1) { setNewName(playlist.name); setRenameVisible(true); }
          else if (i === 2) setVisibility.mutate({ id: playlist.id, isPublic: !playlist.isPublic });
          else if (i === 3) deletePlaylist.mutate(playlist.id, { onSuccess: () => router.back() });
        }
      );
    } else {
      setMenuVisible(true);
    }
  }

  function handleRename() {
    if (!playlist || !newName.trim()) return;
    renamePlaylist.mutate({ id: playlist.id, name: newName.trim() }, {
      onSuccess: () => setRenameVisible(false),
    });
  }

  const headerBg = isDark ? "#09090b" : "#ffffff";
  const headerTint = isDark ? "#fafafa" : "#09090b";

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background dark:bg-background-dark">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: playlist?.name ?? "Playlist",
          headerBackTitle: "Playlists",
          headerTitleStyle: { fontSize: 16, fontWeight: "600" },
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: headerTint,
          headerShadowVisible: false,
          headerRight: isOwner
            ? () => (
                <Pressable onPress={openOwnerMenu} className="px-2 py-1 active:opacity-60">
                  <MaterialIcons name="more-vert" size={22} color={headerTint} />
                </Pressable>
              )
            : undefined,
        }}
      />

      {isPending ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-foreground-muted dark:text-foreground-muted-dark">Loading...</Text>
        </View>
      ) : !playlist ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-foreground-muted dark:text-foreground-muted-dark">Playlist not found</Text>
        </View>
      ) : (
        <View className="flex-1">
          {/* Header */}
          <View className="bg-surface dark:bg-surface-dark px-4 py-5 border-b border-border dark:border-border-dark">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="queue-music" size={28} color="#6366f1" />
              <Text className="flex-1 ml-3 text-xl font-bold text-foreground dark:text-foreground-dark" numberOfLines={1}>
                {playlist.name}
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <MaterialIcons
                name={playlist.isPublic ? "public" : "lock"}
                size={13}
                color="#71717a"
                style={{ marginRight: 4 }}
              />
              <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark">
                {playlist.isPublic ? "Public" : "Private"} · {playlist.tracks.length}{" "}
                {playlist.tracks.length === 1 ? "song" : "songs"}
              </Text>
            </View>
            <Pressable
              onPress={handlePlayAll}
              disabled={playlist.tracks.length === 0}
              className="bg-indigo-500 rounded-lg px-6 py-3 flex-row items-center justify-center active:opacity-70"
              style={{ opacity: playlist.tracks.length === 0 ? 0.5 : 1 }}
            >
              <MaterialIcons name="play-arrow" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white font-medium">Play All</Text>
            </Pressable>
          </View>

          {/* Tracks */}
          {playlist.tracks.length === 0 ? (
            <View className="flex-1 justify-center items-center px-6">
              <MaterialIcons name="music-note" size={48} color="#a1a1aa" style={{ marginBottom: 12 }} />
              <Text className="text-center text-foreground-muted dark:text-foreground-muted-dark">
                No tracks in this playlist
              </Text>
            </View>
          ) : (
            <FlatList
              data={playlist.tracks}
              keyExtractor={(item) => item.trackId}
              renderItem={({ item, index }) => {
                const trackId = item.trackId;
                const isDownloaded = Platform.OS !== "web" && !!downloaded[trackId];
                const isPendingDownload = Platform.OS !== "web" && !!pending[trackId];
                const inLibrary = isInLibrary(trackId);
                return (
                  <View className="flex-row items-center pr-1">
                    <Pressable
                      onPress={() => handlePlayTrack(index)}
                      className="flex-1 flex-row items-center px-4 py-3.5 active:opacity-60"
                    >
                      <View className="flex-1">
                        <Text className="text-base text-foreground dark:text-foreground-dark" numberOfLines={1}>
                          {item.title}
                        </Text>
                        {item.artistName && (
                          <Text
                            className="text-sm text-foreground-muted dark:text-foreground-muted-dark mt-1"
                            numberOfLines={1}
                          >
                            {item.artistName}
                          </Text>
                        )}
                      </View>
                      <Text className="ml-3 text-sm text-foreground-muted dark:text-foreground-muted-dark">
                        {formatDuration(item.durationMs)}
                      </Text>
                    </Pressable>
                    {inLibrary && (
                      <MaterialIcons name="favorite" size={14} color="#6366f1" style={{ marginRight: 4 }} />
                    )}
                    {isPendingDownload ? (
                      <ActivityIndicator size="small" color="#6366f1" style={{ marginRight: 4 }} />
                    ) : isDownloaded ? (
                      <IconSymbol name="checkmark.circle.fill" size={16} color="#6366f1" style={{ marginRight: 4 }} />
                    ) : null}
                    <TrackContextMenu track={playlistTrackToTrack(item)} playlistId={playlist.id} />
                  </View>
                );
              }}
              ItemSeparatorComponent={() => (
                <View className="h-px mx-4 bg-border dark:bg-border-dark" />
              )}
            />
          )}
        </View>
      )}

      {/* Owner actions modal (non-iOS) */}
      {Platform.OS !== "ios" && (
        <Modal
          visible={menuVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}
            onPress={() => setMenuVisible(false)}
          >
            <View className="bg-background dark:bg-background-dark rounded-t-2xl overflow-hidden">
              <View className="px-4 py-3 border-b border-border dark:border-border-dark">
                <Text className="font-semibold text-foreground dark:text-foreground-dark" numberOfLines={1}>
                  {playlist?.name}
                </Text>
              </View>
              <Pressable
                onPress={() => { setMenuVisible(false); setNewName(playlist?.name ?? ""); setRenameVisible(true); }}
                className="px-4 py-4 active:opacity-60"
              >
                <Text className="text-base text-foreground dark:text-foreground-dark">Rename</Text>
              </Pressable>
              <View className="h-px mx-4 bg-border dark:bg-border-dark" />
              <Pressable
                onPress={() => { setMenuVisible(false); if (playlist) setVisibility.mutate({ id: playlist.id, isPublic: !playlist.isPublic }); }}
                className="px-4 py-4 active:opacity-60"
              >
                <Text className="text-base text-foreground dark:text-foreground-dark">
                  {playlist?.isPublic ? "Make Private" : "Make Public"}
                </Text>
              </Pressable>
              <View className="h-px mx-4 bg-border dark:bg-border-dark" />
              <Pressable
                onPress={() => { setMenuVisible(false); if (playlist) deletePlaylist.mutate(playlist.id, { onSuccess: () => router.back() }); }}
                className="px-4 py-4 active:opacity-60"
              >
                <Text className="text-base text-red-500">Delete Playlist</Text>
              </Pressable>
              <View className="h-px bg-border dark:bg-border-dark mt-2" />
              <Pressable onPress={() => setMenuVisible(false)} className="px-4 py-4 active:opacity-60">
                <Text className="text-base font-medium text-center text-foreground-muted dark:text-foreground-muted-dark">
                  Cancel
                </Text>
              </Pressable>
              <View style={{ height: 20 }} />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Rename modal */}
      <Modal
        visible={renameVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 }}
          onPress={() => setRenameVisible(false)}
        >
          <Pressable onPress={() => {}}>
            <View className="bg-background dark:bg-background-dark rounded-2xl p-6">
              <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-4">
                Rename Playlist
              </Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                onSubmitEditing={handleRename}
                autoFocus
                placeholder="Playlist name"
                placeholderTextColor="#a1a1aa"
                className="border border-border dark:border-border-dark rounded-lg px-3 py-2.5 text-foreground dark:text-foreground-dark mb-4"
              />
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setRenameVisible(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border dark:border-border-dark active:opacity-70"
                >
                  <Text className="text-center text-foreground dark:text-foreground-dark">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleRename}
                  disabled={!newName.trim() || renamePlaylist.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-500 active:opacity-70"
                  style={{ opacity: !newName.trim() || renamePlaylist.isPending ? 0.5 : 1 }}
                >
                  <Text className="text-center text-white font-medium">Save</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
