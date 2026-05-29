import { Text, TextInput, View } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";

type FormValues = {
  title?: string;
  genre?: string;
  year?: string;
  trackNumber?: string;
};

type Props = {
  values: FormValues;
  onChange: (values: FormValues) => void;
  showTrackFields?: boolean;
};

export function MetadataForm({ values, onChange, showTrackFields = true }: Props) {
  const isDark = useColorScheme() === "dark";
  const inputStyle = {
    color: isDark ? "#fafafa" : "#09090b",
    backgroundColor: isDark ? "#18181b" : "#ffffff",
  };

  return (
    <View className="gap-3">
      <Field label="Title">
        <TextInput
          value={values.title ?? ""}
          onChangeText={(v) => onChange({ ...values, title: v })}
          placeholder="Track title"
          placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
          className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg px-3 py-2.5 text-foreground dark:text-foreground-dark"
          style={inputStyle}
        />
      </Field>

      {showTrackFields && (
        <>
          <Field label="Genre">
            <TextInput
              value={values.genre ?? ""}
              onChangeText={(v) => onChange({ ...values, genre: v })}
              placeholder="e.g. Rock"
              placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
              className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg px-3 py-2.5 text-foreground dark:text-foreground-dark"
              style={inputStyle}
            />
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Year">
                <TextInput
                  value={values.year ?? ""}
                  onChangeText={(v) => onChange({ ...values, year: v })}
                  placeholder="2024"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                  className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg px-3 py-2.5 text-foreground dark:text-foreground-dark"
                  style={inputStyle}
                />
              </Field>
            </View>
            <View className="flex-1">
              <Field label="Track #">
                <TextInput
                  value={values.trackNumber ?? ""}
                  onChangeText={(v) => onChange({ ...values, trackNumber: v })}
                  placeholder="1"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                  className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg px-3 py-2.5 text-foreground dark:text-foreground-dark"
                  style={inputStyle}
                />
              </Field>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-xs font-medium text-foreground-muted dark:text-foreground-muted-dark mb-1 uppercase tracking-wide">
        {label}
      </Text>
      {children}
    </View>
  );
}
