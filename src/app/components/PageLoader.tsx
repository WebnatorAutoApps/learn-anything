"use client";

/**
 * Full-page loader with terminal theme.
 * Used for initial page loads where we don't know the content shape.
 */
export default function PageLoader({ message = "Loading" }: { message?: string }) {
  return (
    <div className="terminal-screen min-h-screen font-mono">
      <div className="terminal-vignette" />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-green-400 text-lg">
          <span className="text-green-600">{">"}</span> {message}
          <span className="typing-dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for learning path cards in a grid layout.
 * Mirrors the shape of actual learning path cards.
 */
export function CourseCardSkeleton() {
  return (
    <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-green-900/40" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 w-3/4 rounded bg-green-900/40" />
          <div className="h-4 w-1/3 rounded bg-green-900/30" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of skeleton learning path cards for list loading states.
 */
export function CourseGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for the learning path detail page (header + info grid + modules).
 */
export function CourseDetailSkeleton() {
  return (
    <div className="terminal-screen min-h-screen font-mono">
      <div className="terminal-vignette" />

      {/* Header skeleton */}
      <header className="relative z-20 border-b border-green-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <div className="h-5 w-16 rounded bg-green-900/40 animate-pulse" />
            <div className="h-6 w-px bg-green-900/50" />
            <div className="h-6 w-48 rounded bg-green-900/40 animate-pulse" />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        {/* Title */}
        <div className="mb-8 space-y-3">
          <div className="h-8 w-2/3 rounded bg-green-900/40" />
          <div className="h-5 w-full rounded bg-green-900/30" />
          <div className="h-4 w-4/5 rounded bg-green-900/20" />
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-green-900/60 bg-green-950/20 p-4 space-y-2"
            >
              <div className="h-3 w-16 rounded bg-green-900/30" />
              <div className="h-6 w-12 rounded bg-green-900/40" />
            </div>
          ))}
        </div>

        {/* Enroll button */}
        <div className="mb-8">
          <div className="h-12 w-full rounded-lg bg-green-900/30" />
        </div>

        {/* Step skeletons */}
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-green-900/60 bg-green-950/20 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded bg-green-900/40" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/2 rounded bg-green-900/40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
