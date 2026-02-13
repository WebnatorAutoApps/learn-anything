"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.learnanything.com";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();
  const nav = t.nav as Record<string, string>;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: nav.howItWorks, href: "#how-it-works" },
    { label: nav.products, href: "#examples" },
    { label: nav.testimonials, href: "#testimonials" },
    { label: nav.pricing, href: "#pricing" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-2 text-xl font-bold transition-colors duration-300 ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white text-sm font-bold">
              LA
            </span>
            LearnAnything
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-gray-600 hover:text-green-600"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth buttons + Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher scrolled={scrolled} />
            <a
              href={`${APP_URL}/login`}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                scrolled
                  ? "text-gray-700 hover:text-green-600"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {nav.logIn}
            </a>
            <a
              href={`${APP_URL}/signup`}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
            >
              {nav.signUpFree}
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher scrolled={scrolled} />
            <button
              type="button"
              className={`p-2 transition-colors ${
                scrolled ? "text-gray-700" : "text-white"
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={nav.toggleMenu}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4 bg-white rounded-b-lg">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`${APP_URL}/login`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {nav.logIn}
              </a>
              <a
                href={`${APP_URL}/signup`}
                className="rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                {nav.signUpFree}
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
