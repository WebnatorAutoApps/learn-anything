"use client";

import ScrollReveal from "@/components/ScrollReveal";
import { useI18n } from "@/i18n/I18nProvider";

const testimonialsMeta = [
  { nameKey: "t1Name", skillKey: "t1Skill", quoteKey: "t1Quote", avatar: "AR" },
  { nameKey: "t2Name", skillKey: "t2Skill", quoteKey: "t2Quote", avatar: "PM" },
  { nameKey: "t3Name", skillKey: "t3Skill", quoteKey: "t3Quote", avatar: "JK" },
  { nameKey: "t4Name", skillKey: "t4Skill", quoteKey: "t4Quote", avatar: "ST" },
  { nameKey: "t5Name", skillKey: "t5Skill", quoteKey: "t5Quote", avatar: "SL" },
];

export default function TestimonialsSection() {
  const { t } = useI18n();
  const tm = t.testimonials as Record<string, string>;

  return (
    <section id="testimonials" className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {tm.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {tm.description}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonialsMeta.map((item, i) => (
            <ScrollReveal key={i} delay={i * 120}>
              <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 h-full">
                {/* Stars */}
                <div className="flex gap-0.5 text-yellow-400 mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg
                      key={idx}
                      className="h-4 w-4 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="flex-1 text-gray-600 text-sm leading-relaxed italic">
                  &quot;{tm[item.quoteKey]}&quot;
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {tm[item.nameKey]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tm.learned} {tm[item.skillKey]}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
