"use client";

import { useState } from "react";
import { useSaveTone, type Profile } from "@/lib/hooks/queries";
import { DEFAULT_TONE } from "@/lib/llm";

interface ToneSettingsProps {
  profile: Profile;
}

const TONE_PRESETS = [
  {
    label: "Upbeat & Motivational",
    value:
      "You are fun, supportive, motivational, and upbeat. Encourage the user and keep the energy high.",
  },
  {
    label: "Professional & Direct",
    value:
      "You are professional, concise, and direct. Focus on clarity and efficiency without unnecessary filler.",
  },
  {
    label: "Calm & Reassuring",
    value:
      "You are calm, patient, and reassuring. Help the user feel at ease and confident in their learning journey.",
  },
  {
    label: "Casual & Friendly",
    value:
      "You are casual, warm, and friendly. Talk like a knowledgeable friend who genuinely wants to help.",
  },
] as const;

const MAX_TONE_LENGTH = 500;

export default function ToneSettings({ profile }: ToneSettingsProps) {
  const currentTone = profile.tone || DEFAULT_TONE;

  const matchingPreset = TONE_PRESETS.find((p) => p.value === currentTone);
  const isCustom = !matchingPreset && currentTone !== DEFAULT_TONE;

  const [selectedPreset, setSelectedPreset] = useState<string | "custom">(
    isCustom ? "custom" : (matchingPreset?.label ?? TONE_PRESETS[0].label)
  );
  const [customTone, setCustomTone] = useState(isCustom ? currentTone : "");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const saveToneMutation = useSaveTone();

  function getEffectiveTone(): string {
    if (selectedPreset === "custom") {
      return customTone.trim();
    }
    const preset = TONE_PRESETS.find((p) => p.label === selectedPreset);
    return preset?.value ?? "";
  }

  function hasChanges(): boolean {
    const effective = getEffectiveTone();
    if (!effective) return false;
    return effective !== currentTone;
  }

  async function handleSave() {
    const effective = getEffectiveTone();

    if (selectedPreset === "custom" && !effective) {
      setMessage({ type: "error", text: "Custom tone cannot be empty." });
      return;
    }

    if (effective.length > MAX_TONE_LENGTH) {
      setMessage({
        type: "error",
        text: `Tone must be ${MAX_TONE_LENGTH} characters or less.`,
      });
      return;
    }

    setMessage(null);

    try {
      await saveToneMutation.mutateAsync(effective);
      setMessage({ type: "success", text: "Tone preference saved." });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to save tone preference.",
      });
    }
  }

  async function handleReset() {
    setMessage(null);

    try {
      // Sending empty string clears the tone (server sets to null, app uses default)
      await saveToneMutation.mutateAsync("");
      setSelectedPreset(TONE_PRESETS[0].label);
      setCustomTone("");
      setMessage({ type: "success", text: "Tone reset to default." });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to reset tone preference.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-green-400">AI Tone</h4>
        <p className="text-xs text-green-700">
          Choose how the AI communicates with you when building learning plans.
          This takes effect on your next interaction.
        </p>
      </div>

      {/* Preset options */}
      <div className="space-y-2">
        {TONE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setSelectedPreset(preset.label)}
            className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
              selectedPreset === preset.label
                ? "border-green-500 bg-green-900/30 text-green-300"
                : "border-green-900/40 bg-green-950/40 text-green-600 hover:border-green-700 hover:text-green-400"
            }`}
          >
            <span className="text-sm font-medium">{preset.label}</span>
            <p className="text-xs mt-1 opacity-70">{preset.value}</p>
          </button>
        ))}

        {/* Custom option */}
        <button
          type="button"
          onClick={() => setSelectedPreset("custom")}
          className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
            selectedPreset === "custom"
              ? "border-green-500 bg-green-900/30 text-green-300"
              : "border-green-900/40 bg-green-950/40 text-green-600 hover:border-green-700 hover:text-green-400"
          }`}
        >
          <span className="text-sm font-medium">Custom</span>
          <p className="text-xs mt-1 opacity-70">
            Write your own tone instructions for the AI.
          </p>
        </button>
      </div>

      {/* Custom tone textarea */}
      {selectedPreset === "custom" && (
        <div className="space-y-2">
          <textarea
            value={customTone}
            onChange={(e) => setCustomTone(e.target.value)}
            placeholder="Describe how you want the AI to communicate with you..."
            maxLength={MAX_TONE_LENGTH}
            rows={3}
            className="w-full rounded-lg border border-green-900/60 bg-green-950/40 px-3 py-2 text-green-300 placeholder-green-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors text-sm resize-none"
          />
          <p className="text-xs text-green-700 text-right">
            {customTone.length}/{MAX_TONE_LENGTH}
          </p>
        </div>
      )}

      {/* Status message */}
      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={saveToneMutation.isPending}
          className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {saveToneMutation.isPending ? "Resetting..." : "Reset to Default"}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={
            !hasChanges() ||
            saveToneMutation.isPending ||
            (selectedPreset === "custom" && !customTone.trim())
          }
          className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {saveToneMutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
