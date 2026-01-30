"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  normalized_title: string;
  expected_skill_level: string;
  likelihood_of_learning: number;
  total_modules: number;
  status: string;
  created_at: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/courses?status=created");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  async function handleEnroll(courseId: string) {
    setEnrollingId(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enroll" }),
      });
      if (res.ok) {
        // Remove the enrolled course from the list
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
      }
    } catch {
      // Non-critical
    } finally {
      setEnrollingId(null);
    }
  }

  return (
    <div className="terminal-screen min-h-screen font-mono">
      <div className="terminal-vignette" />

      {/* Top Bar */}
      <header className="relative z-20 border-b border-green-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-green-600 hover:text-green-400 transition-colors flex items-center gap-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Dashboard</span>
            </button>
            <div className="h-6 w-px bg-green-900/50" />
            <h1 className="text-xl font-semibold text-green-400 tracking-wider">
              My Courses
            </h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-green-400 mb-2 tracking-wide">
            <span className="text-green-600">{">"}</span> Created Courses
            <span className="inline-block w-2.5 h-5 bg-green-400 ml-1 animate-pulse align-middle" />
          </h2>
          <p className="text-green-600">
            Courses you&apos;ve created but haven&apos;t started yet. Enroll to begin learning.
          </p>
        </div>

        {loading ? (
          <div className="text-green-400 text-lg">
            <span className="text-green-600">{">"}</span> Loading courses
            <span className="typing-dots">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </span>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-8 text-center">
            <p className="text-green-600 mb-4">
              No created courses yet. All your courses are either started or you
              haven&apos;t created any.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group relative overflow-hidden rounded-lg border border-green-900/60 bg-green-950/20 p-6 transition-all hover:border-green-500/70 hover:bg-green-950/40"
              >
                <button
                  onClick={() => router.push(`/course/${course.id}`)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-green-800/50 bg-green-950/50">
                      <span className="text-lg font-bold text-green-400">
                        {course.normalized_title.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-green-400 truncate">
                        {course.normalized_title}
                      </h3>
                      <p className="text-sm text-green-700">
                        {course.total_modules} modules
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrollingId === course.id}
                  className="w-full px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {enrollingId === course.id
                    ? "Starting..."
                    : "Start Course"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
