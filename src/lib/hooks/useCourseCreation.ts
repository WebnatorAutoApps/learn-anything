import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { LearningPlanData } from "@/app/components/LearnModal";
import { fetchJSON } from "@/lib/hooks/fetch";
import { getErrorKeyForStatus } from "@/lib/constants/errors";

const SESSION_STORAGE_KEY = "course_creation_form_data";

interface CreateCourseResult {
  success: boolean;
  low_likelihood?: boolean;
  likelihood_of_learning?: number;
  error?: string;
  course?: { id: string };
}

function saveFormToSession(data: LearningPlanData): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage may be unavailable (private browsing, quota exceeded)
  }
}

function loadFormFromSession(): LearningPlanData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LearningPlanData;
  } catch {
    return null;
  }
}

function clearFormFromSession(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useCourseCreation() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationErrorKey, setCreationErrorKey] = useState<string | null>(null);
  const [lastPlanData, setLastPlanData] = useState<LearningPlanData | null>(
    () => loadFormFromSession()
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  // Abort in-flight creation request on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const submitPlan = useCallback(
    async (planData: LearningPlanData) => {
      if (isCreating) return;

      // Persist form data before API call
      setLastPlanData(planData);
      saveFormToSession(planData);

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

        // Success — clear persisted form data
        clearFormFromSession();
        setLastPlanData(null);

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

        // Map HTTP status to i18n error key
        const status = (err as Error & { status?: number }).status;
        const errorKey = getErrorKeyForStatus(status);

        if (errorKey) {
          setCreationErrorKey(errorKey);
          setCreationError(null);
        } else {
          // Fallback to generic error key (translated)
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
