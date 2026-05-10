import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text } from "react-native";

import type { Artist } from "@/lib/api/library";

type Props = {
  artist: Artist;
  onPress: () => void;
};

export function ArtistRow({ artist, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 active:opacity-60"
    >
      <Text
        className="flex-1 text-base text-foreground dark:text-foreground-dark"
        numberOfLines={1}
      >
        {artist.name}
      </Text>
      <MaterialIcons name="chevron-right" size={20} color="#71717a" />
    </Pressable>
  );
}
