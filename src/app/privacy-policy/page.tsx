import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-gray-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white text-xs font-bold">
              LA
            </span>
            LearnAnything
          </Link>
          <Link
            href="/"
            className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: January 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              1. Introduction
            </h2>
            <p>
              LearnAnything (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
              is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              2. Information We Collect
            </h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Account Information:</strong> Name, email address, and
                password when you create an account.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact
                with our platform, including learning paths accessed, progress, and
                learning activity.
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, IP address,
                and operating system for analytics and security purposes.
              </li>
              <li>
                <strong>API Keys:</strong> If you provide third-party API keys,
                they are encrypted at rest using AES-256-GCM encryption.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your learning experience</li>
              <li>Communicate with you about your account and updates</li>
              <li>Monitor and analyze usage trends</li>
              <li>Protect against unauthorized access and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              4. Data Sharing
            </h2>
            <p>
              We do not sell your personal information. We may share data with
              third-party service providers (such as hosting and analytics
              providers) only as necessary to operate our platform. All
              third-party providers are bound by contractual obligations to
              protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              5. Data Security
            </h2>
            <p>
              We implement industry-standard security measures including
              encryption, secure authentication, and row-level security policies
              to protect your data. However, no method of transmission over the
              Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              6. Your Rights
            </h2>
            <p>
              You have the right to access, update, or delete your personal
              information at any time. You may also request a copy of the data
              we hold about you. To exercise these rights, please contact us at
              the email address below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              7. Cookies
            </h2>
            <p>
              We use essential cookies to maintain your authentication session.
              We do not use third-party tracking cookies for advertising
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              9. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us
              at{" "}
              <a
                href="mailto:privacy@learnanything.com"
                className="text-green-600 hover:text-green-700 underline"
              >
                privacy@learnanything.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
