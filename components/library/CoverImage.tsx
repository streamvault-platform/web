import { Image } from "expo-image";
import { Platform, View } from "react-native";
import { useState } from "react";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";

type Props = {
  coverUrl: string | null;
  size: number;
};

export function CoverImage({ coverUrl, size }: Props) {
  const serverUrl = useSettingsStore((s) => s.serverUrl);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [failed, setFailed] = useState(false);

  if (!coverUrl || !serverUrl || failed) {
    return <Placeholder size={size} />;
  }

  const source =
    Platform.OS === "web"
      ? {
          uri: `${serverUrl}${coverUrl}${accessToken ? `?token=${encodeURIComponent(accessToken)}` : ""}`,
        }
      : {
          uri: `${serverUrl}${coverUrl}`,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        };

  return (
    <Image
      source={source}
      style={{ width: size, height: size, borderRadius: 4 }}
      contentFit="cover"
      transition={150}
      onError={() => setFailed(true)}
    />
  );
}

function Placeholder({ size }: { size: number }) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: 4 }}
      className="bg-surface dark:bg-surface-dark items-center justify-center"
    >
      <IconSymbol name="music.note" size={size * 0.4} color="#6366f1" />
    </View>
  );
}
