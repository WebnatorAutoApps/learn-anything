"use client";

import Link from "next/link";
import ScrollReveal from "@/app/components/ScrollReveal";
import { useI18n } from "@/lib/i18n";

interface CTABannerProps {
  headline: string;
  subtext: string;
  id?: string;
}

export default function CTABanner({ headline, subtext, id }: CTABannerProps) {
  const { t } = useI18n();
  const cta = t.cta as Record<string, string>;

  return (
    <section id={id} className="bg-green-600 py-16 sm:py-20">
      <ScrollReveal>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {headline}
          </h2>
          <p className="mt-4 text-green-100 text-lg">{subtext}</p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-green-700 shadow-lg hover:bg-green-50 transition-colors"
          >
            {cta.getStarted}
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
