"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import {
  BUSINESS_PHONE,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS,
  BUSINESS_HOURS,
} from "@/seo";

export default function Footer() {
  const { t } = useI18n();
  const nav = t.nav as Record<string, string>;
  const ft = t.footer as Record<string, string>;

  return (
    <footer className="bg-gray-900 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & tagline + contact */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white text-xs font-bold">
                LA
              </span>
              LearnAnything
            </div>
            <p className="mt-2 text-sm text-gray-400 max-w-xs">
              {ft.tagline}
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-400">
              <p>{BUSINESS_ADDRESS.streetAddress}</p>
              <p>
                {BUSINESS_ADDRESS.postalCode} {BUSINESS_ADDRESS.addressLocality}
              </p>
              <p>
                <a
                  href={`tel:${BUSINESS_PHONE}`}
                  className="hover:text-white transition-colors"
                >
                  {BUSINESS_PHONE}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${BUSINESS_EMAIL}`}
                  className="hover:text-white transition-colors"
                >
                  {BUSINESS_EMAIL}
                </a>
              </p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {ft.products}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/productos/mochi"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {ft.mochi}
                </Link>
              </li>
              <li>
                <Link
                  href="/productos/bubble-tea"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {ft.bubbleTea}
                </Link>
              </li>
              <li>
                <Link
                  href="/productos/cafe"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {ft.cafe}
                </Link>
              </li>
              <li>
                <Link
                  href="/productos/anko"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {ft.anko}
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {ft.quickLinks}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/norte-madrid"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {ft.norteMadrid}
                </Link>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {nav.howItWorks}
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {ft.faqLink}
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {nav.testimonials}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal + hours */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {ft.schedule}
            </h3>
            <ul className="space-y-1 text-sm text-gray-400 mb-4">
              {BUSINESS_HOURS.map((hours) => (
                <li key={hours}>{hours}</li>
              ))}
            </ul>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {ft.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {ft.termsConditions}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social placeholders & copyright */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {ft.copyright}
          </p>
          <div className="flex gap-4">
            {/* Twitter / X */}
            <a
              href="#"
              aria-label={ft.twitter}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* GitHub */}
            <a
              href="#"
              aria-label={ft.github}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
