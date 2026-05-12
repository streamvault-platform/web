import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Stack } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function CategoryRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
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
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <Stack.Screen options={{ headerShown: false }} />

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
          onPress={() => router.push("/library/artists")}
        />
        <View className="h-px mx-4 bg-border dark:bg-border-dark" />
        <CategoryRow
          icon="album"
          label="Albums"
          onPress={() => router.push("/library/albums")}
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
