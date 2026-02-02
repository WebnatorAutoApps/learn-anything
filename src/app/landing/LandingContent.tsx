"use client";

import HreflangTags from "@/app/components/HreflangTags";
import { useI18n } from "@/lib/i18n";
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
      <Footer />
    </div>
  );
}
