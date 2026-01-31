"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCourses, useEnrollCourse } from "@/lib/hooks/queries";
import { CourseGridSkeleton } from "../components/PageLoader";

export default function CoursesPage() {
  const router = useRouter();
  const { data: courses = [], isLoading } = useCourses("all");
  const enrollMutation = useEnrollCourse();
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  async function handleEnroll(courseId: string) {
    setEnrollingId(courseId);
    try {
      await enrollMutation.mutateAsync({ courseId, isOwner: true });
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
              My Learning Paths
            </h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-green-400 mb-2 tracking-wide">
            <span className="text-green-600">{">"}</span> My Learning Paths
            <span className="inline-block w-2.5 h-5 bg-green-400 ml-1 animate-pulse align-middle" />
          </h2>
          <p className="text-green-600">
            All learning paths you&apos;ve created. Enroll to begin learning.
          </p>
        </div>

        {isLoading ? (
          <CourseGridSkeleton count={3} />
        ) : courses.length === 0 ? (
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-8 text-center">
            <p className="text-green-600 mb-4">
              No learning paths yet. Create your first learning path from the Dashboard.
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
                        {course.total_modules} steps
                      </p>
                    </div>
                  </div>
                </button>
                {course.isEnrolled ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-green-900/60 bg-green-950/30 text-green-600 font-semibold text-sm cursor-default opacity-70"
                  >
                    Already Enrolled
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrollingId === course.id}
                    className="w-full px-4 py-2 rounded-lg bg-green-600 text-black font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {enrollingId === course.id
                      ? "Starting..."
                      : "Start Learning Path"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
