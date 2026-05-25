import { useRef } from "react";
import { PanResponder, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

type Props = {
  volume: number;
  onVolumeChange: (vol: number) => void;
  compact?: boolean;
};

export function VolumeSlider({ volume, onVolumeChange, compact = false }: Props) {
  const containerRef = useRef<View>(null);
  const widthRef = useRef(0);
  const pageXRef = useRef(0);
  const onVolumeChangeRef = useRef(onVolumeChange);
  onVolumeChangeRef.current = onVolumeChange;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        onVolumeChangeRef.current(clampVol(e.nativeEvent.pageX));
      },
      onPanResponderMove: (e) => {
        onVolumeChangeRef.current(clampVol(e.nativeEvent.pageX));
      },
      onPanResponderRelease: (e) => {
        onVolumeChangeRef.current(clampVol(e.nativeEvent.pageX));
      },
    })
  ).current;

  function clampVol(pageX: number): number {
    if (!widthRef.current) return 0;
    return Math.min(Math.max((pageX - pageXRef.current) / widthRef.current, 0), 1);
  }

  const filled = (
    <View
      pointerEvents="none"
      className="h-full bg-indigo-500 rounded-full"
      style={{ width: `${Math.min(volume * 100, 100)}%` }}
    />
  );

  const layoutProps = {
    ref: containerRef,
    ...panResponder.panHandlers,
    onLayout: (e: any) => {
      widthRef.current = e.nativeEvent.layout.width;
      containerRef.current?.measure((_x: number, _y: number, _w: number, _h: number, px: number) => {
        pageXRef.current = px;
      });
    },
  };

  if (compact) {
    return (
      <View
        {...layoutProps}
        className="justify-center"
        style={{ width: 56, height: 20, userSelect: "none" } as any}
      >
        <View className="h-1 bg-border dark:bg-border-dark rounded-full overflow-hidden">
          {filled}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-3 px-8">
      <IconSymbol name="speaker.fill" size={16} color="#71717a" />
      <View
        {...layoutProps}
        className="flex-1 h-2 bg-border dark:bg-border-dark rounded-full"
        style={{ userSelect: "none" } as any}
      >
        {filled}
      </View>
      <IconSymbol name="speaker.wave.3.fill" size={16} color="#71717a" />
    </View>
  );
}
