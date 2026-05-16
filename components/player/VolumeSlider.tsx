import { useRef } from "react";
import { Pressable, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

type Props = {
  volume: number;
  onVolumeChange: (vol: number) => void;
};

export function VolumeSlider({ volume, onVolumeChange }: Props) {
  const containerRef = useRef<View>(null);
  const widthRef = useRef(0);
  const pageXRef = useRef(0);

  return (
    <View className="flex-row items-center gap-3 px-8">
      <IconSymbol name="speaker.fill" size={16} color="#71717a" />
      <View style={{ flex: 1 }}>
        <View
          ref={containerRef}
          onLayout={(e) => {
            widthRef.current = e.nativeEvent.layout.width;
            containerRef.current?.measure((_x, _y, _w, _h, px) => {
              pageXRef.current = px;
            });
          }}
          className="h-2 bg-border dark:bg-border-dark rounded-full overflow-hidden"
        >
          <View
            pointerEvents="none"
            className="h-full bg-indigo-500"
            style={{ width: `${Math.min(volume * 100, 100)}%` }}
          />
          <Pressable
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={(e) => {
              if (!widthRef.current) return;
              const relX = e.nativeEvent.pageX - pageXRef.current;
              const vol = Math.max(0, Math.min(1, relX / widthRef.current));
              onVolumeChange(vol);
            }}
          />
        </View>
      </View>
      <IconSymbol name="speaker.wave.3.fill" size={16} color="#71717a" />
    </View>
  );
}
