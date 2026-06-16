export interface IChatInput {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  isDisabled: boolean;
  pendingImageUrl: string | null;
  isUploading: boolean;
  onPickImage: () => void;
  onRemoveImage: () => void;
  onScanReceipt: () => void;
  isRecording: boolean;
  isUploadingAudio: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
}
