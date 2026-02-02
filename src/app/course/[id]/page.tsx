"use client";

import { use } from "react";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { CourseProvider } from "./CourseContext";
import CourseView from "./CourseView";

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <ErrorBoundary>
      <CourseProvider courseId={id}>
        <CourseView />
      </CourseProvider>
    </ErrorBoundary>
  );
}
