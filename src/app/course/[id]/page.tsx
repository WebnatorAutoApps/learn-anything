"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  module_id: string;
  project_index: number;
  title: string;
  instructions: string;
  objective: string;
}

interface Module {
  id: string;
  module_index: number;
  title: string;
  description: string;
  projects: Project[];
}

interface Course {
  id: string;
  normalized_title: string;
  learning_goal: string;
  learning_goal_details: string;
  expertise_level: string;
  expertise_details: string | null;
  expected_skill_level: string;
  likelihood_of_learning: number;
  total_modules: number;
  status: string;
  created_at: string;
  modules: Module[];
}

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Course not found");
          } else if (res.status === 401) {
            router.push("/login");
            return;
          } else {
            setError("Failed to load course");
          }
          return;
        }
        const data = await res.json();
        setCourse(data.course);
      } catch {
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [id, router]);

  function toggleModule(moduleIndex: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleIndex)) {
        next.delete(moduleIndex);
      } else {
        next.add(moduleIndex);
      }
      return next;
    });
  }

  if (loading) {
    return (
      <div className="terminal-screen min-h-screen font-mono">
        <div className="terminal-vignette" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-green-400 text-lg">
            <span className="text-green-600">{">"}</span> Loading course
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

  if (error || !course) {
    return (
      <div className="terminal-screen min-h-screen font-mono">
        <div className="terminal-vignette" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-red-400 text-lg">
            <span className="text-red-600">{">"}</span> {error || "Course not found"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg border border-green-900/60 text-green-400 hover:bg-green-900/30 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
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
              <span className="text-sm">Back</span>
            </button>
            <div className="h-6 w-px bg-green-900/50" />
            <h1 className="text-xl font-semibold text-green-400 tracking-wider truncate">
              {course.normalized_title}
            </h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-green-400 mb-2 tracking-wide">
            <span className="text-green-600">{">"}</span>{" "}
            {course.normalized_title}
          </h2>
          <p className="text-green-500 text-lg mb-4">
            {course.learning_goal}
          </p>
          <p className="text-green-600 leading-relaxed">
            {course.learning_goal_details}
          </p>
        </div>

        {/* Course Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
              Modules
            </p>
            <p className="text-xl font-bold text-green-400">
              {course.total_modules}
            </p>
          </div>
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
              Your Level
            </p>
            <p className="text-sm font-semibold text-green-400">
              {course.expertise_level}
            </p>
          </div>
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
              Target Level
            </p>
            <p className="text-sm font-semibold text-green-400">
              {course.expected_skill_level}
            </p>
          </div>
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
              Success Rate
            </p>
            <p className="text-xl font-bold text-green-400">
              {course.likelihood_of_learning}%
            </p>
          </div>
        </div>

        {/* Expertise Details */}
        {course.expertise_details && (
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 p-4 mb-8">
            <p className="text-xs text-green-700 uppercase tracking-wider mb-2">
              Your Background
            </p>
            <p className="text-green-500 text-sm leading-relaxed">
              {course.expertise_details}
            </p>
          </div>
        )}

        {/* Modules List */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-green-400 mb-4 tracking-wide">
            <span className="text-green-600">{">"}</span> Course Modules
          </h3>

          <div className="space-y-2">
            {course.modules.map((mod) => {
              const isExpanded = expandedModules.has(mod.module_index);
              return (
                <div
                  key={mod.id}
                  className="rounded-lg border border-green-900/60 bg-green-950/20 overflow-hidden"
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(mod.module_index)}
                    className="w-full p-4 text-left flex items-start gap-4 hover:bg-green-950/40 transition-colors"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-green-800/50 bg-green-950/50 text-sm font-bold text-green-400">
                      {mod.module_index}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-green-400">
                        {mod.title}
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        {mod.description}
                      </p>
                    </div>
                    <svg
                      className={`h-5 w-5 text-green-600 flex-shrink-0 mt-1 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Projects (expanded) */}
                  {isExpanded && mod.projects.length > 0 && (
                    <div className="border-t border-green-900/40 px-4 py-3 space-y-3">
                      <p className="text-xs text-green-700 uppercase tracking-wider">
                        Project Options
                      </p>
                      {mod.projects.map((project) => (
                        <div
                          key={project.id}
                          className="rounded border border-green-900/40 bg-green-950/30 p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-green-700 border border-green-900/40 rounded px-1.5 py-0.5">
                              Option {project.project_index}
                            </span>
                            <h5 className="font-semibold text-green-400 text-sm">
                              {project.title}
                            </h5>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
                                Objective
                              </p>
                              <p className="text-sm text-green-500 leading-relaxed">
                                {project.objective}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-green-700 uppercase tracking-wider mb-1">
                                Instructions
                              </p>
                              <p className="text-sm text-green-600 leading-relaxed">
                                {project.instructions}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
