"use client";

import { useState } from "react";
import {
  useImageUpload,
  useCompleteProject,
  useUploadCompletionImage,
  type Module,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import Spinner from "@/app/components/ui/Spinner";
import { formatDate } from "@/lib/utils";
import { MAX_COMMENT_LENGTH } from "@/lib/constants/validation";

interface ProjectCompletionFormProps {
  mod: Module;
  courseId: string;
}

export default function ProjectCompletionForm({ mod, courseId }: ProjectCompletionFormProps) {
  const { t } = useI18n();
  const cm = t.completion as Record<string, string>;

  const completeMutation = useCompleteProject();
  const uploadMutation = useUploadCompletionImage();
  const {
    selectedFile,
    imagePreview,
    fileError,
    fileInputRef,
    handleFileChange,
    clearFile,
  } = useImageUpload();

  const [comment, setComment] = useState("");

  const selection = mod.selectedProject;
  const isCompleted = selection?.completed ?? false;
  const isSubmitting = completeMutation.isPending || uploadMutation.isPending;

  async function handleComplete() {
    let imageUrl: string | undefined;

    if (selectedFile) {
      try {
        imageUrl = await uploadMutation.mutateAsync(selectedFile);
      } catch {
        return;
      }
    }

    await completeMutation.mutateAsync({
      courseId,
      moduleId: mod.id,
      comment: comment.trim() || undefined,
      imageUrl,
    });

    setComment("");
    clearFile();
  }

  if (isCompleted) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-theme-secondary text-sm">
          <svg
            className="h-5 w-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">
            {cm.projectCompleted || "Project completed"}
            {selection?.completedAt && (
              <span className="text-theme-muted font-normal ml-1">
                — {formatDate(selection.completedAt.slice(0, 10))}
              </span>
            )}
          </span>
        </div>

        {selection?.comment && (
          <div className="rounded border border-theme-border bg-theme-surface p-3">
            <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">
              {cm.yourComment || "Your Comment"}
            </p>
            <p className="text-sm text-theme-secondary leading-relaxed whitespace-pre-wrap">
              {selection.comment}
            </p>
          </div>
        )}

        {selection?.imageUrl && (
          <div className="rounded border border-theme-border bg-theme-surface p-3">
            <p className="text-xs text-theme-muted uppercase tracking-wider mb-2">
              {cm.uploadedImage || "Uploaded Image"}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selection.imageUrl}
              alt="Completion submission"
              className="max-w-full max-h-64 rounded border border-theme-border object-contain"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-theme-muted uppercase tracking-wider mb-1">
          {cm.commentLabel || "Comment (optional)"}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={MAX_COMMENT_LENGTH}
          placeholder={cm.commentPlaceholder || "Share your thoughts on this project..."}
          rows={3}
          className="w-full rounded border border-theme-border bg-theme-surface text-theme-primary text-sm px-3 py-2 placeholder:text-theme-primary-faint focus:outline-none focus:border-theme-primary resize-y"
          disabled={isSubmitting}
        />
        <p className="text-xs text-theme-primary-faint mt-0.5 text-right">
          {comment.length}/{MAX_COMMENT_LENGTH}
        </p>
      </div>

      <div>
        <label className="block text-xs text-theme-muted uppercase tracking-wider mb-1">
          {cm.imageLabel || "Image (optional)"}
        </label>

        {imagePreview ? (
          <div className="space-y-2">
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full max-h-48 rounded border border-theme-border object-contain"
              />
              <button
                onClick={clearFile}
                disabled={isSubmitting}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-900/80 border border-red-700/50 text-red-400 flex items-center justify-center text-xs hover:bg-red-800/80 transition-colors disabled:opacity-50"
                aria-label={cm.removeImage || "Remove image"}
              >
                X
              </button>
            </div>
            <p className="text-xs text-theme-muted">
              {selectedFile?.name}
            </p>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded border border-dashed border-theme-border bg-theme-surface text-theme-muted text-sm hover:bg-theme-surface-hover hover:border-theme-border-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cm.uploadImage || "Click to upload an image (JPEG, PNG, WebP, max 10 MB)"}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {fileError && (
          <p className="text-xs text-red-400 mt-1">{fileError}</p>
        )}

        {uploadMutation.isError && (
          <p className="text-xs text-red-400 mt-1">
            {cm.uploadFailed || "Upload failed:"} {uploadMutation.error?.message || (cm.unknownError || "Unknown error")}. {cm.tryAgain || "Please try again."}
          </p>
        )}
      </div>

      <button
        onClick={handleComplete}
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 rounded-lg border border-theme-primary bg-theme-surface-hover text-theme-primary font-medium text-sm hover:bg-theme-surface-hover hover:border-theme-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner />
            {uploadMutation.isPending ? (cm.uploadingImage || "Uploading...") : (cm.markingComplete || "Marking...")}
          </span>
        ) : (
          (cm.markCompleted || "Mark as Completed")
        )}
      </button>
    </div>
  );
}
