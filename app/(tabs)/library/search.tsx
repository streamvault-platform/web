import { router, Stack } from "expo-router";
import { useDeferredValue, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AlbumRow } from "@/components/library/AlbumRow";
import { ArtistRow } from "@/components/library/ArtistRow";
import { TrackRow } from "@/components/library/TrackRow";
import type { Album, Artist, Track } from "@/lib/api/library";
import { useSearch } from "@/lib/hooks/library";

type AnyItem = Track | Album | Artist;
type Section = { title: "Tracks" | "Albums" | "Artists"; data: AnyItem[] };

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const inputRef = useRef<TextInput>(null);

  const { artists, albums, tracks, isPending } = useSearch(deferred);

  const sections: Section[] = [
    ...(tracks.length > 0 ? [{ title: "Tracks" as const, data: tracks as AnyItem[] }] : []),
    ...(albums.length > 0 ? [{ title: "Albums" as const, data: albums as AnyItem[] }] : []),
    ...(artists.length > 0 ? [{ title: "Artists" as const, data: artists as AnyItem[] }] : []),
  ];

  const hasResults = sections.length > 0;
  const showEmpty = deferred.trim().length > 0 && !isPending && !hasResults;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center px-4 pt-4 pb-3 gap-3">
        <View className="flex-1 flex-row items-center bg-surface dark:bg-surface-dark rounded-xl px-3 py-2.5">
          <TextInput
            ref={inputRef}
            autoFocus
            className="flex-1 text-base text-foreground dark:text-foreground-dark"
            placeholder="Artists, albums, songs..."
            placeholderTextColor="#71717a"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <Pressable onPress={() => router.back()} className="active:opacity-60">
          <Text className="text-base text-indigo-500">Cancel</Text>
        </Pressable>
      </View>

      {isPending && <ActivityIndicator className="mt-8" />}

      {showEmpty && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground-muted dark:text-foreground-muted-dark">
            No results for "{deferred}"
          </Text>
        </View>
      )}

      {!isPending && hasResults && (
        <SectionList<AnyItem, Section>
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View className="px-4 py-2 bg-background dark:bg-background-dark">
              <Text className="text-xs font-semibold uppercase tracking-widest text-foreground-muted dark:text-foreground-muted-dark">
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item, section }) => {
            if (section.title === "Artists") {
              const artist = item as Artist;
              return (
                <ArtistRow
                  artist={artist}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/library/artists/[artistId]" as any,
                      params: { artistId: artist.id, artistName: artist.name },
                    })
                  }
                />
              );
            }
            if (section.title === "Albums") {
              const album = item as Album;
              return (
                <AlbumRow
                  album={album}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/library/albums/[albumId]" as any,
                      params: { albumId: album.id, albumTitle: album.title },
                    })
                  }
                />
              );
            }
            const track = item as Track;
            return <TrackRow track={track} onPress={() => {}} />;
          }}
          ItemSeparatorComponent={() => (
            <View className="h-px mx-4 bg-border dark:bg-border-dark" />
          )}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}
