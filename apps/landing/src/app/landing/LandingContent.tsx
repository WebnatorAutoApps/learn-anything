"use client";

import HreflangTags from "@/components/HreflangTags";
import { useI18n } from "@/i18n/I18nProvider";
import {
  Navbar,
  HeroSection,
  HowItWorksSection,
  ValuePropositionSection,
  CTABanner,
  ExamplesSection,
  TestimonialsSection,
  PricingSection,
  Footer,
} from "./components";

export default function LandingContent() {
  const { t } = useI18n();
  const cta = t.cta as Record<string, string>;

  return (
    <div className="min-h-screen bg-white">
      <HreflangTags />
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <ValuePropositionSection />
        <CTABanner
          headline={cta.headline1}
          subtext={cta.subtext1}
        />
        <ExamplesSection />
        <TestimonialsSection />
        <CTABanner
          id="cta-final"
          headline={cta.headline2}
          subtext={cta.subtext2}
        />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
