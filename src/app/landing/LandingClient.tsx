"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import ScrollReveal from "@/app/components/ScrollReveal";

/* Hydration-safe mounted check without setState-in-effect */
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/* ───────────────────── Navbar ───────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Examples", href: "#examples" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/landing"
            className="flex items-center gap-2 text-xl font-bold text-gray-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white text-sm font-bold">
              LA
            </span>
            LearnAnything
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4 bg-white rounded-b-lg">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/login"
                className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ───────────────────── Hero Section ───────────────────── */

function HeroSection() {
  const mounted = useMounted();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-green-200/40 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-green-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div
          className={`transition-all duration-700 ${
            mounted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 mb-6">
            100% Free — Forever
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Unlock Your{" "}
            <span className="text-green-600">True Potential</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-gray-600 leading-relaxed">
            Stop watching. Start doing. LearnAnything guides you through
            hands-on projects so you master real skills — from music to
            programming, cooking to woodworking.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto rounded-xl bg-green-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-600/25 hover:bg-green-700 hover:shadow-green-700/25 transition-all"
            >
              Start Learning for Free
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 hover:border-green-300 hover:text-green-600 transition-all"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className={`mt-16 grid grid-cols-3 gap-6 sm:gap-8 transition-all duration-700 delay-300 ${
            mounted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          {[
            { number: "1,000+", label: "Skills Available" },
            { number: "100%", label: "Hands-On Learning" },
            { number: "$0", label: "Always Free" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {stat.number}
              </div>
              <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── How It Works ───────────────────── */

const steps = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: "Pick a Skill",
    description:
      "Choose from hundreds of skills — programming, cooking, music, woodworking, and more.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: "Follow Hands-On Lessons",
    description:
      "Learn by doing with guided, project-based lessons tailored to your level.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.073A1.5 1.5 0 005 13.5v5.25a1.5 1.5 0 001.036 1.427l5.384 1.795a1.5 1.5 0 00.928 0l5.384-1.795A1.5 1.5 0 0019 18.75V13.5a1.5 1.5 0 00-1.036-1.403L12.58 9.024a1.5 1.5 0 00-.928 0L6.268 10.82" />
      </svg>
    ),
    title: "Build Real Projects",
    description:
      "Apply what you learn by building tangible projects you can be proud of.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: "Master It",
    description:
      "Track your progress, earn completion milestones, and truly master new skills.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Four simple steps to go from curious beginner to confident
              practitioner.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 120}>
              <div className="relative text-center group">
                {/* Step number */}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  {step.icon}
                </div>
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Value Proposition ───────────────────── */

const values = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Learning by Doing Works",
    description:
      "Research shows hands-on practice is the most effective way to retain knowledge. We built every lesson around this principle.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    title: "Unlock Your True Potential",
    description:
      "Everyone has untapped abilities. Our personalized learning paths adapt to your pace and help you achieve what you never thought possible.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: "Learn Anything You Imagine",
    description:
      "From coding to cooking, music to mechanics — if you can dream it, you can learn it. Our AI-powered platform creates custom learning paths for any topic.",
  },
];

function ValuePropositionSection() {
  return (
    <section className="bg-green-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Why LearnAnything?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              We believe everyone deserves access to high-quality, practical
              education — no barriers, no limits.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, i) => (
            <ScrollReveal key={value.title} delay={i * 150}>
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-green-100 hover:shadow-md hover:border-green-200 transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  {value.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {value.title}
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── CTA Banner ───────────────────── */

function CTABanner({
  headline,
  subtext,
  id,
}: {
  headline: string;
  subtext: string;
  id?: string;
}) {
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
            Get Started — It&apos;s Free
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ───────────────────── Examples Section ───────────────────── */

const examples = [
  {
    emoji: "\uD83C\uDFB5",
    title: "Music",
    description:
      "Learn guitar chords, music theory, piano basics, or songwriting through guided practice sessions and real compositions.",
    color: "bg-purple-50 border-purple-100",
    iconColor: "text-purple-600",
  },
  {
    emoji: "\uD83C\uDF73",
    title: "Cooking",
    description:
      "Master knife skills, explore world cuisines, bake artisan bread, or prep healthy meals — one recipe at a time.",
    color: "bg-orange-50 border-orange-100",
    iconColor: "text-orange-600",
  },
  {
    emoji: "\uD83D\uDCBB",
    title: "Programming",
    description:
      "Build websites, apps, and tools by writing real code from day one. Learn Python, JavaScript, Rust, and more.",
    color: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-600",
  },
  {
    emoji: "\uD83E\uDEB5",
    title: "Woodworking",
    description:
      "Start with simple joins, then progress to shelves, furniture, and fine craftsmanship through project-based lessons.",
    color: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-700",
  },
];

function ExamplesSection() {
  return (
    <section id="examples" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Learn Anything You Can Imagine
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Whether creative, technical, or hands-on — we&apos;ve got you
              covered.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {examples.map((ex, i) => (
            <ScrollReveal key={ex.title} variant="scale" delay={i * 100}>
              <div
                className={`rounded-2xl border p-8 ${ex.color} hover:shadow-lg transition-all duration-300 group`}
              >
                <span className="text-4xl">{ex.emoji}</span>
                <h3 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  {ex.title}
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {ex.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Testimonials ───────────────────── */

const testimonials = [
  {
    name: "Alex R.",
    skill: "Guitar",
    quote:
      "I always wanted to play guitar but classroom lessons never clicked. LearnAnything had me strumming songs within a week because every lesson involved actually playing.",
    avatar: "AR",
  },
  {
    name: "Priya M.",
    skill: "Python Programming",
    quote:
      "I went from zero coding knowledge to building my first web app in a month. The project-based approach made it feel like I was creating something real from day one.",
    avatar: "PM",
  },
  {
    name: "Jordan K.",
    skill: "Sourdough Baking",
    quote:
      "The step-by-step baking projects were amazing. I now make bakery-quality sourdough at home, and I actually understand the science behind every rise.",
    avatar: "JK",
  },
  {
    name: "Sam T.",
    skill: "Woodworking",
    quote:
      "I built my first bookshelf following a LearnAnything project. It's still standing! The hands-on approach gave me confidence to tackle bigger projects.",
    avatar: "ST",
  },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Loved by Learners
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from people who transformed their abilities.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 120}>
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
                  &quot;{t.quote}&quot;
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Learned {t.skill}
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

/* ───────────────────── Pricing ───────────────────── */

function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simple Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              No hidden fees. No trials. No credit card required.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="scale" delay={150}>
          <div className="mt-12 rounded-3xl border-2 border-green-200 bg-gradient-to-b from-green-50 to-white p-8 sm:p-12 text-center shadow-sm">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
              Free Plan
            </span>
            <div className="mt-6">
              <span className="text-6xl font-extrabold text-gray-900">$0</span>
              <span className="ml-2 text-xl text-gray-500">/ forever</span>
            </div>
            <ul className="mt-8 space-y-3 text-left max-w-sm mx-auto">
              {[
                "Unlimited learning paths",
                "Hands-on project-based lessons",
                "AI-powered personalized learning paths",
                "Progress tracking and milestones",
                "Community access",
              ].map((item) => (
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
            <Link
              href="/signup"
              className="mt-10 inline-block rounded-xl bg-green-600 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-600/25 hover:bg-green-700 transition-colors"
            >
              Sign Up for Free
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ───────────────────── Footer ───────────────────── */

function Footer() {
  return (
    <footer className="bg-gray-900 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Logo & tagline */}
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white text-xs font-bold">
                LA
              </span>
              LearnAnything
            </div>
            <p className="mt-2 text-sm text-gray-400 max-w-xs">
              Master any skill through hands-on, project-based learning.
              Completely free, forever.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <a
              href="#how-it-works"
              className="text-gray-400 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#examples"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Examples
            </a>
            <a
              href="#pricing"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <Link
              href="/privacy-policy"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>

        {/* Social placeholders & copyright */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} LearnAnything. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            {/* Twitter / X */}
            <a
              href="#"
              aria-label="Twitter"
              className="text-gray-500 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* GitHub */}
            <a
              href="#"
              aria-label="GitHub"
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

/* ───────────────────── Main Landing Page ───────────────────── */

export default function LandingClient() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <ValuePropositionSection />
      <CTABanner
        headline="Ready to Start Your Journey?"
        subtext="Join thousands of learners who are mastering new skills every day."
      />
      <ExamplesSection />
      <TestimonialsSection />
      <CTABanner
        id="cta-final"
        headline="Your Next Skill Is Waiting"
        subtext="Stop thinking about it. Start doing it — completely free."
      />
      <PricingSection />
      <Footer />
    </div>
  );
}
