export interface IChatInput {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  isDisabled: boolean;
}
