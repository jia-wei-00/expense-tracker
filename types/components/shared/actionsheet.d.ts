export interface IActionsheetProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  isLoading?: boolean;
  onClose: () => void;
  primaryButtonLabel: string;
  secondaryButtonLabel?: string;
  primaryButtonAction: () => void;
  secondaryButtonAction?: () => void;
  children?: React.ReactNode;
}
