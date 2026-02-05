export { queryKeys } from "./keys";

export type {
  Profile,
  CourseListItem,
  CourseDetail,
  CourseDetailResponse,
  Module,
  ModuleSchedule,
  Project,
  SelectedProject,
  UpcomingProject,
} from "./types";

export { useProfile, useCourses, useCourseDetail, useUpcomingProjects } from "./queries";

export {
  useCreateCourse,
  useEnrollCourse,
  useUnenrollCourse,
  useSaveTone,
  useSaveTheme,
  useSelectProject,
  useCompleteProject,
  useUploadCompletionImage,
  useUpdateProfile,
  useUploadAvatar,
  useUpdateEmail,
  useUpdatePassword,
  useUpdateUsername,
} from "./mutations";

export { useSettingsModal } from "./useSettingsModal";
export type { SettingsTab } from "./useSettingsModal";

export { useGeminiKey } from "./useGeminiKey";
