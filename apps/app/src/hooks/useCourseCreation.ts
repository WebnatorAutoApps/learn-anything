import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { useCreateCourse, useGeminiKey, useProfile } from "@learn-anything/shared";

export interface LearningPlanData {
  whatToLearn: string;
  openDetail: string;
  currentExpertise: string;
  expertiseDetail: string;
  totalModules: number;
}

export function useCourseCreation() {
  const router = useRouter();
  const createCourse = useCreateCourse();
  const { apiKey } = useGeminiKey();
  const { data: profile } = useProfile();
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationErrorKey, setCreationErrorKey] = useState<string | null>(null);
  const [lastPlanData, setLastPlanData] = useState<LearningPlanData | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const submitPlan = useCallback(
    async (planData: LearningPlanData) => {
      if (!apiKey) {
        setCreationError("No API key configured.");
        setCreationErrorKey("generic");
        return;
      }

      setLastPlanData(planData);
      setIsCreating(true);
      setCreationError(null);
      setCreationErrorKey(null);

      try {
        const data = await createCourse.mutateAsync({
          planData,
          apiKey,
          tone: profile?.tone,
        });

        if (!mountedRef.current) return;

        if ("low_likelihood" in data && data.low_likelihood) {
          setCreationError(
            `Low likelihood of success (${data.likelihood_of_learning}%). ${data.error}`
          );
          setCreationErrorKey("generic");
          return;
        }

        if ("course" in data && data.course) {
          setLastPlanData(null);
          setIsCreating(false);
          router.push(`/(app)/course/${data.course.id}`);
        }
      } catch (err: unknown) {
        if (!mountedRef.current) return;

        setCreationErrorKey("generic");
        setCreationError(
          err instanceof Error ? err.message : "Failed to create course."
        );
      }
    },
    [apiKey, profile?.tone, createCourse, router]
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
