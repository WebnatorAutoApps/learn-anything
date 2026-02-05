import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useProfile, useSaveTone } from "@learn-anything/shared";
import type { FeedbackMessage } from "@learn-anything/shared";
import { useI18n } from "../../i18n/I18nProvider";
import { Button, Input } from "../ui";
import { TextArea } from "../ui/Input";

export default function ToneSettings() {
  const { t } = useI18n();
  const s = t.settings as Record<string, string>;
  const { data: profile } = useProfile();
  const saveTone = useSaveTone();
  const [selectedTone, setSelectedTone] = useState(profile?.tone || "");
  const [customTone, setCustomTone] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  const toneLabels: Record<string, { name: string; desc: string }> = {
    upbeat: { name: s.toneUpbeat || "Upbeat & Motivational", desc: s.toneUpbeatDesc || "Energetic and encouraging." },
    professional: { name: s.toneProfessional || "Professional & Direct", desc: s.toneProfessionalDesc || "Clear and concise." },
    calm: { name: s.toneCalm || "Calm & Reassuring", desc: s.toneCalmDesc || "Patient and soothing." },
    casual: { name: s.toneCasual || "Casual & Friendly", desc: s.toneCasualDesc || "Warm and relaxed." },
    "loving-mom": { name: s.toneLovingMom || "Loving Mom", desc: s.toneLovingMomDesc || "Warm and nurturing." },
    "drill-sergeant": { name: s.toneDrillSergeant || "Drill Sergeant", desc: s.toneDrillSergeantDesc || "Tough love." },
    "boring-scholar": { name: s.toneBoringScholar || "Boring Scholar", desc: s.toneBoringScholarDesc || "Dry and academic." },
    pirate: { name: s.tonePirate || "Pirate", desc: s.tonePirateDesc || "Nautical slang." },
  };

  async function handleSave() {
    setMessage(null);
    const tone = isCustom ? customTone : selectedTone;
    try {
      await saveTone.mutateAsync(tone);
      setMessage({ type: "success", text: s.toneSaved || "Tone preference saved." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save." });
    }
  }

  async function handleReset() {
    setMessage(null);
    try {
      await saveTone.mutateAsync("");
      setSelectedTone("");
      setIsCustom(false);
      setMessage({ type: "success", text: s.toneReset || "Tone reset to default." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to reset." });
    }
  }

  return (
    <View>
      <Text className="font-mono text-sm text-theme-muted uppercase tracking-wider mb-1">
        {">"} {s.aiTone || "AI_TONE"}
      </Text>
      <Text className="font-mono text-sm text-theme-muted mb-4">
        {"// "}{s.toneHelp || "Select AI communication style."}
      </Text>

      <View className="gap-2 mb-4">
        {Object.entries(toneLabels).map(([key, label], index) => (
          <Pressable
            key={key}
            onPress={() => {
              setSelectedTone(key);
              setIsCustom(false);
            }}
            className={`border p-3 ${
              !isCustom && selectedTone === key ? "border-theme-primary" : "border-theme-primary/15"
            }`}
          >
            <View className="flex-row items-center gap-2">
              <Text className="font-mono text-sm text-theme-primary">
                [{String(index + 1).padStart(2, "0")}]
              </Text>
              <Text className="font-mono text-base text-theme-secondary">{label.name}</Text>
            </View>
            <Text className="font-mono text-sm text-theme-muted ml-8">
              {"// "}{label.desc}
            </Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => setIsCustom(true)}
          className={`border p-3 ${isCustom ? "border-theme-primary" : "border-theme-primary/15"}`}
        >
          <View className="flex-row items-center gap-2">
            <Text className="font-mono text-sm text-theme-primary">[**]</Text>
            <Text className="font-mono text-base text-theme-secondary">
              {s.toneCustom || "CUSTOM"}
            </Text>
          </View>
          <Text className="font-mono text-sm text-theme-muted ml-8">
            {"// "}{s.toneCustomDesc || "Write your own tone instructions."}
          </Text>
        </Pressable>
      </View>

      {isCustom && (
        <TextArea
          value={customTone}
          onChangeText={setCustomTone}
          placeholder={s.toneCustomPlaceholder || "Describe how you want the AI to communicate..."}
          numberOfLines={4}
          className="mb-3"
          maxLength={500}
        />
      )}

      <View className="flex-row gap-2">
        <Button onPress={handleSave} loading={saveTone.isPending}>
          {(t.common as Record<string, string>)?.save || "SAVE"}
        </Button>
        <Button variant="secondary" onPress={handleReset}>
          {s.resetToDefault || "RESET"}
        </Button>
      </View>

      {message && (
        <Text className={`font-mono text-sm mt-2 ${message.type === "success" ? "text-theme-success" : "text-theme-error"}`}>
          {message.text}
        </Text>
      )}
    </View>
  );
}
