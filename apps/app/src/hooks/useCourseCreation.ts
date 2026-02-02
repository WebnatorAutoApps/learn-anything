import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { fetchJSON, getErrorKeyForStatus } from "@learn-anything/shared";

export interface LearningPlanData {
  whatToLearn: string;
  openDetail: string;
  currentExpertise: string;
  expertiseDetail: string;
  totalModules: number;
}

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
  const [creationErrorKey, setCreationErrorKey] = useState<string | null>(null);
  const [lastPlanData, setLastPlanData] = useState<LearningPlanData | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const submitPlan = useCallback(
    async (planData: LearningPlanData) => {
      if (isCreating) return;

      setLastPlanData(planData);
      setIsCreating(true);
      setCreationError(null);
      setCreationErrorKey(null);

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
          setCreationError(data.error || null);
          setCreationErrorKey("generic");
          return;
        }

        setLastPlanData(null);

        const courseId = data.course?.id;
        if (courseId) {
          router.push(`/(app)/course/${courseId}`);
        } else {
          setIsCreating(false);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        const status = (err as Error & { status?: number }).status;
        const errorKey = getErrorKeyForStatus(status);

        if (errorKey) {
          setCreationErrorKey(errorKey);
          setCreationError(null);
        } else {
          setCreationErrorKey("generic");
          setCreationError(null);
        }
      }
    },
    [isCreating, router]
  );

  const handleProgramSubmit = useCallback(
    (planData: LearningPlanData) => {
      submitPlan(planData);
    },
    [submitPlan]
  );

  const retryCreation = useCallback(() => {
    if (!lastPlanData) return;
    submitPlan(lastPlanData);
  }, [lastPlanData, submitPlan]);

  function dismissCreationError() {
    setIsCreating(false);
    setCreationError(null);
    setCreationErrorKey(null);
  }

  return {
    isCreating,
    creationError,
    creationErrorKey,
    lastPlanData,
    handleProgramSubmit,
    retryCreation,
    dismissCreationError,
  };
}
