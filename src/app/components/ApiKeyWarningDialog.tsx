"use client";

import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { useI18n } from "@/lib/i18n";

interface ApiKeyWarningDialogProps {
  onGoToSettings: () => void;
  onCancel: () => void;
}

export default function ApiKeyWarningDialog({
  onGoToSettings,
  onCancel,
}: ApiKeyWarningDialogProps) {
  const { t } = useI18n();
  const dl = t.dialogs as Record<string, string>;
  const c = t.common as Record<string, string>;

  return (
    <Modal onClose={onCancel} title={dl.apiKeyRequired || "API Key Required"}>
      <p className="text-theme-muted mb-6">
        {dl.apiKeyWarning || "You don't have an API key configured. We won't be able to create a learning path for you. Please go to Settings to add one."}
      </p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onCancel}>
          {c.cancel || "Cancel"}
        </Button>
        <Button onClick={onGoToSettings}>
          {dl.goToSettings || "Go to Settings"}
        </Button>
      </div>
    </Modal>
  );
}
