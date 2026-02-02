"use client";

import ScrollReveal from "@/app/components/ScrollReveal";
import { useI18n } from "@/lib/i18n";

const examplesMeta = [
  { emoji: "\uD83E\uDD16", color: "bg-blue-50 border-blue-100", iconColor: "text-blue-600", titleKey: "aiTitle", descKey: "aiDesc" },
  { emoji: "\uD83C\uDFB8", color: "bg-purple-50 border-purple-100", iconColor: "text-purple-600", titleKey: "musicTitle", descKey: "musicDesc" },
  { emoji: "\uD83D\uDE80", color: "bg-indigo-50 border-indigo-100", iconColor: "text-indigo-600", titleKey: "astroTitle", descKey: "astroDesc" },
  { emoji: "\uD83C\uDF7C", color: "bg-orange-50 border-orange-100", iconColor: "text-orange-600", titleKey: "fermentTitle", descKey: "fermentDesc" },
  { emoji: "\uD83C\uDFAD", color: "bg-pink-50 border-pink-100", iconColor: "text-pink-600", titleKey: "screenTitle", descKey: "screenDesc" },
  { emoji: "\uD83E\uDDE0", color: "bg-amber-50 border-amber-100", iconColor: "text-amber-700", titleKey: "dreamTitle", descKey: "dreamDesc" },
];

export default function ExamplesSection() {
  const { t } = useI18n();
  const ex = t.examples as Record<string, string>;

  return (
    <section id="examples" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {ex.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {ex.description}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {examplesMeta.map((item, i) => (
            <ScrollReveal key={i} variant="scale" delay={i * 100}>
              <div
                className={`rounded-2xl border p-8 ${item.color} hover:shadow-lg transition-all duration-300 group`}
              >
                <span className="text-4xl">{item.emoji}</span>
                <h3 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  {ex[item.titleKey]}
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {ex[item.descKey]}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
