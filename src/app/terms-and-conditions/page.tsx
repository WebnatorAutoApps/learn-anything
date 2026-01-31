import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/landing"
            className="flex items-center gap-2 text-lg font-bold text-gray-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white text-xs font-bold">
              LA
            </span>
            LearnAnything
          </Link>
          <Link
            href="/landing"
            className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
          Terms and Conditions
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: January 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using LearnAnything (&quot;the Service&quot;), you
              agree to be bound by these Terms and Conditions. If you do not
              agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              2. Description of Service
            </h2>
            <p>
              LearnAnything is a free, AI-powered learning platform that
              provides personalized, project-based learning paths across a wide range
              of skills and topics. The Service generates learning content
              using artificial intelligence and is provided &quot;as is.&quot;
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              3. User Accounts
            </h2>
            <p>
              To access certain features, you must create an account. You are
              responsible for maintaining the confidentiality of your account
              credentials and for all activities that occur under your account.
              You agree to provide accurate and complete information when
              creating your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              4. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Use the Service for any unlawful purpose or in violation of any
                applicable laws
              </li>
              <li>
                Attempt to gain unauthorized access to the Service or its
                related systems
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                Service
              </li>
              <li>
                Upload or transmit viruses, malware, or any other harmful code
              </li>
              <li>
                Scrape, crawl, or otherwise extract data from the Service
                without permission
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              5. Intellectual Property
            </h2>
            <p>
              The Service and its original content (excluding user-generated
              content) are the property of LearnAnything and are protected by
              copyright, trademark, and other intellectual property laws.
              AI-generated learning path content is provided for personal educational
              use only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              6. User Content
            </h2>
            <p>
              You retain ownership of any content you submit or create through
              the Service. By using the Service, you grant us a non-exclusive,
              royalty-free license to use, store, and process your content
              solely for the purpose of providing and improving the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              7. API Keys
            </h2>
            <p>
              If you provide third-party API keys (such as Gemini API keys),
              you are solely responsible for their use and any associated
              costs. We encrypt API keys at rest but are not liable for any
              charges incurred through their use on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              8. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, either express or
              implied. We do not warrant that the Service will be
              uninterrupted, error-free, or that AI-generated content will be
              accurate or complete. Learning outcomes depend on individual
              effort and are not guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              9. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, LearnAnything shall not
              be liable for any indirect, incidental, special, consequential,
              or punitive damages arising out of or related to your use of the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              10. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account at any
              time for violation of these Terms. You may delete your account at
              any time. Upon termination, your right to use the Service will
              immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              11. Changes to These Terms
            </h2>
            <p>
              We may modify these Terms at any time. We will provide notice of
              material changes by posting the updated Terms on this page. Your
              continued use of the Service after changes constitutes acceptance
              of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              12. Contact Us
            </h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@learnanything.com"
                className="text-green-600 hover:text-green-700 underline"
              >
                legal@learnanything.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
