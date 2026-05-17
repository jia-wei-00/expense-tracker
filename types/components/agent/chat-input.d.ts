export interface IChatInput {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  isDisabled: boolean;
  pendingImageUrl: string | null;
  isUploading: boolean;
  onPickImage: () => void;
  onRemoveImage: () => void;
}
