import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  useGenerateCourse,
  useSaveCourse,
  useGeminiKey,
  useProfile,
  ERROR_MESSAGES,
  SUPPORTED_LOCALES,
} from "@learn-anything/shared";
import type { LLMResponse } from "@learn-anything/shared";
import { useI18n } from "../i18n/I18nProvider";

export interface LearningPlanData {
  whatToLearn: string;
  openDetail: string;
  currentExpertise: string;
  expertiseDetail: string;
  totalModules: number;
  commitmentDays: number;
  durationMonths: number;
}

export function useCourseCreation() {
  const router = useRouter();
  const generateCourse = useGenerateCourse();
  const saveCourse = useSaveCourse();
  const { apiKey } = useGeminiKey();
  const { data: profile } = useProfile();
  const { locale } = useI18n();

  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationErrorKey, setCreationErrorKey] = useState<string | null>(null);
  const [lastPlanData, setLastPlanData] = useState<LearningPlanData | null>(null);
  const [previewData, setPreviewData] = useState<LLMResponse | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const localeName = SUPPORTED_LOCALES.find((l) => l.code === locale)?.name ?? null;

  const submitPlan = useCallback(
    async (planData: LearningPlanData) => {
      if (!apiKey) {
        setCreationError(ERROR_MESSAGES.NO_API_KEY);
        setCreationErrorKey("generic");
        return;
      }

      setLastPlanData(planData);
      setIsCreating(true);
      setCreationError(null);
      setCreationErrorKey(null);
      setPreviewData(null);

      try {
        const data = await generateCourse.mutateAsync({
          planData,
          apiKey,
          tone: profile?.tone,
          locale: localeName,
        });

        if (!mountedRef.current) return;

        if ("low_likelihood" in data && data.low_likelihood) {
          setCreationErrorKey("lowLikelihood");
          setCreationError(String(data.likelihood_of_learning));
          return;
        }

        if ("llmResponse" in data && data.llmResponse) {
          setIsCreating(false);
          setPreviewData(data.llmResponse);
        }
      } catch (err: unknown) {
        if (!mountedRef.current) return;

        setCreationErrorKey("generic");
        setCreationError(
          err instanceof Error ? err.message : ERROR_MESSAGES.COURSE_GENERATE_FAILED
        );
      }
    },
    [apiKey, profile?.tone, localeName, generateCourse]
  );

  const confirmCourse = useCallback(async () => {
    if (!previewData || !lastPlanData) return;

    setIsSaving(true);
    setCreationError(null);
    setCreationErrorKey(null);

    try {
      const result = await saveCourse.mutateAsync({
        planData: lastPlanData,
        llmResponse: previewData,
      });

      if (!mountedRef.current) return;

      if (result.course) {
        setPreviewData(null);
        setLastPlanData(null);
        setIsSaving(false);
        router.push(`/(app)/course/${result.course.id}`);
      }
    } catch (err: unknown) {
      if (!mountedRef.current) return;

      setIsSaving(false);
      setCreationErrorKey("generic");
      setCreationError(
        err instanceof Error ? err.message : ERROR_MESSAGES.COURSE_SAVE_FAILED
      );
    }
  }, [previewData, lastPlanData, saveCourse, router]);

  const goBackFromPreview = useCallback(() => {
    setPreviewData(null);
  }, []);

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
    isSaving,
    creationError,
    creationErrorKey,
    lastPlanData,
    previewData,
    handleProgramSubmit,
    retryCreation,
    dismissCreationError,
    confirmCourse,
    goBackFromPreview,
  };
}
