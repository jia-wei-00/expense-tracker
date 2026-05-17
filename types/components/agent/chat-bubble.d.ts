import type { TMessageContentPart } from "@/types/hooks/use-agent";

export interface IChatBubble {
  role: "user" | "assistant";
  content: string | TMessageContentPart[];
  isLoading?: boolean;
}
