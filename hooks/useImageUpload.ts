import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const MAX_BYTES = 8 * 1024 * 1024;

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const pickAndUpload = async (): Promise<string | null> => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];

    const context = ImageManipulator.ImageManipulator.manipulate(asset.uri);
    context.resize({ width: Math.min(asset.width ?? 1920, 1920) });
    const rendered = await context.renderAsync();
    const compressed = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.8,
    });

    const file = new FileSystem.File(compressed.uri);
    const base64 = await file.base64();
    const byteCharacters = atob(base64);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }

    if (byteArray.byteLength > MAX_BYTES) {
      throw new Error("Image exceeds 8MB limit after compression.");
    }

    setIsUploading(true);
    try {
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

      const { error } = await supabase.storage
        .from("chat-images")
        .upload(filename, byteArray, { contentType: "image/jpeg" });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-images").getPublicUrl(filename);

      return publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  return { pickAndUpload, isUploading };
}
