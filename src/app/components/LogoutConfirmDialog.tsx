"use client";

import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { useI18n } from "@/lib/i18n";

interface LogoutConfirmDialogProps {
  isLoggingOut: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmDialog({
  isLoggingOut,
  onConfirm,
  onCancel,
}: LogoutConfirmDialogProps) {
  const { t } = useI18n();
  const dl = t.dialogs as Record<string, string>;
  const c = t.common as Record<string, string>;

  return (
    <Modal onClose={onCancel} title={dl.confirmLogout || "Confirm Logout"}>
      <p className="text-theme-muted mb-6">
        {dl.logoutMessage || "Are you sure you want to log out?"}
      </p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onCancel}>
          {c.cancel || "Cancel"}
        </Button>
        <Button onClick={onConfirm} disabled={isLoggingOut}>
          {isLoggingOut ? (dl.loggingOut || "Logging out...") : ((t.header as Record<string, string>).logout || "Logout")}
        </Button>
      </div>
    </Modal>
  );
}
