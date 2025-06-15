import { CoreAssistantMessage, CoreToolMessage} from "ai";
import { UIMessage } from "ai";

export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
    const userMessages = messages.filter((message) => message.role === 'user');
    return userMessages.at(-1);
  }

  type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };
export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}



export interface ChatHistoryItem {
  id: string;
  updated_at: string;
  title: string;
}

export interface ChatHistory {
  chats: ChatHistoryItem[];
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export const getChatHistoryPaginationKey = (
  pageIndex: number,
  previousPageData: ChatHistory | null,
  userId: string,
  documentId: string
) => {
  if (!userId || !documentId) return null;
  if (previousPageData && !previousPageData.hasMore) return null;

  if (pageIndex === 0) {
    return `/api/history?limit=${PAGE_SIZE}&userId=${userId}&documentId=${documentId}`;
  }

  const lastChat = previousPageData?.chats[previousPageData.chats.length - 1];
  if (!lastChat) return null;

  return `/api/history?limit=${PAGE_SIZE}&userId=${userId}&documentId=${documentId}&ending_before=${lastChat.id}`;
};


