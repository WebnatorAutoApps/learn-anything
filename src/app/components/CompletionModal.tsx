"use client";

import { useState } from "react";
import {
  useCompleteProject,
  useUploadCompletionImage,
  useImageUpload,
  type UpcomingProject,
} from "@/lib/hooks";
import { MAX_COMMENT_LENGTH } from "@/lib/constants/validation";
import { useI18n } from "@/lib/i18n";
import Spinner from "./ui/Spinner";

interface CompletionModalProps {
  project: UpcomingProject;
  onClose: () => void;
  onCompleted: () => void;
}

export default function CompletionModal({
  project,
  onClose,
  onCompleted,
}: CompletionModalProps) {
  const { t } = useI18n();
  const cm = t.completion as Record<string, string>;
  const c = t.common as Record<string, string>;
  const completeMutation = useCompleteProject();
  const uploadMutation = useUploadCompletionImage();
  const [comment, setComment] = useState("");
  const {
    selectedFile,
    imagePreview,
    fileError,
    fileInputRef,
    handleFileChange,
    clearFile,
  } = useImageUpload();

  const isSubmitting = completeMutation.isPending || uploadMutation.isPending;

  async function handleSubmit() {
    let imageUrl: string | undefined;

    if (selectedFile) {
      try {
        imageUrl = await uploadMutation.mutateAsync(selectedFile);
      } catch {
        return;
      }
    }

    await completeMutation.mutateAsync({
      courseId: project.courseId,
      moduleId: project.moduleId,
      comment: comment.trim() || undefined,
      imageUrl,
    });

    onCompleted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg border border-theme-border bg-theme-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-theme-primary mb-1">
          {cm.title || "Complete Step"}
        </h3>
        <p className="text-sm text-theme-muted mb-4">
          {project.courseName} — {project.moduleName}
        </p>

        {/* Comment textarea */}
        <div className="mb-4">
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

        {/* Image upload */}
        <div className="mb-4">
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

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-theme-border text-theme-primary hover:bg-theme-surface-hover transition-colors text-sm font-medium disabled:opacity-50"
          >
            {c.cancel || "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-theme-accent text-theme-text-on-accent font-semibold text-sm hover:bg-theme-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                {uploadMutation.isPending ? (cm.uploadingImage || "Uploading...") : (cm.completing || "Completing...")}
              </>
            ) : (
              (cm.markCompleted || "Mark as Completed")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
