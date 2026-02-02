import { useState, useRef } from "react";
import {
  MAX_COMPLETION_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/constants/validation";

export function useImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError("Invalid file type. Accepted formats: JPEG, PNG, WebP");
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_COMPLETION_FILE_SIZE) {
      setFileError("File too large. Maximum size is 10 MB");
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function clearFile() {
    setSelectedFile(null);
    setImagePreview(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return {
    selectedFile,
    imagePreview,
    fileError,
    fileInputRef,
    handleFileChange,
    clearFile,
  };
}
