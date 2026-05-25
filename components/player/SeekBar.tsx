import { useRef, useState } from "react";
import { PanResponder, Text, View } from "react-native";
import { formatDuration } from "@/lib/utils/format";

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
  const isDragging = useRef(false);
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;
  const durationMsRef = useRef(durationMs);
  durationMsRef.current = durationMs;

  const [previewProgress, setPreviewProgress] = useState<number | null>(null);
  const displayProgress = previewProgress ?? progress;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        isDragging.current = true;
        setPreviewProgress(clampRatio(e.nativeEvent.pageX));
      },
      onPanResponderMove: (e) => {
        setPreviewProgress(clampRatio(e.nativeEvent.pageX));
      },
      onPanResponderRelease: (e) => {
        isDragging.current = false;
        const ratio = clampRatio(e.nativeEvent.pageX);
        setPreviewProgress(null);
        if (durationMsRef.current) onSeekRef.current(Math.round(ratio * durationMsRef.current));
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        setPreviewProgress(null);
      },
    })
  ).current;

  function clampRatio(pageX: number): number {
    if (!widthRef.current) return 0;
    return Math.min(Math.max((pageX - pageXRef.current) / widthRef.current, 0), 1);
  }

  const showThumb = thick || isDragging.current;

  return (
    <View
      ref={containerRef}
      {...panResponder.panHandlers}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
        containerRef.current?.measure((_x, _y, _w, _h, px) => {
          pageXRef.current = px;
        });
      }}
      className={`${thick ? "h-2" : "h-1"} bg-border dark:bg-border-dark rounded-full`}
      style={{ userSelect: "none" } as any}
    >
      <View
        pointerEvents="none"
        className="h-full bg-indigo-500 rounded-full"
        style={{ width: `${Math.min(displayProgress * 100, 100)}%` }}
      />
      {showThumb && (
        <View
          pointerEvents="none"
          className="absolute bg-indigo-500 rounded-full w-3 h-3"
          style={{
            left: `${Math.min(displayProgress * 100, 100)}%`,
            top: "50%",
            transform: [{ translateX: -6 }, { translateY: -6 }],
          }}
        />
      )}
      {previewProgress !== null && (
        <View
          pointerEvents="none"
          className="absolute bg-indigo-500 rounded px-1.5 py-0.5"
          style={{
            left: `${Math.min(displayProgress * 100, 100)}%`,
            bottom: "100%",
            marginBottom: 8,
            transform: [{ translateX: -20 }],
          }}
        >
          <Text className="text-white text-xs font-medium" style={{ fontVariant: ["tabular-nums"] }}>
            {formatDuration(displayProgress * durationMs)}
          </Text>
        </View>
      )}
    </View>
  );
}
