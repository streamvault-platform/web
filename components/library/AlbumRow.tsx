import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";

import { CoverImage } from "@/components/library/CoverImage";
import type { Album } from "@/lib/api/library";

type Props = {
  album: Album;
  onPress: () => void;
};

export function AlbumRow({ album, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 gap-3 active:opacity-60"
    >
      <CoverImage coverUrl={album.coverUrl} size={44} />
      <View className="flex-1">
        <Text
          className="text-base text-foreground dark:text-foreground-dark"
          numberOfLines={1}
        >
          {album.title}
        </Text>
        {album.year != null && (
          <Text className="text-sm text-foreground-muted dark:text-foreground-muted-dark mt-0.5">
            {album.year}
          </Text>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#71717a" />
    </Pressable>
  );
}
