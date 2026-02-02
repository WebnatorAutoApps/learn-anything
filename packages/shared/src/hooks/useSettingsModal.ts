import { useState } from "react";

export type SettingsTab = "general" | "api-keys" | "customization";

export function useSettingsModal() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>("general");
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);

  function openSettings(tab: SettingsTab = "general") {
    setSettingsInitialTab(tab);
    setShowSettingsModal(true);
  }

  function closeSettings() {
    setShowSettingsModal(false);
  }

  function openApiKeyWarning() {
    setShowApiKeyWarning(true);
  }

  function closeApiKeyWarning() {
    setShowApiKeyWarning(false);
  }

  function handleApiKeyWarningGoToSettings() {
    setShowApiKeyWarning(false);
    openSettings("api-keys");
  }

  return {
    showSettingsModal,
    settingsInitialTab,
    showApiKeyWarning,
    openSettings,
    closeSettings,
    openApiKeyWarning,
    closeApiKeyWarning,
    handleApiKeyWarningGoToSettings,
  };
}
