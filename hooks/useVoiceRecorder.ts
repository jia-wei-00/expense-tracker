import {
  AudioModule,
  AudioQuality,
  IOSOutputFormat,
  RecordingOptions,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";

const MAX_BYTES = 3 * 1024 * 1024;
const AUDIO_BUCKET = "chat-audio";

// Smallest practical voice setting: mono, low sample rate and bitrate AAC in an
// .m4a container — kept identical on both platforms so the stored MIME stays
// audio/mp4. A few minutes of speech land well under the 3MB cap.
const VOICE_RECORDING_OPTIONS: RecordingOptions = {
  extension: ".m4a",
  sampleRate: 22050,
  numberOfChannels: 1,
  bitRate: 24000,
  android: {
    outputFormat: "mpeg4",
    audioEncoder: "aac",
  },
  ios: {
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.MIN,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/mp4",
    bitsPerSecond: 24000,
  },
};

async function uploadAudio(uri: string): Promise<string> {
  const file = new FileSystem.File(uri);
  const base64 = await file.base64();
  const byteCharacters = atob(base64);
  const byteArray = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }

  if (byteArray.byteLength > MAX_BYTES) {
    throw new Error("Recording exceeds the 3MB limit.");
  }

  // The bucket's RLS policy requires the first path segment to be the user's
  // id (each user can only write to their own folder).
  const userId = useSessionStore.getState().getUserId();
  if (!userId) throw new Error("You must be signed in to send a voice message.");

  const filename = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.m4a`;

  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(filename, byteArray, { contentType: "audio/mp4" });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(filename);

  return publicUrl;
}

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(VOICE_RECORDING_OPTIONS);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const startRecording = async (): Promise<boolean> => {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) return false;

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
    return true;
  };

  // Stop, upload to the bucket, and return the public URL.
  const stopAndUpload = async (): Promise<string | null> => {
    if (!isRecording) return null;
    await recorder.stop();
    setIsRecording(false);
    // Reset the audio session so playback isn't routed to the iOS earpiece.
    await setAudioModeAsync({ allowsRecording: false });

    const uri = recorder.uri;
    if (!uri) return null;

    setIsUploadingAudio(true);
    try {
      return await uploadAudio(uri);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // Stop and discard without uploading.
  const cancelRecording = async (): Promise<void> => {
    if (!isRecording) return;
    try {
      await recorder.stop();
    } catch {
      // ignore — recorder may already be stopped
    }
    setIsRecording(false);
    await setAudioModeAsync({ allowsRecording: false });
  };

  return {
    isRecording,
    isUploadingAudio,
    startRecording,
    stopAndUpload,
    cancelRecording,
  };
}
