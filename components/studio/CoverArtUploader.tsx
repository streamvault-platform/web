import { useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import { CoverImage } from "@/components/library/CoverImage";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useUploadCoverArt } from "@/lib/hooks/studio";

type Props = {
  albumId: string;
  currentCoverUrl: string | null;
};

export function CoverArtUploader({ albumId, currentCoverUrl }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { mutate: upload, isPending } = useUploadCoverArt();

  if (Platform.OS !== "web") {
    return (
      <View className="items-center">
        <CoverImage coverUrl={currentCoverUrl} size={80} />
        <Text className="text-foreground-muted dark:text-foreground-muted-dark text-xs mt-2">
          Cover upload is web-only
        </Text>
      </View>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    upload({ albumId, file }, {
      onSuccess: () => setPreview(null),
    });
    e.target.value = "";
  }

  return (
    <View className="items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      <Pressable
        onPress={() => inputRef.current?.click()}
        className="active:opacity-70"
        disabled={isPending}
      >
        {isPending ? (
          <View style={{ width: 80, height: 80, borderRadius: 8 }}
            className="bg-surface dark:bg-surface-dark items-center justify-center border border-border dark:border-border-dark">
            <ActivityIndicator size="small" />
          </View>
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover" }} alt="" />
        ) : (
          <View style={{ width: 80, height: 80 }}>
            <CoverImage coverUrl={currentCoverUrl} size={80} />
          </View>
        )}
      </Pressable>

      <Pressable onPress={() => inputRef.current?.click()} disabled={isPending} className="active:opacity-70">
        <Text className="text-indigo-500 text-xs font-medium">
          {isPending ? "Uploading…" : currentCoverUrl ? "Change cover" : "Add cover art"}
        </Text>
      </Pressable>
    </View>
  );
}
