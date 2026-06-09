import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useAuthStore } from "@/stores/auth";
import { useDownloadsStore } from "@/stores/downloads";
import { useSettingsStore } from "@/stores/settings";
import { useWatchSyncStore } from "@/stores/watchSync";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function SettingsScreen() {
  const { serverUrl } = useSettingsStore();
  const { clearTokens, username, accessToken, refreshToken } = useAuthStore();
  const { downloaded, totalBytes, clearAll } = useDownloadsStore();
  const { sendConfig: sendToWatch, lastSyncedAt } = useWatchSyncStore();
  const insets = useSafeAreaInsets();
  const [watchSending, setWatchSending] = useState(false);

  async function handleSendToWatch() {
    if (!serverUrl || !accessToken || !refreshToken) return;
    setWatchSending(true);
    try {
      await sendToWatch({ serverUrl, accessToken, refreshToken });
    } finally {
      setWatchSending(false);
    }
  }

  const downloadCount = Object.keys(downloaded).length;

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
          Account
        </Text>
        <View className="bg-surface dark:bg-surface-dark rounded-lg px-4 py-3 mb-2 border border-border dark:border-border-dark">
          <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark mb-0.5">
            Signed in as
          </Text>
          <Text className="text-foreground dark:text-foreground-dark font-medium">
            {username ?? "—"}
          </Text>
        </View>
        <View className="bg-surface dark:bg-surface-dark rounded-lg px-4 py-3 mb-8 border border-border dark:border-border-dark">
          <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark mb-0.5">
            Server
          </Text>
          <Text className="text-foreground dark:text-foreground-dark text-sm" numberOfLines={1}>
            {serverUrl || "—"}
          </Text>
        </View>

        {Platform.OS !== "web" && (
          <>
            <Text className="text-xs font-semibold text-foreground-muted dark:text-foreground-muted-dark uppercase tracking-wide mb-2">
              Downloads
            </Text>
            <View className="bg-surface dark:bg-surface-dark rounded-lg px-4 py-3 mb-3 border border-border dark:border-border-dark flex-row items-center justify-between">
              <Text className="text-foreground dark:text-foreground-dark">
                {downloadCount} {downloadCount === 1 ? "track" : "tracks"}
              </Text>
              <Text className="text-foreground-muted dark:text-foreground-muted-dark text-sm">
                {formatBytes(totalBytes())}
              </Text>
            </View>
            {downloadCount > 0 && (
              <Pressable
                onPress={clearAll}
                className="rounded-lg py-3 items-center border border-border dark:border-border-dark active:opacity-75 mb-8"
              >
                <Text className="text-foreground-muted dark:text-foreground-muted-dark font-medium">
                  Clear downloads
                </Text>
              </Pressable>
            )}
          </>
        )}

        {Platform.OS === "ios" && (
          <>
            <Text className="text-xs font-semibold text-foreground-muted dark:text-foreground-muted-dark uppercase tracking-wide mb-2">
              Apple Watch
            </Text>
            <Pressable
              onPress={handleSendToWatch}
              disabled={watchSending}
              className="bg-surface dark:bg-surface-dark rounded-lg px-4 py-3 mb-2 border border-border dark:border-border-dark flex-row items-center justify-between active:opacity-75"
            >
              <Text className="text-foreground dark:text-foreground-dark font-medium">
                Send config to Watch
              </Text>
              {watchSending ? (
                <ActivityIndicator size="small" />
              ) : lastSyncedAt ? (
                <Text className="text-foreground-muted dark:text-foreground-muted-dark text-xs">
                  Sent
                </Text>
              ) : null}
            </Pressable>
            <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark mb-8 px-1">
              Opens Streamvault on your Watch automatically once sent.
            </Text>
          </>
        )}

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
