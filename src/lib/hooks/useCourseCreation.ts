import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { LearningPlanData } from "@/app/components/LearnModal";
import { fetchJSON } from "@/lib/hooks/fetch";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

interface CreateCourseResult {
  success: boolean;
  low_likelihood?: boolean;
  likelihood_of_learning?: number;
  error?: string;
  course?: { id: string };
}

export function useCourseCreation() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Abort in-flight creation request on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleProgramSubmit = useCallback(
    async (planData: LearningPlanData) => {
      if (isCreating) return;

      setIsCreating(true);
      setCreationError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await fetchJSON<CreateCourseResult>("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(planData),
          signal: controller.signal,
        });

        if (data.low_likelihood) {
          setCreationError(
            `Low likelihood of success (${data.likelihood_of_learning}%). ${data.error}`
          );
          return;
        }

        if (!data.success) {
          setCreationError(
            data.error || ERROR_MESSAGES.GENERIC
          );
          return;
        }

        const courseId = data.course?.id;
        if (courseId) {
          router.push(`/course/${courseId}`);
        } else {
          setIsCreating(false);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message = err instanceof Error ? err.message : "";
        setCreationError(message || ERROR_MESSAGES.NETWORK);
      }
    },
    [isCreating, router]
  );

  function dismissCreationError() {
    setIsCreating(false);
    setCreationError(null);
  }

  return {
    isCreating,
    creationError,
    handleProgramSubmit,
    dismissCreationError,
  };
}
