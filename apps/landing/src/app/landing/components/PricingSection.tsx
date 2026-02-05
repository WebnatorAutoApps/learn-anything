"use client";

import ScrollReveal from "@/components/ScrollReveal";
import { useI18n } from "@/i18n/I18nProvider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.learnanything.com";

export default function PricingSection() {
  const { t } = useI18n();
  const pr = t.pricing as Record<string, string>;

  const features = [pr.feature1, pr.feature2, pr.feature3, pr.feature4, pr.feature5];

  return (
    <section id="pricing" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {pr.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {pr.description}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="scale" delay={150}>
          <div className="mt-12 rounded-3xl border-2 border-green-200 bg-gradient-to-b from-green-50 to-white p-8 sm:p-12 text-center shadow-sm">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
              {pr.freePlan}
            </span>
            <div className="mt-6">
              <span className="text-6xl font-extrabold text-gray-900">{pr.price}</span>
              <span className="ml-2 text-xl text-gray-500">{pr.forever}</span>
            </div>
            <ul className="mt-8 space-y-3 text-left max-w-sm mx-auto">
              {features.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href={`${APP_URL}/signup`}
              className="mt-10 inline-block rounded-xl bg-green-600 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-600/25 hover:bg-green-700 transition-colors"
            >
              {pr.signUp}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
