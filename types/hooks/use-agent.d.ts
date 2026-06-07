export type TMessageContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type TMessage = {
  role: "user" | "assistant";
  content: string | TMessageContentPart[];
};

export type TDisplayMessage = TMessage & { isLoading?: boolean };

export type TPendingToolCall = {
  toolName: "addExpense" | "deleteExpense";
  args: {
    // addExpense fields
    name?: string;
    amount?: number;
    category?: number;
    is_expense?: boolean;
    spend_date?: string;
    // deleteExpense fields
    id?: number;
  };
};

export type TAiChatResponse = {
  message: string | null;
  pendingToolCalls: TPendingToolCall[] | null;
  sessionId: string | null;
};

export type TAttachment = {
  url: string;
  contentType: string;
  name?: string;
};

export type TChatRequest = {
  message: string;
  attachments?: TAttachment[];
  sessionId?: string;
  analyticsMode?: boolean;
};
