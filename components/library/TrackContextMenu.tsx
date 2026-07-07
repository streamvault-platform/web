import { useState } from "react";
import { ActionSheetIOS, Modal, Platform, Pressable, Text, View, FlatList } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useDownloadsStore } from "@/stores/downloads";
import { useQueueStore } from "@/stores/queue";
import { useMyLibrary, useAddToLibrary, useRemoveFromLibrary } from "@/lib/hooks/library";
import { usePlaylists, useAddTrackToPlaylist, useRemoveTrackFromPlaylist } from "@/lib/hooks/playlists";
import { useSyncToWatch, useTrackSyncStatus } from "@/lib/hooks/watchSync";
import type { Track } from "@/lib/api/library";

type Props = { track: Track; playlistId?: string };

export function TrackContextMenu({ track, playlistId }: Props) {
  const [visible, setVisible] = useState(false);
  const [playlistPickerVisible, setPlaylistPickerVisible] = useState(false);
  const { downloaded, pending, download, remove } = useDownloadsStore();
  const { playNext, addToQueue } = useQueueStore();
  const { isInLibrary } = useMyLibrary();
  const addToLibrary = useAddToLibrary();
  const removeFromLibrary = useRemoveFromLibrary();
  const { data: playlists = [] } = usePlaylists();
  const addTrackToPlaylist = useAddTrackToPlaylist();
  const removeTrackFromPlaylist = useRemoveTrackFromPlaylist();
  const syncToWatch = useSyncToWatch();
  const { isSynced, isSyncing } = useTrackSyncStatus(track.id);

  const isDownloaded = !!downloaded[track.id];
  const isPending = !!pending[track.id];
  const inLibrary = isInLibrary(track.id);

  const downloadLabel = isPending
    ? "Downloading…"
    : isDownloaded
    ? "Remove Download"
    : "Download";
  const libraryLabel = inLibrary ? "Remove from Library" : "Add to Library";
  const watchSyncLabel = isSyncing ? "Syncing to Watch…" : isSynced ? "Synced to Watch" : "Sync to Watch";

  function handlePlayNext() {
    playNext(track);
    setVisible(false);
  }

  function handleAddToQueue() {
    addToQueue(track);
    setVisible(false);
  }

  function handleLibrary() {
    if (inLibrary) {
      removeFromLibrary.mutate(track.id);
    } else {
      addToLibrary.mutate(track.id);
    }
    setVisible(false);
  }

  function handleDownload() {
    if (!isPending) {
      if (isDownloaded) {
        remove(track.id);
      } else {
        download(track);
        if (!inLibrary) addToLibrary.mutate(track.id);
      }
    }
    setVisible(false);
  }

  function handleAddToPlaylist(pid: string) {
    addTrackToPlaylist.mutate({ playlistId: pid, trackId: track.id });
    setPlaylistPickerVisible(false);
    setVisible(false);
  }

  function handleRemoveFromPlaylist() {
    if (!playlistId) return;
    removeTrackFromPlaylist.mutate({ playlistId, trackId: track.id });
    setVisible(false);
  }

  function handleWatchSync() {
    if (!isSyncing) syncToWatch.mutate([track.id]);
    setVisible(false);
  }

  function open() {
    if (Platform.OS === "ios") {
      const playlistLabel = playlistId ? "Remove from Playlist" : "Add to Playlist";
      const options = ["Cancel", "Play Next", "Add to Queue", libraryLabel, playlistLabel, downloadLabel, watchSyncLabel];
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0, destructiveButtonIndex: playlistId ? 4 : undefined },
        (i) => {
          if (i === 1) handlePlayNext();
          else if (i === 2) handleAddToQueue();
          else if (i === 3) handleLibrary();
          else if (i === 4) { if (playlistId) handleRemoveFromPlaylist(); else setPlaylistPickerVisible(true); }
          else if (i === 5) handleDownload();
          else if (i === 6) handleWatchSync();
        }
      );
    } else {
      setVisible(true);
    }
  }

  return (
    <>
      <Pressable
        onPress={open}
        className="pl-3 p-1 active:opacity-60"
        accessibilityLabel="More options"
      >
        <IconSymbol name="ellipsis" size={20} color="#71717a" />
      </Pressable>

      {Platform.OS !== "ios" && (
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          onRequestClose={() => setVisible(false)}
        >
          <Pressable
            style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}
            onPress={() => setVisible(false)}
            accessibilityLabel="Close menu"
          >
            <View className="bg-background dark:bg-background-dark rounded-t-2xl overflow-hidden">
              {/* Track header */}
              <View className="px-4 py-3 border-b border-border dark:border-border-dark">
                <Text
                  className="font-semibold text-foreground dark:text-foreground-dark"
                  numberOfLines={1}
                >
                  {track.title}
                </Text>
                <Text
                  className="text-sm text-foreground-muted dark:text-foreground-muted-dark"
                  numberOfLines={1}
                >
                  {track.artistName}
                </Text>
              </View>

              <Pressable onPress={handlePlayNext} className="px-4 py-4 active:opacity-60">
                <Text className="text-base text-foreground dark:text-foreground-dark">
                  Play Next
                </Text>
              </Pressable>

              <View className="h-px mx-4 bg-border dark:bg-border-dark" />

              <Pressable onPress={handleAddToQueue} className="px-4 py-4 active:opacity-60">
                <Text className="text-base text-foreground dark:text-foreground-dark">
                  Add to Queue
                </Text>
              </Pressable>

              <View className="h-px mx-4 bg-border dark:bg-border-dark" />

              <Pressable onPress={handleLibrary} className="px-4 py-4 active:opacity-60">
                <Text className="text-base text-foreground dark:text-foreground-dark">
                  {libraryLabel}
                </Text>
              </Pressable>

              <View className="h-px mx-4 bg-border dark:bg-border-dark" />

              {playlistId ? (
                <Pressable onPress={handleRemoveFromPlaylist} className="px-4 py-4 active:opacity-60">
                  <Text className="text-base text-red-500">Remove from Playlist</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => setPlaylistPickerVisible(true)} className="px-4 py-4 active:opacity-60">
                  <Text className="text-base text-foreground dark:text-foreground-dark">
                    Add to Playlist
                  </Text>
                </Pressable>
              )}

              {Platform.OS !== "web" && (
                <>
                  <View className="h-px mx-4 bg-border dark:bg-border-dark" />
                  <Pressable
                    onPress={handleDownload}
                    disabled={isPending}
                    className="px-4 py-4 active:opacity-60"
                    style={{ opacity: isPending ? 0.4 : 1 }}
                  >
                    <Text className="text-base text-foreground dark:text-foreground-dark">
                      {downloadLabel}
                    </Text>
                  </Pressable>
                </>
              )}

              <View className="h-px bg-border dark:bg-border-dark mt-2" />
              <Pressable
                onPress={() => setVisible(false)}
                className="px-4 py-4 active:opacity-60"
              >
                <Text className="text-base font-medium text-center text-foreground-muted dark:text-foreground-muted-dark">
                  Cancel
                </Text>
              </Pressable>

              <View style={{ height: 20 }} />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Playlist Picker Modal */}
      <Modal
        visible={playlistPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPlaylistPickerVisible(false)}
      >
        <Pressable
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={() => setPlaylistPickerVisible(false)}
          accessibilityLabel="Close playlist picker"
        >
          <View className="bg-background dark:bg-background-dark rounded-t-2xl overflow-hidden max-h-96">
            {/* Header */}
            <View className="px-4 py-4 border-b border-border dark:border-border-dark">
              <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
                Add to Playlist
              </Text>
            </View>

            {/* Playlist List */}
            {playlists.length === 0 ? (
              <View className="px-4 py-8 justify-center items-center">
                <Text className="text-center text-foreground-muted dark:text-foreground-muted-dark">
                  No playlists yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleAddToPlaylist(item.id)}
                    disabled={addTrackToPlaylist.isPending}
                    className="px-4 py-4 active:opacity-60"
                    style={{
                      opacity: addTrackToPlaylist.isPending ? 0.6 : 1,
                    }}
                  >
                    <Text className="text-base text-foreground dark:text-foreground-dark">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark mt-1">
                      {item.trackCount} {item.trackCount === 1 ? "song" : "songs"}
                    </Text>
                  </Pressable>
                )}
                ItemSeparatorComponent={() => (
                  <View className="h-px mx-4 bg-border dark:bg-border-dark" />
                )}
                scrollEnabled={true}
              />
            )}

            {/* Cancel Button */}
            <View className="h-px bg-border dark:bg-border-dark mt-2" />
            <Pressable
              onPress={() => setPlaylistPickerVisible(false)}
              className="px-4 py-4 active:opacity-60"
            >
              <Text className="text-base font-medium text-center text-foreground-muted dark:text-foreground-muted-dark">
                Cancel
              </Text>
            </Pressable>

            <View style={{ height: 20 }} />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
