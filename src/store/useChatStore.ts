import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import { usePanelStore } from './usePanelStore';

type Store = {
  // Store activeChatId per page
  activeChatIds: Record<string, string>;
  setActiveChatId: (chatId: string) => void;
  getActiveChatId: () => string;
};

export const useChatStore = create<Store>()(
  persist(
    (set, get) => ({
      activeChatIds: {},
      
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
      
      getActiveChatId: () => {
        const activePageId = usePanelStore.getState().activePageId;
        if (!activePageId) return '';
        return get().activeChatIds[activePageId] || '';
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
