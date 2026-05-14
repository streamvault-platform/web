import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Redirect, Stack } from "expo-router";
import { FlatList, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Track } from "@/lib/api/library";
import { TrackContextMenu } from "@/components/library/TrackContextMenu";
import { formatBytes, formatDownloadDate } from "@/lib/utils/format";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDownloadsStore, type DownloadEntry } from "@/stores/downloads";
import { usePlaybackStore } from "@/stores/playback";

function entryToTrack(trackId: string, entry: DownloadEntry): Track {
  return {
    id: trackId,
    title: entry.title,
    artistId: null,
    artistName: entry.artistName ?? null,
    albumId: null,
    albumTitle: null,
    trackNumber: null,
    discNumber: null,
    durationMs: null,
    genre: null,
    year: null,
    mimeType: entry.mimeType ?? "audio/mpeg",
    filePath: entry.localPath,
  };
}

export default function DownloadsScreen() {
  const { downloaded } = useDownloadsStore();
  const { playQueue } = usePlaybackStore();
  const isDark = useColorScheme() === "dark";

  if (Platform.OS === "web") return <Redirect href="/library" />;

  const entries = Object.entries(downloaded).sort(
    ([, a], [, b]) => b.downloadedAt - a.downloadedAt
  );

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background dark:bg-background-dark">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Downloads",
          headerTitleStyle: { fontSize: 16, fontWeight: "600" },
          headerStyle: { backgroundColor: isDark ? "#09090b" : "#ffffff" },
          headerTintColor: isDark ? "#fafafa" : "#09090b",
          headerShadowVisible: false,
        }}
      />

      {entries.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <MaterialIcons name="download" size={48} color="#a1a1aa" style={{ marginBottom: 12 }} />
          <Text className="text-center text-foreground-muted dark:text-foreground-muted-dark">
            No downloaded songs
          </Text>
          <Text className="text-center text-sm text-foreground-muted dark:text-foreground-muted-dark mt-2">
            Download tracks to listen offline
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={([trackId]) => trackId}
          renderItem={({ item: [trackId, entry] }) => {
            const track = entryToTrack(trackId, entry);
            return (
              <View className="flex-row items-center pr-1">
                <Pressable
                  onPress={() => playQueue([track], 0)}
                  className="flex-1 flex-row items-center px-4 py-3.5 active:opacity-60"
                >
                  <MaterialIcons name="download-done" size={18} color="#6366f1" style={{ marginRight: 12 }} />
                  <View className="flex-1">
                    <Text className="text-base text-foreground dark:text-foreground-dark" numberOfLines={1}>
                      {entry.title}
                    </Text>
                    <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark mt-0.5" numberOfLines={1}>
                      {entry.artistName ?? "Unknown Artist"} · {formatBytes(entry.fileSizeBytes)} · {formatDownloadDate(entry.downloadedAt)}
                    </Text>
                  </View>
                </Pressable>
                <TrackContextMenu track={track} />
              </View>
            );
          }}
          ItemSeparatorComponent={() => (
            <View className="h-px mx-4 bg-border dark:bg-border-dark" />
          )}
        />
      )}
    </SafeAreaView>
  );
}
