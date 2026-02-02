import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJSON } from "./fetch";

export function useLogoutFlow() {
  const router = useRouter();
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
    try {
      await fetchJSON("/api/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  }

  return {
    showLogoutDialog,
    isLoggingOut,
    openLogoutDialog,
    cancelLogout,
    confirmLogout,
  };
}
