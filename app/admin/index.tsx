import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCreateUser, useDeleteUser, useUpdateRole, useUsers } from "@/lib/hooks/admin";
import { useCreateInvite, useDeleteInvite, useInvites } from "@/lib/hooks/invites";
import { useSettingsStore } from "@/stores/settings";
import type { AdminUser, UserRole } from "@/lib/api/admin";

const ROLES: UserRole[] = ["USER", "ARTIST", "ADMIN"];

function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "No expiry";
  const d = new Date(expiresAt);
  return `Expires ${d.toLocaleDateString()}`;
}

function copyToClipboard(text: string) {
  if (Platform.OS === "web" && typeof navigator !== "undefined") {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

export default function AdminUsersScreen() {
  const isDark = useColorScheme() === "dark";
  const { serverUrl } = useSettingsStore();
  const { data: users = [], isPending } = useUsers();
  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { mutate: updateRole } = useUpdateRole();
  const { mutate: deleteUser } = useDeleteUser();
  const { data: invites = [], isPending: invitesPending } = useInvites();
  const { mutate: createInvite, isPending: creatingInvite } = useCreateInvite();
  const { mutate: deleteInvite } = useDeleteInvite();

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("USER");
  const [inviteExpiry, setInviteExpiry] = useState("7");

  const inputStyle = { color: isDark ? "#fafafa" : "#09090b", backgroundColor: isDark ? "#18181b" : "#ffffff" };

  function handleCreate() {
    if (!newUsername.trim() || !newPassword.trim()) return;
    createUser(
      { username: newUsername.trim(), password: newPassword.trim(), role: newRole },
      { onSuccess: () => { setNewUsername(""); setNewPassword(""); } }
    );
  }

  function handleRoleChange(user: AdminUser, role: UserRole) {
    updateRole({ userId: user.id, role });
  }

  function handleDelete(user: AdminUser) {
    if (Platform.OS === "web") {
      if (!window.confirm(`Delete user "${user.username}"?`)) return;
      deleteUser(user.id);
    } else {
      Alert.alert("Delete user", `Delete "${user.username}"?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteUser(user.id) },
      ]);
    }
  }

  function handleCreateInvite() {
    const days = parseInt(inviteExpiry, 10);
    createInvite(Number.isFinite(days) && days > 0 ? days : undefined);
  }

  function handleCopyInvite(token: string) {
    const link = `${serverUrl?.replace(/\/+$/, "") ?? ""}/register?invite=${token}`;
    copyToClipboard(link);
  }

  function handleRevokeInvite(id: string) {
    if (Platform.OS === "web") {
      if (!window.confirm("Revoke this invite link?")) return;
      deleteInvite(id);
    } else {
      Alert.alert("Revoke invite", "Revoke this invite link?", [
        { text: "Cancel", style: "cancel" },
        { text: "Revoke", style: "destructive", onPress: () => deleteInvite(id) },
      ]);
    }
  }

  return (
    <View style={{ flex: 1 }} className="bg-background dark:bg-background-dark">
      <Stack.Screen options={{ title: "Admin" }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* ── Create user ─────────────────────────────────────────────── */}
        <View className="px-4 pt-4 mb-6">
          <Text className="text-xs font-semibold text-foreground-muted dark:text-foreground-muted-dark uppercase tracking-wide mb-2">
            Create user
          </Text>
          <View className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4 gap-3">
            <TextInput
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Username"
              autoCapitalize="none"
              placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
              className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg px-3 py-2.5"
              style={inputStyle}
            />
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
              className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg px-3 py-2.5"
              style={inputStyle}
            />
            <View className="flex-row gap-2">
              {ROLES.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setNewRole(r)}
                  className={`flex-1 py-2 rounded-lg items-center border ${newRole === r ? "bg-indigo-600 border-indigo-600" : "border-border dark:border-border-dark"}`}
                >
                  <Text className={`text-xs font-medium ${newRole === r ? "text-white" : "text-foreground-muted dark:text-foreground-muted-dark"}`}>
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={handleCreate}
              disabled={creating || !newUsername.trim() || !newPassword.trim()}
              className="bg-indigo-600 rounded-lg py-3 items-center active:opacity-80"
            >
              {creating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">Create</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── Users ───────────────────────────────────────────────────── */}
        <View className="px-4 mb-2">
          <Text className="text-xs font-semibold text-foreground-muted dark:text-foreground-muted-dark uppercase tracking-wide">
            Users ({users.length})
          </Text>
        </View>
        {isPending ? (
          <ActivityIndicator style={{ marginTop: 16, marginBottom: 24 }} />
        ) : (
          <View className="px-4 gap-2 mb-8">
            {users.map((item) => (
              <View key={item.id} className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="font-semibold text-foreground dark:text-foreground-dark">{item.username}</Text>
                  <Pressable onPress={() => handleDelete(item)} className="active:opacity-70 px-2 py-1">
                    <Text className="text-destructive dark:text-destructive-dark text-xs font-medium">Delete</Text>
                  </Pressable>
                </View>
                <View className="flex-row gap-2">
                  {ROLES.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => handleRoleChange(item, r)}
                      disabled={item.role === r}
                      className={`flex-1 py-1.5 rounded-lg items-center border ${item.role === r ? "bg-indigo-600 border-indigo-600" : "border-border dark:border-border-dark active:opacity-70"}`}
                    >
                      <Text className={`text-xs font-medium ${item.role === r ? "text-white" : "text-foreground-muted dark:text-foreground-muted-dark"}`}>
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Invite links ─────────────────────────────────────────────── */}
        <View className="px-4 mb-2">
          <Text className="text-xs font-semibold text-foreground-muted dark:text-foreground-muted-dark uppercase tracking-wide">
            Invite links
          </Text>
        </View>
        <View className="px-4 mb-4">
          <View className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4 flex-row gap-2 items-center">
            <View className="flex-1">
              <TextInput
                value={inviteExpiry}
                onChangeText={setInviteExpiry}
                placeholder="Days until expiry (0 = none)"
                keyboardType="numeric"
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                className="bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg px-3 py-2.5"
                style={inputStyle}
              />
            </View>
            <Pressable
              onPress={handleCreateInvite}
              disabled={creatingInvite}
              className="bg-indigo-600 rounded-lg px-4 py-2.5 items-center active:opacity-80"
            >
              {creatingInvite ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold text-sm">Generate</Text>
              )}
            </Pressable>
          </View>
        </View>

        {invitesPending ? (
          <ActivityIndicator style={{ marginTop: 8 }} />
        ) : invites.length === 0 ? (
          <Text className="px-4 text-sm text-foreground-muted dark:text-foreground-muted-dark">
            No active invite links
          </Text>
        ) : (
          <View className="px-4 gap-2">
            {invites.map((invite) => (
              <View key={invite.id} className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-mono text-xs text-foreground-muted dark:text-foreground-muted-dark flex-1 mr-2" numberOfLines={1}>
                    {invite.token.slice(0, 16)}…
                  </Text>
                  <View className="flex-row gap-2">
                    {Platform.OS === "web" && (
                      <Pressable onPress={() => handleCopyInvite(invite.token)} className="active:opacity-70 px-2 py-1">
                        <Text className="text-indigo-500 text-xs font-medium">Copy link</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => handleRevokeInvite(invite.id)} className="active:opacity-70 px-2 py-1">
                      <Text className="text-destructive dark:text-destructive-dark text-xs font-medium">Revoke</Text>
                    </Pressable>
                  </View>
                </View>
                <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark">
                  {formatExpiry(invite.expiresAt)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
