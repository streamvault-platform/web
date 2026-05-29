import { useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

type Props = {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  uploading?: boolean;
};

export function FileDropzone({ accept = "audio/*", multiple = true, onFiles, uploading = false }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (Platform.OS !== "web") {
    return (
      <View className="border border-dashed border-border dark:border-border-dark rounded-xl p-8 items-center">
        <Text className="text-foreground-muted dark:text-foreground-muted-dark text-center">
          File uploads are only available on web.
        </Text>
      </View>
    );
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    e.target.value = "";
  }

  const border = dragging
    ? "border-indigo-500"
    : "border-border dark:border-border-dark";

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{ borderWidth: 2, borderStyle: "dashed", borderRadius: 12, padding: 32, cursor: "pointer" }}
      className={`flex flex-col items-center gap-3 ${border} ${dragging ? "bg-indigo-50 dark:bg-indigo-950" : ""}`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <IconSymbol name="arrow.up.circle" size={40} color="#6366f1" />
      <Text className="text-foreground dark:text-foreground-dark font-medium text-center">
        {uploading ? "Uploading…" : "Drop files here or tap to browse"}
      </Text>
      <Text className="text-foreground-muted dark:text-foreground-muted-dark text-xs text-center">
        MP3, FLAC, OGG, AAC/M4A
      </Text>
    </div>
  );
}
