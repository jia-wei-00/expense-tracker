export interface IChatBubble {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}
