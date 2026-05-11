import { useRef } from "react";
import { Pressable, View } from "react-native";

type Props = {
  progress: number;
  durationMs: number;
  onSeek: (ms: number) => void;
  thick?: boolean;
};

export function SeekBar({ progress, durationMs, onSeek, thick = false }: Props) {
  const containerRef = useRef<View>(null);
  const widthRef = useRef(0);
  const pageXRef = useRef(0);

  return (
    <View
      ref={containerRef}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
        containerRef.current?.measure((_x, _y, _w, _h, px) => {
          pageXRef.current = px;
        });
      }}
      className={`${thick ? "h-2" : "h-1"} bg-border dark:bg-border-dark rounded-full overflow-hidden`}
    >
      <View
        pointerEvents="none"
        className="h-full bg-indigo-500"
        style={{ width: `${Math.min(progress * 100, 100)}%` }}
      />
      <Pressable
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={(e) => {
          if (!widthRef.current || !durationMs) return;
          const relX = e.nativeEvent.pageX - pageXRef.current;
          const ms = Math.round((relX / widthRef.current) * durationMs);
          if (isFinite(ms) && ms >= 0 && ms <= durationMs) onSeek(ms);
        }}
      />
    </View>
  );
}
