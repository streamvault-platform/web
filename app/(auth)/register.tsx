import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthApiError, checkInvite, register } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";

export default function RegisterScreen() {
  const { invite } = useLocalSearchParams<{ invite?: string }>();
  const { serverUrl, setServerUrl } = useSettingsStore();
  const { setTokens } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!invite || !serverUrl) return;
    checkInvite(serverUrl, invite)
      .then(setInviteValid)
      .catch(() => setInviteValid(false));
  }, [invite, serverUrl]);

  async function handleRegister() {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    if (invite && inviteValid === false) {
      setError("This invite link is invalid or has already been used");
      return;
    }
    if (!serverUrl) {
      setError("No server configured");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tokens = await register(serverUrl, username, password, invite ?? undefined);
      setServerUrl(serverUrl);
      await setTokens(tokens.accessToken, tokens.refreshToken);
      router.replace("/(tabs)/library");
    } catch (e) {
      if (e instanceof AuthApiError) {
        if (e.status === 409) setError("Username already taken");
        else if (e.status === 410) setError("Invite link is invalid or already used");
        else if (e.status === 403) setError("Registration requires an invite link");
        else setError("Something went wrong. Please try again.");
      } else {
        setError("Could not connect. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }} className="bg-background dark:bg-background-dark">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 justify-center px-6 w-full max-w-sm self-center">
          {/* Brand */}
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-foreground dark:text-foreground-dark">
              Streamvault
            </Text>
            <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark mt-1">
              Self-hosted music streaming
            </Text>
          </View>

          <Pressable onPress={() => router.back()} className="mb-6">
            <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark">
              ← Back
            </Text>
          </Pressable>

          <Text className="text-xl font-semibold text-foreground dark:text-foreground-dark mb-1">
            Create account
          </Text>

          {invite ? (
            <View className="flex-row items-center gap-2 mb-6">
              {inviteValid === null ? (
                <ActivityIndicator size="small" />
              ) : inviteValid ? (
                <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark">
                  ✓ Invite link valid
                </Text>
              ) : (
                <Text className="text-sm text-destructive dark:text-destructive-dark">
                  This invite link is invalid or has already been used
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark mb-6">
              Choose a username and password
            </Text>
          )}

          <Field
            label="Username"
            value={username}
            onChangeText={(v) => { setUsername(v); setError(null); }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Field
            label="Password"
            value={password}
            onChangeText={(v) => { setPassword(v); setError(null); }}
            secureTextEntry
            error={error ?? undefined}
          />

          <Pressable
            onPress={handleRegister}
            disabled={loading || (invite != null && inviteValid === false)}
            className="bg-primary rounded-lg py-3.5 items-center active:opacity-75 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-primary-foreground font-semibold text-base">
                Create account
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  error,
  ...props
}: { label: string; error?: string } & TextInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground dark:text-foreground-dark mb-1.5">
        {label}
      </Text>
      <TextInput
        className={[
          "rounded-lg text-base",
          "bg-surface dark:bg-surface-dark",
          "text-foreground dark:text-foreground-dark",
          "border",
          error
            ? "border-destructive dark:border-destructive-dark"
            : "border-border dark:border-border-dark",
        ].join(" ")}
        style={{ paddingHorizontal: 16, paddingVertical: 12 }}
        placeholderTextColor="#71717a"
        {...props}
      />
      {error && (
        <Text className="text-destructive dark:text-destructive-dark text-xs mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
