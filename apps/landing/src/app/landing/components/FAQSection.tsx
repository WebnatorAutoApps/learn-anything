"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import JsonLd from "@/components/JsonLd";
import { useI18n } from "@/i18n/I18nProvider";

const faqKeys = [
  { questionKey: "faq1Q", answerKey: "faq1A" },
  { questionKey: "faq2Q", answerKey: "faq2A" },
  { questionKey: "faq3Q", answerKey: "faq3A" },
  { questionKey: "faq4Q", answerKey: "faq4A" },
  { questionKey: "faq5Q", answerKey: "faq5A" },
  { questionKey: "faq6Q", answerKey: "faq6A" },
  { questionKey: "faq7Q", answerKey: "faq7A" },
  { questionKey: "faq8Q", answerKey: "faq8A" },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-gray-900">{question}</span>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-5">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQSection() {
  const { t } = useI18n();
  const faq = t.faq as Record<string, string>;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = faqKeys.map((item) => ({
    question: faq[item.questionKey],
    answer: faq[item.answerKey],
  }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section id="faq" className="bg-gray-50 py-20 sm:py-28">
      <JsonLd data={faqSchema} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {faq.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {faq.description}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12">
          {faqs.map((item, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <FAQItem
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === i}
                onToggle={() =>
                  setOpenIndex(openIndex === i ? null : i)
                }
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
