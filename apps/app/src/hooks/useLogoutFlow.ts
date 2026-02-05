import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";

export function useLogoutFlow() {
  const { signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function openLogoutDialog() {
    setShowLogoutDialog(true);
  }

  function cancelLogout() {
    setShowLogoutDialog(false);
  }

  async function confirmLogout() {
    setIsLoggingOut(true);
    await signOut();
  }

  return {
    showLogoutDialog,
    isLoggingOut,
    openLogoutDialog,
    cancelLogout,
    confirmLogout,
  };
}
