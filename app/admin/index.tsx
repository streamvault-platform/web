import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCreateUser, useDeleteUser, useUpdateRole, useUsers } from "@/lib/hooks/admin";
import type { AdminUser, UserRole } from "@/lib/api/admin";

const ROLES: UserRole[] = ["USER", "ARTIST", "ADMIN"];

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const { data: users = [], isPending } = useUsers();
  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { mutate: updateRole } = useUpdateRole();
  const { mutate: deleteUser } = useDeleteUser();

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("USER");

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

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-background dark:bg-background-dark">
      <View className="px-4 pt-6 pb-4">
        <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">
          User Management
        </Text>
      </View>

      {/* Create user form */}
      <View className="px-4 mb-6">
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

      {/* User list */}
      <View className="px-4 mb-2">
        <Text className="text-xs font-semibold text-foreground-muted dark:text-foreground-muted-dark uppercase tracking-wide">
          Users ({users.length})
        </Text>
      </View>
      {isPending ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4">
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
          )}
        />
      )}
    </View>
  );
}
