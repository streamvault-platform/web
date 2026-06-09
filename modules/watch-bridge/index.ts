import { Platform } from "react-native";
import { requireNativeModule } from "expo-modules-core";

export type WatchConfig = {
  serverUrl: string;
  accessToken: string;
  refreshToken: string;
};

type WatchBridgeNative = {
  sendConfig(config: WatchConfig): Promise<void>;
};

let native: WatchBridgeNative | null = null;

if (Platform.OS === "ios") {
  try {
    native = requireNativeModule<WatchBridgeNative>("WatchBridge");
  } catch {
    // Not linked — Expo Go, simulator without a dev build, or non-iOS platform.
  }
}

export async function sendConfigToWatch(config: WatchConfig): Promise<void> {
  await native?.sendConfig?.(config);
}
