"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCourses, useEnrollCourse } from "@/lib/hooks/queries";
import { CourseGridSkeleton } from "../components/PageLoader";

type Tab = "my-courses" | "public";

function MyCoursesTab() {
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

  if (isLoading) {
    return <CourseGridSkeleton count={3} />;
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-8 text-center">
        <p className="text-green-600 mb-4">
          No learning paths yet. Create your first learning path from the
          Dashboard.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
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
  );
}

function PublicCoursesTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Globe/network illustration */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-900/60 bg-green-950/30">
        <svg
          className="h-10 w-10 text-green-600"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
          <path d="M3.6 9h16.8M3.6 15h16.8" />
          <path d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-green-400 mb-2 tracking-wide">
        Nothing here yet
      </h3>
      <p className="text-green-600 text-center max-w-md">
        Public learning paths are coming soon &mdash; stay tuned!
      </p>
    </div>
  );
}

function CoursesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab: Tab =
    searchParams.get("tab") === "public" ? "public" : "my-courses";

  const setActiveTab = useCallback(
    (tab: Tab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "my-courses") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const qs = params.toString();
      router.replace(`/courses${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "my-courses", label: "My Learning Paths" },
    { key: "public", label: "Public Learning Paths" },
  ];

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
              Browse Learning Paths
            </h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="mb-8" role="tablist" aria-label="Learning paths tabs">
          <div className="flex border-b border-green-900/50">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`tabpanel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? "text-green-400"
                    : "text-green-700 hover:text-green-500"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Panels */}
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={activeTab}
        >
          {activeTab === "my-courses" ? <MyCoursesTab /> : <PublicCoursesTab />}
        </div>
      </main>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense>
      <CoursesPageContent />
    </Suspense>
  );
}
