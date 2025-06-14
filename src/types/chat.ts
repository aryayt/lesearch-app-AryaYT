import { type UIMessage } from 'ai';

export type MessageRole = 'user' | 'assistant';

export type MessageContent = {
  text: string;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
};

export type Vote = {
    chatId: string;
    messageId: string;
    isUpvoted: boolean;
}


export interface Message {
  id: string;
  chat_id: string;
  branch_id: string;
  role: MessageRole;
  content: MessageContent;
  parent_message_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MessageBranch {
  id: string;
  chat_id: string;
  root_message_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  user_id: string;
  document_id: string;
  is_active: boolean;
  last_message_at: string;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
  activeBranch: MessageBranch;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  last_message_at: string;
  document_id: string;
  document_name: string;
}

// Store Types
export interface ChatState {
  activeChatId: string | null;
  activeBranchId: string | null;
  chats: Record<string, ChatWithMessages>;
  history: ChatHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface CreateChatResponse {
  chat: Chat;
  branch: MessageBranch;
  message: Message;
}

export interface GetChatResponse {
  chat: ChatWithMessages;
}

export interface GetChatHistoryResponse {
  history: ChatHistoryItem[];
}

// Utility Types
export interface ChatContext {
  documentId: string;
  userId: string;
  chatId?: string;
  branchId?: string;
}

export interface MessageContext {
  chatId: string;
  branchId: string;
  parentMessageId?: string;
}

// Type guards
export function isMessage(message: unknown): message is Message {
  if (!message || typeof message !== 'object') return false;
  
  const msg = message as Message;
  return (
    typeof msg.id === 'string' &&
    typeof msg.chat_id === 'string' &&
    typeof msg.branch_id === 'string' &&
    typeof msg.role === 'string' &&
    ['user', 'assistant'].includes(msg.role) &&
    typeof msg.content === 'object' &&
    msg.content !== null &&
    'text' in msg.content &&
    typeof msg.content.text === 'string' &&
    typeof msg.is_active === 'boolean' &&
    typeof msg.created_at === 'string'
  );
}

export function isChat(chat: unknown): chat is Chat {
  if (!chat || typeof chat !== 'object') return false;
  
  const c = chat as Chat;
  return (
    typeof c.id === 'string' &&
    typeof c.created_at === 'string' &&
    typeof c.updated_at === 'string' &&
    typeof c.title === 'string' &&
    typeof c.user_id === 'string' &&
    typeof c.document_id === 'string' &&
    typeof c.is_active === 'boolean' &&
    typeof c.last_message_at === 'string'
  );
}

// Convert AI SDK message to our Message type
export function convertToMessage(
  uiMessage: UIMessage,
  context: MessageContext
): Omit<Message, 'id' | 'created_at'> {
  return {
    chat_id: context.chatId,
    branch_id: context.branchId,
    role: uiMessage.role as MessageRole,
    content: {
      text: typeof uiMessage.content === 'string' ? uiMessage.content : JSON.stringify(uiMessage.content),
      attachments: []
    },
    parent_message_id: context.parentMessageId || null,
    is_active: true,
  };
} 