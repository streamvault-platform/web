import { SafeAreaView, Text, View } from "react-native";

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <View className="flex-1 items-center justify-center">
        <Text className="text-foreground-muted dark:text-foreground-muted-dark">
          Search — coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
