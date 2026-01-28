import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Top Bar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Learn Anything
            </h1>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            What do you want to learn today?
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Choose a topic to continue your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Python Button */}
          <button className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-6 text-left transition-all hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <span className="text-2xl">🐍</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Python
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Programming Language
                </p>
              </div>
            </div>
          </button>

          {/* AI Button */}
          <button className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-6 text-left transition-all hover:shadow-lg hover:border-purple-500 dark:hover:border-purple-500">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  AI
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Artificial Intelligence
                </p>
              </div>
            </div>
          </button>

          {/* Add New Button */}
          <button className="group relative overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 text-left transition-all hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
                <svg
                  className="h-6 w-6 text-zinc-600 dark:text-zinc-400"
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
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Learn Something New
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
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
