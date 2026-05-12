import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";

export default function SettingsScreen() {
  const { serverUrl } = useSettingsStore();
  const { clearTokens } = useAuthStore();
  const insets = useSafeAreaInsets();

  async function handleSignOut() {
    await clearTokens();
    router.replace("/(auth)/setup");
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-background dark:bg-background-dark">
      <View className="px-4 pt-6">
        <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-8">
          Settings
        </Text>

        <Text className="text-xs font-semibold text-foreground-muted dark:text-foreground-muted-dark uppercase tracking-wide mb-2">
          Server
        </Text>
        <View className="bg-surface dark:bg-surface-dark rounded-lg px-4 py-3 mb-8 border border-border dark:border-border-dark">
          <Text
            className="text-foreground dark:text-foreground-dark text-sm"
            numberOfLines={1}
          >
            {serverUrl || "—"}
          </Text>
        </View>

        <Pressable
          onPress={handleSignOut}
          className="rounded-lg py-3 items-center border border-destructive dark:border-destructive-dark active:opacity-75"
        >
          <Text className="text-destructive dark:text-destructive-dark font-medium">
            Sign out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
