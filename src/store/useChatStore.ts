import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import { usePanelStore } from './usePanelStore';
import { generateUUID } from "@/app/(chat)/chatActions";

type Store = {
  // Store activeChatId per page
  activeChatIds: Record<string, string>;
  isNewChat: boolean;
  setIsNewChat: (isNewChat: boolean) => void;
  setActiveChatId: (chatId: string) => void;
  getActiveChatId: () => Promise<string>;
};

export const useChatStore = create<Store>()(
  persist(
    (set, get) => ({
      activeChatIds: {},
      isNewChat: false,
      setIsNewChat: (isNewChat: boolean) => {
        set({ isNewChat });
      },
      setActiveChatId: (chatId: string) => {
        const activePageId = usePanelStore.getState().activePageId;
        if (!activePageId) return;
        
        set((state) => ({
          activeChatIds: {
            ...state.activeChatIds,
            [activePageId]: chatId,
          },
        }));
      },
      
      getActiveChatId: async () => {
        const activePageId = usePanelStore.getState().activePageId;
        if (!activePageId) return '';
        if(get().activeChatIds[activePageId]){
          return get().activeChatIds[activePageId];
        }
        // Fetch latest chatId when there's no active chat
        const latestChat = await fetch(`/api/history?limit=1&documentId=${activePageId}`);
        const latestChatData = await latestChat.json();
        if(latestChatData.chats?.[0]?.id){
          set((state) => ({
            activeChatIds: {
              ...state.activeChatIds,
              [activePageId]: latestChatData.chats[0].id,
            },
          }));
          set({ isNewChat: false });
          return latestChatData.chats[0].id;
        }
        //Else generate new chat ID
        const newChatId = generateUUID();
        set((state) => ({
          activeChatIds: {
            ...state.activeChatIds,
            [activePageId]: newChatId,
          },
          isNewChat: true,
        }));
        return newChatId;
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeChatIds: state.activeChatIds,
      }),
    }
  )
);
