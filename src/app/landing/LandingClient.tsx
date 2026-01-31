"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import ScrollReveal from "@/app/components/ScrollReveal";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import HreflangTags from "@/app/components/HreflangTags";
import { I18nProvider, useI18n } from "@/lib/i18n";

/* Hydration-safe mounted check without setState-in-effect */
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/* ───────────────────── Typewriter hook ───────────────────── */

interface SkillWord {
  text: string;
  color: string;
  isAnything: boolean;
}

const SKILL_COLORS: Record<string, string> = {
  cooking: "#f97316",
  coding: "#22c55e",
  music: "#a855f7",
  saxophone: "#eab308",
  woodworking: "#a16207",
  electronics: "#06b6d4",
  crafts: "#ec4899",
  photography: "#f87171",
  languages: "#14b8a6",
  pottery: "#d97706",
  chess: "#8b5cf6",
  filmmaking: "#f43f5e",
  robotics: "#3b82f6",
  calligraphy: "#c084fc",
  gardening: "#4ade80",
  animation: "#fb923c",
  astronomy: "#60a5fa",
};

const SKILL_KEYS = [
  "cooking", "coding", "music", "saxophone", "woodworking", "electronics",
  "crafts", "photography", "languages", "pottery", "chess", "filmmaking",
  "robotics", "calligraphy", "gardening", "animation", "astronomy",
];

function buildWordQueue(
  skillWords: Record<string, string>,
  anythingText: string,
): SkillWord[] {
  const queue: SkillWord[] = [];
  for (let i = 0; i < SKILL_KEYS.length; i++) {
    const key = SKILL_KEYS[i];
    queue.push({
      text: skillWords[key] || key,
      color: SKILL_COLORS[key] || "#ffffff",
      isAnything: false,
    });
    if ((i + 1) % 2 === 0) {
      queue.push({ text: anythingText, color: "#ffffff", isAnything: true });
    }
  }
  if (SKILL_KEYS.length % 2 !== 0) {
    queue.push({ text: anythingText, color: "#ffffff", isAnything: true });
  }
  return queue;
}

const TYPE_SPEED = 80;
const DELETE_SPEED = 50;
const PAUSE_NORMAL = 1000;
const PAUSE_ANYTHING = 2000;

function useTypewriter(
  prefersReducedMotion: boolean,
  wordQueue: SkillWord[],
  anythingText: string,
) {
  const [displayText, setDisplayText] = useState("");
  const [currentColor, setCurrentColor] = useState("#ffffff");
  const wordIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const isDeletingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Reset on queue change
    wordIndexRef.current = 0;
    charIndexRef.current = 0;
    isDeletingRef.current = false;

    function tick() {
      if (wordQueue.length === 0) return;
      const word = wordQueue[wordIndexRef.current % wordQueue.length];
      const fullText = word.text;

      if (!isDeletingRef.current) {
        charIndexRef.current++;
        setDisplayText(fullText.slice(0, charIndexRef.current));
        setCurrentColor(word.color);

        if (charIndexRef.current === fullText.length) {
          const pause = word.isAnything ? PAUSE_ANYTHING : PAUSE_NORMAL;
          timeoutRef.current = setTimeout(() => {
            isDeletingRef.current = true;
            tick();
          }, pause);
          return;
        }
        timeoutRef.current = setTimeout(tick, TYPE_SPEED);
      } else {
        charIndexRef.current--;
        setDisplayText(fullText.slice(0, charIndexRef.current));

        if (charIndexRef.current === 0) {
          isDeletingRef.current = false;
          wordIndexRef.current =
            (wordIndexRef.current + 1) % wordQueue.length;
          timeoutRef.current = setTimeout(tick, TYPE_SPEED * 2);
          return;
        }
        timeoutRef.current = setTimeout(tick, DELETE_SPEED);
      }
    }

    // Reset display text and start first tick in a single callback
    timeoutRef.current = setTimeout(() => {
      setDisplayText("");
      tick();
    }, 0);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [prefersReducedMotion, wordQueue]);

  if (prefersReducedMotion) {
    return { displayText: anythingText, currentColor: "#ffffff" };
  }

  return { displayText, currentColor };
}

/* ───────────────────── Navbar ───────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();
  const nav = t.nav as Record<string, string>;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: nav.howItWorks, href: "#how-it-works" },
    { label: nav.examples, href: "#examples" },
    { label: nav.testimonials, href: "#testimonials" },
    { label: nav.pricing, href: "#pricing" },
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
            className={`flex items-center gap-2 text-xl font-bold transition-colors duration-300 ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
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
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-gray-600 hover:text-green-600"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth buttons + Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher scrolled={scrolled} />
            <Link
              href="/login"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                scrolled
                  ? "text-gray-700 hover:text-green-600"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {nav.logIn}
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
            >
              {nav.signUpFree}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher scrolled={scrolled} />
            <button
              type="button"
              className={`p-2 transition-colors ${
                scrolled ? "text-gray-700" : "text-white"
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={nav.toggleMenu}
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
                {nav.logIn}
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                {nav.signUpFree}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ───────────────────── Hero Section ───────────────────── */

function useReducedMotion() {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

/* ── Hero background images (Unsplash – free to use) ── */

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1502680390548-bdbac40b3298?auto=format&fit=crop&w=1920&q=80",
    alt: "Surfer riding a wave at sunset",
  },
  {
    src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1920&q=80",
    alt: "Chef preparing food in a professional kitchen",
  },
  {
    src: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1920&q=80",
    alt: "Sports car racing on a track",
  },
  {
    src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1920&q=80",
    alt: "Developer writing code on a laptop",
  },
  {
    src: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1920&q=80",
    alt: "Live concert with crowd and stage lights",
  },
];

const SLIDE_DURATION = 6000; // ms per slide

function HeroSection() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const { t } = useI18n();
  const hero = t.hero as Record<string, string | Record<string, string>>;
  const skillWords = hero.skillWords as Record<string, string>;
  const anythingText = hero.anything as string;

  const wordQueue = buildWordQueue(skillWords, anythingText);
  const { displayText, currentColor } = useTypewriter(
    prefersReducedMotion,
    wordQueue,
    anythingText,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, SLIDE_DURATION);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [prefersReducedMotion, startTimer]);

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-green-950"
      aria-label={hero.ariaLabel as string}
    >
      {/* Background image slideshow */}
      {HERO_IMAGES.map((img, i) => (
        <div
          key={img.src}
          aria-hidden={i !== activeIndex}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt}
            loading={i === 0 ? "eager" : "lazy"}
            decoding={i === 0 ? "sync" : "async"}
            className={`h-full w-full object-cover ${
              prefersReducedMotion ? "" : "hero-ken-burns"
            }`}
            style={
              prefersReducedMotion
                ? undefined
                : { animationDelay: `${i * -SLIDE_DURATION}ms` }
            }
          />
        </div>
      ))}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-12 lg:px-20">
        <div
          className={`max-w-4xl transition-all duration-700 ${
            mounted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-none">
            {hero.learn as string}
          </h1>
          <div className="mt-2 sm:mt-4 min-h-[1.2em] text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none">
            <span style={{ color: currentColor }} className="typewriter-text">
              {displayText}
            </span>
            <span className="typewriter-cursor" aria-hidden="true" />
          </div>

          <p className="mt-8 max-w-xl text-base sm:text-lg text-white/70 leading-relaxed">
            {hero.tagline as string}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-green-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-600/25 hover:bg-green-700 hover:shadow-green-700/25 transition-all"
            >
              {hero.ctaStart as string}
            </Link>
            <a
              href="#how-it-works"
              className="rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:border-white/60 hover:bg-white/10 transition-all"
            >
              {hero.ctaSeeHow as string}
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-700 delay-500 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs font-medium tracking-widest uppercase">{hero.scroll as string}</span>
          <svg className="h-5 w-5 animate-bounce" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── How It Works ───────────────────── */

const stepIcons = [
  <svg key="s1" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>,
  <svg key="s2" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>,
  <svg key="s3" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.073A1.5 1.5 0 005 13.5v5.25a1.5 1.5 0 001.036 1.427l5.384 1.795a1.5 1.5 0 00.928 0l5.384-1.795A1.5 1.5 0 0019 18.75V13.5a1.5 1.5 0 00-1.036-1.403L12.58 9.024a1.5 1.5 0 00-.928 0L6.268 10.82" />
  </svg>,
  <svg key="s4" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>,
];

function HowItWorksSection() {
  const { t } = useI18n();
  const hiw = t.howItWorks as Record<string, string>;

  const steps = [
    { icon: stepIcons[0], title: hiw.step1Title, description: hiw.step1Desc },
    { icon: stepIcons[1], title: hiw.step2Title, description: hiw.step2Desc },
    { icon: stepIcons[2], title: hiw.step3Title, description: hiw.step3Desc },
    { icon: stepIcons[3], title: hiw.step4Title, description: hiw.step4Desc },
  ];

  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {hiw.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {hiw.description}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 120}>
              <div className="relative text-center group">
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

const valueIcons = [
  <svg key="v1" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>,
  <svg key="v2" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>,
  <svg key="v3" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>,
];

function ValuePropositionSection() {
  const { t } = useI18n();
  const vp = t.valueProposition as Record<string, string>;

  const values = [
    { icon: valueIcons[0], title: vp.value1Title, description: vp.value1Desc },
    { icon: valueIcons[1], title: vp.value2Title, description: vp.value2Desc },
    { icon: valueIcons[2], title: vp.value3Title, description: vp.value3Desc },
  ];

  return (
    <section className="bg-green-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {vp.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {vp.description}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, i) => (
            <ScrollReveal key={i} delay={i * 150}>
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

/* ───────────────────── Examples Section ───────────────────── */

const examplesMeta = [
  { emoji: "\uD83E\uDD16", color: "bg-blue-50 border-blue-100", iconColor: "text-blue-600", titleKey: "aiTitle", descKey: "aiDesc" },
  { emoji: "\uD83C\uDFB8", color: "bg-purple-50 border-purple-100", iconColor: "text-purple-600", titleKey: "musicTitle", descKey: "musicDesc" },
  { emoji: "\uD83D\uDE80", color: "bg-indigo-50 border-indigo-100", iconColor: "text-indigo-600", titleKey: "astroTitle", descKey: "astroDesc" },
  { emoji: "\uD83C\uDF7C", color: "bg-orange-50 border-orange-100", iconColor: "text-orange-600", titleKey: "fermentTitle", descKey: "fermentDesc" },
  { emoji: "\uD83C\uDFAD", color: "bg-pink-50 border-pink-100", iconColor: "text-pink-600", titleKey: "screenTitle", descKey: "screenDesc" },
  { emoji: "\uD83E\uDDE0", color: "bg-amber-50 border-amber-100", iconColor: "text-amber-700", titleKey: "dreamTitle", descKey: "dreamDesc" },
];

function ExamplesSection() {
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

/* ───────────────────── Testimonials ───────────────────── */

const testimonialsMeta = [
  { nameKey: "t1Name", skillKey: "t1Skill", quoteKey: "t1Quote", avatar: "AR" },
  { nameKey: "t2Name", skillKey: "t2Skill", quoteKey: "t2Quote", avatar: "PM" },
  { nameKey: "t3Name", skillKey: "t3Skill", quoteKey: "t3Quote", avatar: "JK" },
  { nameKey: "t4Name", skillKey: "t4Skill", quoteKey: "t4Quote", avatar: "ST" },
];

function TestimonialsSection() {
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

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

/* ───────────────────── Pricing ───────────────────── */

function PricingSection() {
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
            <Link
              href="/signup"
              className="mt-10 inline-block rounded-xl bg-green-600 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-600/25 hover:bg-green-700 transition-colors"
            >
              {pr.signUp}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ───────────────────── Footer ───────────────────── */

function Footer() {
  const { t } = useI18n();
  const nav = t.nav as Record<string, string>;
  const ft = t.footer as Record<string, string>;

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
              {ft.tagline}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <a
              href="#how-it-works"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {nav.howItWorks}
            </a>
            <a
              href="#examples"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {nav.examples}
            </a>
            <a
              href="#pricing"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {nav.pricing}
            </a>
            <Link
              href="/privacy-policy"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {ft.privacyPolicy}
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {ft.termsConditions}
            </Link>
          </div>
        </div>

        {/* Social placeholders & copyright */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {ft.copyright}
          </p>
          <div className="flex gap-4">
            {/* Twitter / X */}
            <a
              href="#"
              aria-label={ft.twitter}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* GitHub */}
            <a
              href="#"
              aria-label={ft.github}
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

function LandingContent() {
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

export default function LandingClient() {
  return (
    <I18nProvider>
      <LandingContent />
    </I18nProvider>
  );
}
