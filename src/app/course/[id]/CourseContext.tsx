"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  useCourseDetail,
  useEnrollCourse,
  useUnenrollCourse,
  type ModuleSchedule,
  type Module,
  type CourseDetail,
} from "@/lib/hooks";
import { validateCommitment } from "@/lib/schedule";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

/* ─── Context value type ─────────────────────────────────────────── */

interface CourseContextValue {
  /* Data */
  course: CourseDetail | null;
  isEnrolled: boolean;
  isOwner: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  isError: boolean;
  queryError: Error | null;

  /* Computed */
  hasModules: boolean;
  hasSchedule: boolean;
  completedCount: number;
  totalCount: number;
  allCompleted: boolean;
  heroModule: Module | null;
  heroIsLastCompleted: boolean;
  nextModuleAfterHero: Module | null;
  commitmentValidation: ReturnType<typeof validateCommitment> | null;

  /* UI state */
  expandedModules: Set<number>;
  showUnenrollDialog: boolean;
  setShowUnenrollDialog: (value: boolean) => void;
  showPathDetail: boolean;
  setShowPathDetail: (value: boolean) => void;
  unenrollError: string | null;
  setUnenrollError: (value: string | null) => void;
  commitmentIntervalDays: number;
  setCommitmentIntervalDays: (value: number) => void;
  enrollError: string | null;
  setEnrollError: (value: string | null) => void;

  /* Mutations */
  enrollMutation: ReturnType<typeof useEnrollCourse>;
  unenrollMutation: ReturnType<typeof useUnenrollCourse>;

  /* Actions */
  handleEnroll: () => Promise<void>;
  handleUnenroll: () => Promise<void>;
  toggleModule: (moduleIndex: number, schedule: ModuleSchedule | null) => void;
  courseId: string;
}

const CourseContext = createContext<CourseContextValue | null>(null);

/* ─── Provider ───────────────────────────────────────────────────── */

interface CourseProviderProps {
  courseId: string;
  children: ReactNode;
}

export function CourseProvider({ courseId, children }: CourseProviderProps) {
  const router = useRouter();
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set()
  );
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);
  const [showPathDetail, setShowPathDetail] = useState(false);
  const [unenrollError, setUnenrollError] = useState<string | null>(null);
  const [commitmentIntervalDays, setCommitmentIntervalDays] = useState(3);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const {
    data: courseData,
    isLoading: loading,
    isError,
    error: queryError,
  } = useCourseDetail(courseId);

  const enrollMutation = useEnrollCourse();
  const unenrollMutation = useUnenrollCourse();

  const course = courseData?.course ?? null;
  const isEnrolled = courseData?.isEnrolled ?? false;
  const isOwner = courseData?.isOwner ?? false;
  const isAuthenticated = courseData?.isAuthenticated ?? false;

  const commitmentValidation = useMemo(() => {
    if (!course) return null;
    return validateCommitment(course.total_modules, commitmentIntervalDays);
  }, [course, commitmentIntervalDays]);

  async function handleEnroll() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setEnrollError(null);

    try {
      await enrollMutation.mutateAsync({
        courseId,
        isOwner,
        commitmentIntervalDays,
      });
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 401) {
        router.push("/login");
        return;
      }
      if (status === 422) {
        return;
      }
      if (status === 409) {
        return;
      }
      setEnrollError(
        (err as Error)?.message || ERROR_MESSAGES.ENROLL_FAILED
      );
    }
  }

  async function handleUnenroll() {
    setUnenrollError(null);
    try {
      await unenrollMutation.mutateAsync(courseId);
      setShowUnenrollDialog(false);
      setExpandedModules(new Set());
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 404) {
        router.push("/app");
        return;
      }
      setUnenrollError(
        (err as Error)?.message || ERROR_MESSAGES.UNENROLL_FAILED
      );
    }
  }

  function toggleModule(moduleIndex: number, schedule: ModuleSchedule | null) {
    if (!isEnrolled) return;
    if (schedule && schedule.status !== "CURRENT") return;
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

  /* ─── Computed values ────────────────────────────────────────── */

  const hasModules = course ? course.modules.length > 0 : false;
  const hasSchedule =
    isEnrolled && (course?.modules.some((m) => m.schedule !== null) ?? false);

  const completedCount = course
    ? course.modules.filter((m) => m.selectedProject?.completed).length
    : 0;
  const totalCount = course ? course.modules.length : 0;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  const firstIncompleteModule = course?.modules.find(
    (m) =>
      !m.selectedProject?.completed &&
      m.schedule?.status === "CURRENT"
  ) ?? null;

  const firstIncompleteAny = course?.modules.find(
    (m) => !m.selectedProject?.completed
  ) ?? null;

  const lastCompletedModule = course
    ? [...course.modules].reverse().find((m) => m.selectedProject?.completed) ?? null
    : null;

  const heroModule = isEnrolled && hasSchedule
    ? firstIncompleteModule ?? firstIncompleteAny ?? lastCompletedModule ?? null
    : null;

  const heroIsLastCompleted = heroModule !== null &&
    heroModule.selectedProject?.completed === true &&
    !firstIncompleteModule;

  const nextModuleAfterHero = heroModule && course
    ? course.modules.find(
        (m) =>
          m.module_index > heroModule.module_index &&
          !m.selectedProject?.completed
      ) ?? null
    : null;

  const value: CourseContextValue = {
    course,
    isEnrolled,
    isOwner,
    isAuthenticated,
    loading,
    isError,
    queryError: queryError as Error | null,
    hasModules,
    hasSchedule,
    completedCount,
    totalCount,
    allCompleted,
    heroModule,
    heroIsLastCompleted,
    nextModuleAfterHero,
    commitmentValidation,
    expandedModules,
    showUnenrollDialog,
    setShowUnenrollDialog,
    showPathDetail,
    setShowPathDetail,
    unenrollError,
    setUnenrollError,
    commitmentIntervalDays,
    setCommitmentIntervalDays,
    enrollError,
    setEnrollError,
    enrollMutation,
    unenrollMutation,
    handleEnroll,
    handleUnenroll,
    toggleModule,
    courseId,
  };

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────────── */

export function useCourse(): CourseContextValue {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return ctx;
}
