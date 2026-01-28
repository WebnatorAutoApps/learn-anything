import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <div className="terminal-screen min-h-screen font-mono">
      {/* CRT vignette overlay */}
      <div className="terminal-vignette" />

      {/* Top Bar */}
      <header className="relative z-10 border-b border-green-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-green-400 tracking-wider">
              Learn Anything
            </h1>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full border-2 border-green-500 flex items-center justify-center text-green-400 font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-green-400 mb-2 tracking-wide">
            <span className="text-green-600">{">"}</span> What do you want to
            learn today?
            <span className="inline-block w-2.5 h-5 bg-green-400 ml-1 animate-pulse align-middle" />
          </h2>
          <p className="text-green-600">
            Choose a topic to continue your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Python Button */}
          <button className="group relative overflow-hidden rounded-lg border border-green-900/60 bg-green-950/20 p-6 text-left transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] hover:border-green-500/70 hover:bg-green-950/40">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-green-800/50 bg-green-950/50">
                <span className="text-2xl">🐍</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400">
                  Python
                </h3>
                <p className="text-sm text-green-700">
                  Programming Language
                </p>
              </div>
            </div>
          </button>

          {/* AI Button */}
          <button className="group relative overflow-hidden rounded-lg border border-green-900/60 bg-green-950/20 p-6 text-left transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] hover:border-green-500/70 hover:bg-green-950/40">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-green-800/50 bg-green-950/50">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400">
                  AI
                </h3>
                <p className="text-sm text-green-700">
                  Artificial Intelligence
                </p>
              </div>
            </div>
          </button>

          {/* Add New Button */}
          <button className="group relative overflow-hidden rounded-lg border-2 border-dashed border-green-900/50 bg-green-950/10 p-6 text-left transition-all hover:border-green-600/50 hover:bg-green-950/30">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-green-800/50 bg-green-950/50">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400">
                  Learn Something New
                </h3>
                <p className="text-sm text-green-700">
                  Add a new topic
                </p>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
