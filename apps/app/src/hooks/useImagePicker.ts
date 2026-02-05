import { useState } from "react";
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

interface UseImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

export function useImagePicker(options: UseImagePickerOptions = {}) {
  const {
    allowsEditing = true,
    aspect = [1, 1],
    quality = 0.8,
  } = options;

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  async function pickFromGallery(): Promise<Blob | null> {
    setIsPickerOpen(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect,
        quality,
      });

      if (result.canceled || !result.assets[0]) return null;

      const response = await fetch(result.assets[0].uri);
      return await response.blob();
    } finally {
      setIsPickerOpen(false);
    }
  }

  async function takePhoto(): Promise<Blob | null> {
    if (Platform.OS === "web") return null;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return null;

    setIsPickerOpen(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing,
        aspect,
        quality,
      });

      if (result.canceled || !result.assets[0]) return null;

      const response = await fetch(result.assets[0].uri);
      return await response.blob();
    } finally {
      setIsPickerOpen(false);
    }
  }

  return {
    pickFromGallery,
    takePhoto,
    isPickerOpen,
  };
}
