import { useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FileDropzone } from "@/components/studio/FileDropzone";
import { useUploadTracks } from "@/lib/hooks/studio";
import { useTracks } from "@/lib/hooks/library";
import { TrackRow } from "@/components/library/TrackRow";
import type { Track } from "@/lib/api/library";

export default function StudioUploadScreen() {
  const insets = useSafeAreaInsets();
  const { mutate: upload, isPending } = useUploadTracks();
  const { data: tracks = [] } = useTracks();
  const [lastUploaded, setLastUploaded] = useState<Track[]>([]);

  function handleFiles(files: File[]) {
    upload(files, {
      onSuccess: (uploaded) => setLastUploaded(uploaded),
    });
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-background dark:bg-background-dark">
      <View className="px-4 pt-6 pb-4">
        <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">
          Upload Tracks
        </Text>
      </View>

      <View className="px-4 mb-6">
        <FileDropzone onFiles={handleFiles} uploading={isPending} />
      </View>

      {isPending && (
        <View className="items-center py-4">
          <ActivityIndicator />
          <Text className="text-foreground-muted dark:text-foreground-muted-dark text-sm mt-2">
            Processing uploads…
          </Text>
        </View>
      )}

      {lastUploaded.length > 0 && (
        <View className="px-4 mb-4">
          <Text className="text-xs font-semibold text-foreground-muted dark:text-foreground-muted-dark uppercase tracking-wide mb-2">
            Just uploaded ({lastUploaded.length})
          </Text>
          {lastUploaded.map((t) => (
            <TrackRow
              key={t.id}
              track={t}
              onPress={() => {}}
            />
          ))}
        </View>
      )}

      <View className="px-4 mb-2">
        <Text className="text-xs font-semibold text-foreground-muted dark:text-foreground-muted-dark uppercase tracking-wide">
          All tracks ({tracks.length})
        </Text>
      </View>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TrackRow track={item} onPress={() => {}} />
        )}
      />
    </View>
  );
}
