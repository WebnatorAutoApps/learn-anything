"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        avatarRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAvatarClick() {
    setIsMenuOpen(!isMenuOpen);
  }

  function handleAvatarMouseEnter() {
    setIsMenuOpen(true);
  }

  function handleMenuMouseLeave() {
    setIsMenuOpen(false);
  }

  function handleLogoutClick() {
    setIsMenuOpen(false);
    setShowLogoutDialog(true);
  }

  async function handleConfirmLogout() {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch {
      // If logout fails, just redirect anyway
      router.push("/login");
    }
  }

  function handleCancelLogout() {
    setShowLogoutDialog(false);
  }

  return (
    <div className="terminal-screen min-h-screen font-mono">
      {/* CRT vignette overlay */}
      <div className="terminal-vignette" />

      {/* Top Bar */}
      <header className="relative z-10 border-b border-green-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-green-400 tracking-wider">
              Learn Anything
            </h1>
            <div className="relative flex items-center">
              <div
                ref={avatarRef}
                onClick={handleAvatarClick}
                onMouseEnter={handleAvatarMouseEnter}
                className="h-10 w-10 rounded-full border-2 border-green-500 flex items-center justify-center text-green-400 font-semibold cursor-pointer hover:border-green-400 hover:bg-green-950/50 transition-colors"
              >
                U
              </div>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div
                  ref={menuRef}
                  onMouseLeave={handleMenuMouseLeave}
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-green-900/60 bg-green-950/95 shadow-lg shadow-green-900/20 overflow-hidden"
                >
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-4 py-3 text-left text-green-400 hover:bg-green-900/50 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-green-400 mb-2 tracking-wide">
            <span className="text-green-600">{">"}</span> What do you want to
            learn today?
            <span className="inline-block w-2.5 h-5 bg-green-400 ml-1 animate-pulse align-middle" />
          </h2>
          <p className="text-green-600">
            Choose a topic to continue your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Python Button */}
          <button className="group relative overflow-hidden rounded-lg border border-green-900/60 bg-green-950/20 p-6 text-left transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] hover:border-green-500/70 hover:bg-green-950/40">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-green-800/50 bg-green-950/50">
                <span className="text-2xl">🐍</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400">
                  Python
                </h3>
                <p className="text-sm text-green-700">
                  Programming Language
                </p>
              </div>
            </div>
          </button>

          {/* AI Button */}
          <button className="group relative overflow-hidden rounded-lg border border-green-900/60 bg-green-950/20 p-6 text-left transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] hover:border-green-500/70 hover:bg-green-950/40">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-green-800/50 bg-green-950/50">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400">
                  AI
                </h3>
                <p className="text-sm text-green-700">
                  Artificial Intelligence
                </p>
              </div>
            </div>
          </button>

          {/* Add New Button */}
          <button className="group relative overflow-hidden rounded-lg border-2 border-dashed border-green-900/50 bg-green-950/10 p-6 text-left transition-all hover:border-green-600/50 hover:bg-green-950/30">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-green-800/50 bg-green-950/50">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400">
                  Learn Something New
                </h3>
                <p className="text-sm text-green-700">
                  Add a new topic
                </p>
              </div>
            </div>
          </button>
        </div>
      </main>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={handleCancelLogout}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md mx-4 rounded-lg border border-green-900/60 bg-green-950/95 p-6 shadow-lg shadow-green-900/30">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Confirm Logout
            </h3>
            <p className="text-green-600 mb-6">
              Are you sure you want to log out?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
