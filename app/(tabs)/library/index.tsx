import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Stack } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMyLibrary } from "@/lib/hooks/library";
import { usePlaylists } from "@/lib/hooks/playlists";

function CategoryRow({
  icon,
  label,
  detail,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  detail?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 active:opacity-60"
    >
      <MaterialIcons name={icon} size={20} color="#6366f1" style={{ marginRight: 12 }} />
      <Text className="flex-1 text-base text-foreground dark:text-foreground-dark">
        {label}
      </Text>
      {detail ? (
        <Text className="mr-2 text-sm text-foreground-muted dark:text-foreground-muted-dark">
          {detail}
        </Text>
      ) : null}
      <MaterialIcons name="chevron-right" size={20} color="#71717a" />
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mx-4 mb-4 rounded-xl overflow-hidden bg-surface dark:bg-surface-dark">
      <Text className="px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-widest text-foreground-muted dark:text-foreground-muted-dark">
        {title}
      </Text>
      <View className="h-px bg-border dark:bg-border-dark" />
      {children}
    </View>
  );
}

export default function LibraryScreen() {
  const { tracks, artists, albums } = useMyLibrary();
  const { data: playlists = [] } = usePlaylists();

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <Stack.Screen options={{ headerShown: false, headerBackTitle: "Home" }} />

      <View className="px-4 pt-4 pb-4">
        <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-4">
          Library
        </Text>

        <Pressable
          onPress={() => router.push("/library/search")}
          className="flex-row items-center bg-surface dark:bg-surface-dark rounded-xl px-3 py-2.5 active:opacity-70"
        >
          <MaterialIcons name="search" size={18} color="#71717a" />
          <Text className="flex-1 ml-2 text-base text-foreground-muted dark:text-foreground-muted-dark">
            Artists, albums, songs...
          </Text>
        </Pressable>
      </View>

      <Section title="My Library">
        <CategoryRow
          icon="person"
          label="Artists"
          detail={artists.length > 0 ? `${artists.length}` : undefined}
          onPress={() => router.push("/library/my-artists")}
        />
        <View className="h-px mx-4 bg-border dark:bg-border-dark" />
        <CategoryRow
          icon="album"
          label="Albums"
          detail={albums.length > 0 ? `${albums.length}` : undefined}
          onPress={() => router.push("/library/my-albums")}
        />
        <View className="h-px mx-4 bg-border dark:bg-border-dark" />
        <CategoryRow
          icon="music-note"
          label="Songs"
          detail={tracks.length > 0 ? `${tracks.length}` : undefined}
          onPress={() => router.push("/library/my-tracks")}
        />
        <View className="h-px mx-4 bg-border dark:bg-border-dark" />
        <CategoryRow
          icon="queue-music"
          label="Playlists"
          detail={playlists.length > 0 ? `${playlists.length}` : undefined}
          onPress={() => router.push("/library/playlists")}
        />
      </Section>

      <Section title="Browse Songs">
        <CategoryRow
          icon="person"
          label="Artists"
          onPress={() => router.push("/library/artists")}
        />
        <View className="h-px mx-4 bg-border dark:bg-border-dark" />
        <CategoryRow
          icon="album"
          label="Albums"
          onPress={() => router.push("/library/albums")}
        />
      </Section>
    </SafeAreaView>
  );
}
