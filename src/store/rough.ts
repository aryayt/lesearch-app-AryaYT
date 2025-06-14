import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatState, ChatWithMessages, Message } from '@/types/chat';
import {
  createChat,
  getChat,
  getChatHistory,
  createMessageBranch,
  createMessage,
  getMessagesByBranch,
  subscribeToMessages,
} from '@/app/(chat)/chatActions';
import { useUserStore } from './userStore';

interface ChatStore extends ChatState {
  // Computed properties
  activeChat: ChatWithMessages | null;
  messages: Message[];
  
  // Actions
  initializeChat: (documentId: string) => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  createNewChat: (title: string, documentId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  switchBranch: (messageId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  clearError: () => void;
}

type PersistedState = Pick<ChatState, 'activeChatId' | 'activeBranchId' | 'chats' | 'history'>;

export const useChatStoreRough = create(
  persist<ChatStore, [], [], PersistedState>(
    (set, get) => ({
      // Initial state
      activeChatId: null,
      activeBranchId: null,
      chats: {} as Record<string, ChatWithMessages>,
      history: [],
      error: null,
      isLoading: false,

      // Computed properties
      get activeChat() {
        const { activeChatId, chats } = get();
        return activeChatId ? chats[activeChatId] || null : null;
      },

      get messages() {
        const { activeChat } = get();
        return activeChat?.messages || [];
      },

      // Actions
      initializeChat: async (documentId: string) => {
        set({ isLoading: true, error: null });
        try {
          const history = await getChatHistory(documentId);
          set({ history });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load chat history' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadChat: async (chatId: string) => {
        set({ isLoading: true, error: null });
        try {
          const chat = await getChat(chatId);
          set((state) => ({
            chats: {
              ...state.chats,
              [chatId]: chat,
            },
            activeChatId: chatId,
            activeBranchId: chat.activeBranch.id,
          }));

          // Subscribe to real-time updates
          subscribeToMessages(chat.activeBranch.id, (message) => {
            set((state) => {
              const chat = state.chats[chatId];
              if (!chat) return state;

              return {
                chats: {
                  ...state.chats,
                  [chatId]: {
                    ...chat,
                    messages: [...chat.messages, message],
                  },
                },
              };
            });
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load chat' });
        } finally {
          set({ isLoading: false });
        }
      },

      createNewChat: async (title: string, documentId: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = useUserStore.getState().user;
          if (!user) throw new Error('User not found');

          const chat = await createChat(title, {
            documentId,
            userId: user.id,
          });

          // Create initial branch and load chat
          await createMessageBranch(chat.id, '');
          await get().loadChat(chat.id);

          // Update history
          const history = await getChatHistory(documentId);
          set({ history });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create chat' });
        } finally {
          set({ isLoading: false });
        }
      },

      sendMessage: async (content: string) => {
        const { activeChatId, activeBranchId } = get();
        if (!activeChatId || !activeBranchId) {
          set({ error: 'No active chat or branch' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const message = await createMessage(
            {
              chat_id: activeChatId,
              branch_id: activeBranchId,
              role: 'user',
              content: { text: content },
              parent_message_id: null,
              is_active: true,
            },
            {
              chatId: activeChatId,
              branchId: activeBranchId,
            }
          );

          // Update local state
          set((state) => {
            const chat = state.chats[activeChatId];
            if (!chat) return state;

            return {
              chats: {
                ...state.chats,
                [activeChatId]: {
                  ...chat,
                  messages: [...chat.messages, message],
                },
              },
            };
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to send message' });
        } finally {
          set({ isLoading: false });
        }
      },

      switchBranch: async (messageId: string) => {
        const { activeChatId } = get();
        if (!activeChatId) {
          set({ error: 'No active chat' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const branch = await createMessageBranch(activeChatId, messageId);
          const messages = await getMessagesByBranch(branch.id);

          set((state) => {
            const chat = state.chats[activeChatId];
            if (!chat) return state;

            return {
              chats: {
                ...state.chats,
                [activeChatId]: {
                  ...chat,
                  messages,
                  activeBranch: branch,
                },
              },
              activeBranchId: branch.id,
            };
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to switch branch' });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteChat: async (chatId: string) => {
        try {
          const response = await fetch(`/api/chat?chatId=${chatId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete chat');
          }

          set((state) => ({
            history: state.history.filter((chat) => chat.id !== chatId),
            chats: state.chats.filter((chat) => chat.id !== chatId),
            activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
            activeBranchId: state.activeChatId === chatId ? null : state.activeBranchId,
          }));
        } catch (error) {
          console.error('Error deleting chat:', error);
          set({ error: 'Failed to delete chat' });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeChatId: state.activeChatId,
        activeBranchId: state.activeBranchId,
        chats: state.chats,
        history: state.history,
      }),
    }
  )
);


import { createClient } from '@/lib/supabase/client';
import type {
  Chat,
  ChatWithMessages,
  Message,
  MessageBranch,
  ChatHistoryItem,
  ChatContext,
  MessageContext,
} from '@/types/chat';

const supabase = createClient();

interface ChatWithFile {
  id: string;
  title: string;
  last_message_at: string;
  document_id: string;
  files: {
    name: string;
  } | null;
}

// Chat Operations
export async function createChat(
  title: string,
  context: ChatContext
): Promise<Chat> {
  const { data, error } = await supabase
    .from('chats')
    .insert({
      title,
      user_id: context.userId,
      document_id: context.documentId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChat(id: string): Promise<ChatWithMessages> {
  // Get chat details
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select()
    .eq('id', id)
    .single();

  if (chatError) throw chatError;

  // Get active branch
  const { data: branch, error: branchError } = await supabase
    .from('message_branches')
    .select()
    .eq('chat_id', id)
    .eq('is_active', true)
    .single();

  if (branchError) throw branchError;

  // Get messages for the branch
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select()
    .eq('branch_id', branch.id)
    .order('created_at', { ascending: true });

  if (messagesError) throw messagesError;

  return {
    ...chat,
    messages,
    activeBranch: branch,
  };
}

export async function getChatHistory(
  documentId: string
): Promise<ChatHistoryItem[]> {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      title,
      last_message_at,
      document_id,
      files:document_id (
        name
      )
    `)
    .eq('document_id', documentId)
    .order('last_message_at', { ascending: false });

  if (error) throw error;

  return (data as unknown as ChatWithFile[]).map((chat) => ({
    id: chat.id,
    title: chat.title,
    last_message_at: chat.last_message_at,
    document_id: chat.document_id,
    document_name: chat.files?.name || 'Untitled Document',
  }));
}

// Message Branch Operations
export async function createMessageBranch(
  chatId: string,
  rootMessageId: string
): Promise<MessageBranch> {
  // First, deactivate all existing branches
  await supabase
    .from('message_branches')
    .update({ is_active: false })
    .eq('chat_id', chatId);

  // Create new branch
  const { data, error } = await supabase
    .from('message_branches')
    .insert({
      chat_id: chatId,
      root_message_id: rootMessageId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getActiveBranch(chatId: string): Promise<MessageBranch> {
  const { data, error } = await supabase
    .from('message_branches')
    .select()
    .eq('chat_id', chatId)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

// Message Operations
export async function createMessage(
  message: Omit<Message, 'id' | 'created_at'>,
  context: MessageContext
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;

  // Update chat's last_message_at
  await supabase
    .from('chats')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', context.chatId);

  return data;
}

export async function getMessagesByBranch(
  branchId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select()
    .eq('branch_id', branchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Real-time subscriptions
export function subscribeToMessages(
  branchId: string,
  callback: (message: Message) => void
) {
  return supabase
    .channel(`messages:${branchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `branch_id=eq.${branchId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
}

export function subscribeToChatHistory(
  documentId: string,
  callback: (chat: ChatHistoryItem) => void
) {
  return supabase
    .channel(`chats:${documentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `document_id=eq.${documentId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new as ChatHistoryItem);
        }
      }
    )
    .subscribe();
} 
