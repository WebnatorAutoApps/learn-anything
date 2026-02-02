export { queryKeys } from "./keys";
export { fetchJSON, fetchFormData } from "./fetch";

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
  useSaveSettings,
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

export { useClickOutside } from "./useClickOutside";
export { useCourseCreation } from "./useCourseCreation";
export { useSettingsModal } from "./useSettingsModal";
export type { SettingsTab } from "./useSettingsModal";
export { useLogoutFlow } from "./useLogoutFlow";
export { useImageUpload } from "./useImageUpload";
