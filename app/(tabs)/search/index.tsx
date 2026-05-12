import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-background dark:bg-background-dark">
      <View className="flex-1 items-center justify-center">
        <Text className="text-foreground-muted dark:text-foreground-muted-dark">
          Search — coming soon
        </Text>
      </View>
    </View>
  );
}
