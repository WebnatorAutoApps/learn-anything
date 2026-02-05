"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from "react";
import { useI18n } from "@/i18n/I18nProvider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.learnanything.com";

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

/* ───────────────────── Reduced motion hook ───────────────────── */

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

/* ── Hero background videos (Mixkit – royalty-free, no attribution) ── */

const HERO_VIDEOS = [
  {
    src: "https://assets.mixkit.co/videos/43925/43925-720.mp4",
    label: "Chef preparing food",
  },
  {
    src: "https://assets.mixkit.co/videos/1127/1127-720.mp4",
    label: "Surfer riding a wave",
  },
  {
    src: "https://assets.mixkit.co/videos/615/615-720.mp4",
    label: "Car racing on a track",
  },
  {
    src: "https://assets.mixkit.co/videos/1728/1728-720.mp4",
    label: "Developer writing code",
  },
  {
    src: "https://assets.mixkit.co/videos/483/483-720.mp4",
    label: "Live concert with stage lights",
  },
  {
    src: "https://assets.mixkit.co/videos/32103/32103-720.mp4",
    label: "Molding clay on a pottery wheel",
  },
  {
    src: "https://assets.mixkit.co/videos/44862/44862-720.mp4",
    label: "Carpenter cutting wood with a jigsaw",
  },
  {
    src: "https://assets.mixkit.co/videos/50542/50542-720.mp4",
    label: "Photographer taking photos in nature",
  },
];

const SLIDE_DURATION = 3000;

/** Fisher-Yates shuffle (returns a new array). */
function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ───────────────────── HeroSection component ───────────────────── */

export default function HeroSection() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const { locale, t } = useI18n();
  const hero = t.hero as Record<string, string | Record<string, string>>;
  const skillWords = hero.skillWords as Record<string, string>;
  const anythingText = hero.anything as string;

  const videos = useMemo(() => shuffle(HERO_VIDEOS), []);

  const wordQueue = useMemo(
    () => buildWordQueue(skillWords, anythingText),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recalculate only when locale changes
    [locale],
  );
  const { displayText, currentColor } = useTypewriter(
    prefersReducedMotion,
    wordQueue,
    anythingText,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % videos.length);
    }, SLIDE_DURATION);
  }, [videos.length]);

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
      {/* Background video slideshow */}
      {videos.map((vid, i) => (
        <div
          key={vid.src}
          aria-hidden={i !== activeIndex}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <video
            src={vid.src}
            autoPlay
            muted
            loop
            playsInline
            aria-label={vid.label}
            className="h-full w-full object-cover"
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
            <a
              href={`${APP_URL}/signup`}
              className="rounded-xl bg-green-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-600/25 hover:bg-green-700 hover:shadow-green-700/25 transition-all"
            >
              {hero.ctaStart as string}
            </a>
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
