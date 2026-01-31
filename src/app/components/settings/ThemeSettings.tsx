"use client";

import { useState } from "react";
import { useSaveTheme, type ThemeKey } from "@/lib/hooks/queries";
import { useTheme } from "@/lib/theme/context";

interface ThemeOption {
  key: ThemeKey;
  name: string;
  description: string;
  colors: {
    bg: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

const THEMES: ThemeOption[] = [
  {
    key: "terminal",
    name: "Terminal",
    description: "Dark, monospace, hacker aesthetic",
    colors: {
      bg: "#0a0f0a",
      surface: "#0d1a0d",
      primary: "#4ade80",
      secondary: "#16a34a",
      accent: "#166534",
    },
  },
  {
    key: "space",
    name: "Space",
    description: "Deep-space palette, cosmic vibes",
    colors: {
      bg: "#0b0d1a",
      surface: "#0f0f28",
      primary: "#a78bfa",
      secondary: "#7c3aed",
      accent: "#4c1d95",
    },
  },
  {
    key: "school",
    name: "School",
    description: "Notebook textures, chalkboard colors",
    colors: {
      bg: "#1c1a17",
      surface: "#231e19",
      primary: "#f59e0b",
      secondary: "#b45309",
      accent: "#78350f",
    },
  },
  {
    key: "gym",
    name: "Gym",
    description: "Bold, energetic, sporty accents",
    colors: {
      bg: "#0f0a0b",
      surface: "#1e0c0f",
      primary: "#f43f5e",
      secondary: "#be123c",
      accent: "#881337",
    },
  },
  {
    key: "90s-internet",
    name: "90s Internet",
    description: "Retro web, bright colors, pixel vibes",
    colors: {
      bg: "#0c0a1a",
      surface: "#0f0c23",
      primary: "#06b6d4",
      secondary: "#0e7490",
      accent: "#164e63",
    },
  },
];

export default function ThemeSettings() {
  const { theme: activeTheme, setTheme } = useTheme();
  const saveThemeMutation = useSaveTheme();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSelectTheme(themeKey: ThemeKey) {
    if (themeKey === activeTheme) return;

    // Apply immediately for instant feedback
    setTheme(themeKey);
    setMessage(null);

    try {
      await saveThemeMutation.mutateAsync(themeKey);
      setMessage({ type: "success", text: "Theme saved." });
    } catch (err) {
      // Revert on failure
      setTheme(activeTheme);
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to save theme.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-theme-primary">Themes</h4>
        <p className="text-xs text-theme-muted">
          Choose a visual theme for the app. Changes apply immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEMES.map((t) => {
          const isActive = t.key === activeTheme;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => handleSelectTheme(t.key)}
              disabled={saveThemeMutation.isPending}
              className={`relative text-left rounded-lg border-2 p-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${
                isActive
                  ? "border-theme-primary shadow-[0_0_12px_var(--t-glow)]"
                  : "border-theme-border hover:border-theme-primary-dim"
              }`}
              style={{ background: t.colors.bg }}
              aria-pressed={isActive}
              aria-label={`${t.name} theme${isActive ? " (selected)" : ""}`}
            >
              {/* Color swatch row */}
              <div className="flex gap-1.5 mb-3">
                {Object.values(t.colors).map((color, i) => (
                  <div
                    key={i}
                    className="h-6 flex-1 rounded-sm"
                    style={{ background: color }}
                  />
                ))}
              </div>

              {/* Theme name + description */}
              <div>
                <span
                  className="text-sm font-semibold block"
                  style={{ color: t.colors.primary }}
                >
                  {t.name}
                </span>
                <span
                  className="text-xs block mt-0.5"
                  style={{ color: t.colors.secondary }}
                >
                  {t.description}
                </span>
              </div>

              {/* Selected indicator */}
              {isActive && (
                <div
                  className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
                  style={{ background: t.colors.primary }}
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke={t.colors.bg}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Status message */}
      {message && (
        <p
          className={`text-sm ${
            message.type === "success"
              ? "text-theme-primary"
              : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
