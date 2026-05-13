import { useState } from "react";
import { ActionSheetIOS, Modal, Platform, Pressable, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useDownloadsStore } from "@/stores/downloads";
import { useQueueStore } from "@/stores/queue";
import { useMyLibrary, useAddToLibrary, useRemoveFromLibrary } from "@/lib/hooks/library";
import type { Track } from "@/lib/api/library";

type Props = { track: Track };

export function TrackContextMenu({ track }: Props) {
  const [visible, setVisible] = useState(false);
  const { downloaded, pending, download, remove } = useDownloadsStore();
  const { playNext, addToQueue } = useQueueStore();
  const { isInLibrary } = useMyLibrary();
  const addToLibrary = useAddToLibrary();
  const removeFromLibrary = useRemoveFromLibrary();

  const isDownloaded = !!downloaded[track.id];
  const isPending = !!pending[track.id];
  const inLibrary = isInLibrary(track.id);

  const downloadLabel = isPending
    ? "Downloading…"
    : isDownloaded
    ? "Remove Download"
    : "Download";
  const libraryLabel = inLibrary ? "Remove from Library" : "Add to Library";

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
      isDownloaded ? remove(track.id) : download(track);
    }
    setVisible(false);
  }

  function open() {
    if (Platform.OS === "ios") {
      const options = ["Cancel", "Play Next", "Add to Queue", libraryLabel, downloadLabel];
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0 },
        (i) => {
          if (i === 1) handlePlayNext();
          else if (i === 2) handleAddToQueue();
          else if (i === 3) handleLibrary();
          else if (i === 4) handleDownload();
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
    </>
  );
}
