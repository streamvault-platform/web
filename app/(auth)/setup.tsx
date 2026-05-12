import { router } from "expo-router";
import { useState } from "react";
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

import { AuthApiError, createAdmin, fetchSetupStatus, login } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";

type Step =
  | { kind: "url" }
  | { kind: "credentials"; mode: "create-admin" | "login"; serverUrl: string };

export default function SetupScreen() {
  const { serverUrl: savedUrl, setServerUrl } = useSettingsStore();
  const { setTokens } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>({ kind: "url" });
  const [url, setUrl] = useState(savedUrl);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    const trimmed = url.trim().replace(/\/+$/, "");
    if (!trimmed) {
      setError("Please enter a server URL");
      return;
    }

    const hasProtocol = /^https?:\/\//i.test(trimmed);
    const candidates = hasProtocol
      ? [trimmed]
      : [`https://${trimmed}`, `http://${trimmed}`];

    setLoading(true);
    setError(null);
    for (const candidate of candidates) {
      try {
        const status = await fetchSetupStatus(candidate);
        setStep({
          kind: "credentials",
          mode: status.configured ? "login" : "create-admin",
          serverUrl: candidate,
        });
        setLoading(false);
        return;
      } catch {
        if (candidate !== candidates[candidates.length - 1]) continue;
      }
    }
    setError("Could not connect. Check the URL and try again.");
    setLoading(false);
  }

  async function handleSubmit() {
    if (step.kind !== "credentials") return;
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tokens =
        step.mode === "create-admin"
          ? await createAdmin(step.serverUrl, username, password)
          : await login(step.serverUrl, username, password);
      setServerUrl(step.serverUrl);
      await setTokens(tokens.accessToken, tokens.refreshToken);
      router.replace("/(tabs)/library");
    } catch (e) {
      if (e instanceof AuthApiError) {
        if (e.status === 401) setError("Invalid username or password");
        else if (e.status === 409) setError("An admin account already exists");
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

          {step.kind === "url" ? (
            <>
              <Text className="text-xl font-semibold text-foreground dark:text-foreground-dark mb-1">
                Connect to your server
              </Text>
              <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark mb-6">
                Enter the URL of your Streamvault instance
              </Text>

              <Field
                label="Server URL"
                value={url}
                onChangeText={(v) => { setUrl(v); setError(null); }}
                placeholder="https://streamvault.example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                error={error ?? undefined}
              />

              <Button onPress={handleConnect} loading={loading}>
                Connect
              </Button>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => { setStep({ kind: "url" }); setError(null); }}
                className="mb-6"
              >
                <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark">
                  ← {step.serverUrl}
                </Text>
              </Pressable>

              <Text className="text-xl font-semibold text-foreground dark:text-foreground-dark mb-1">
                {step.mode === "create-admin" ? "Create admin account" : "Sign in"}
              </Text>
              <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark mb-6">
                {step.mode === "create-admin"
                  ? "Set up the first account on your server"
                  : "Welcome back"}
              </Text>

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

              <Button onPress={handleSubmit} loading={loading}>
                {step.mode === "create-admin" ? "Create account" : "Sign in"}
              </Button>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Local components ──────────────────────────────────────────────────────────

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
          "rounded-lg px-4 py-3 text-base",
          "bg-surface dark:bg-surface-dark",
          "text-foreground dark:text-foreground-dark",
          "border",
          error
            ? "border-destructive dark:border-destructive-dark"
            : "border-border dark:border-border-dark",
        ].join(" ")}
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

function Button({
  onPress,
  loading,
  children,
}: {
  onPress: () => void;
  loading?: boolean;
  children: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="bg-primary rounded-lg py-3.5 items-center active:opacity-75 mt-2"
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <Text className="text-primary-foreground font-semibold text-base">
          {children}
        </Text>
      )}
    </Pressable>
  );
}
