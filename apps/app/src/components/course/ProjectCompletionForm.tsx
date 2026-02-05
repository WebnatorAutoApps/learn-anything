import React, { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useUploadCompletionImage } from "@learn-anything/shared";
import { useImagePicker } from "../../hooks";
import { Button, TextArea } from "../ui";

interface ProjectCompletionFormProps {
  onComplete: (comment?: string, imageUrl?: string) => void;
  isLoading: boolean;
}

export default function ProjectCompletionForm({
  onComplete,
  isLoading,
}: ProjectCompletionFormProps) {
  const [comment, setComment] = useState("");
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const { pickFromGallery, takePhoto, isPickerOpen } = useImagePicker({
    allowsEditing: false,
    quality: 0.8,
  });
  const uploadMutation = useUploadCompletionImage();

  const isSubmitting = isLoading || uploadMutation.isPending;

  async function handlePickGallery() {
    const blob = await pickFromGallery();
    if (blob) {
      setImageBlob(blob);
      setImagePreviewUri(URL.createObjectURL(blob));
    }
  }

  async function handleTakePhoto() {
    const blob = await takePhoto();
    if (blob) {
      setImageBlob(blob);
      setImagePreviewUri(URL.createObjectURL(blob));
    }
  }

  function handleRemoveImage() {
    setImageBlob(null);
    setImagePreviewUri(null);
  }

  async function handleSubmit() {
    let imageUrl: string | undefined;
    if (imageBlob) {
      try {
        imageUrl = await uploadMutation.mutateAsync(imageBlob);
      } catch {
        // upload failed — still allow completion without image
      }
    }
    onComplete(comment || undefined, imageUrl);
  }

  return (
    <View className="mt-3">
      <Text className="font-mono text-xs text-theme-muted uppercase tracking-wider mb-1">
        {"// "}Add a note about what you learned (optional)
      </Text>
      <TextArea
        value={comment}
        onChangeText={setComment}
        placeholder="What did you learn or build?"
        className="mb-3 min-h-[60px]"
      />

      {imagePreviewUri ? (
        <View className="mb-3">
          <Text className="font-mono text-xs text-theme-muted mb-1">
            {"// "}Attached image:
          </Text>
          <Image
            source={{ uri: imagePreviewUri }}
            className="w-full h-40"
            resizeMode="cover"
          />
          <Pressable onPress={handleRemoveImage} className="mt-1">
            <Text className="font-mono text-xs text-theme-error">[REMOVE]</Text>
          </Pressable>
        </View>
      ) : (
        <View className="mb-3">
          <Text className="font-mono text-xs text-theme-muted uppercase tracking-wider mb-1">
            {"// "}Attach a screenshot of your work (optional)
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={handlePickGallery}
              disabled={isPickerOpen}
              className="border border-theme-primary/30 px-2 py-1.5"
            >
              <Text className="font-mono text-xs text-theme-primary">
                [GALLERY]
              </Text>
            </Pressable>
            <Pressable
              onPress={handleTakePhoto}
              disabled={isPickerOpen}
              className="border border-theme-primary/30 px-2 py-1.5"
            >
              <Text className="font-mono text-xs text-theme-primary">
                [CAMERA]
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <Button onPress={handleSubmit} loading={isSubmitting}>
        [MARK COMPLETE]
      </Button>
    </View>
  );
}
