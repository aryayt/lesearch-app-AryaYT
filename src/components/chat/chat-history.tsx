import React from 'react'
import { ScrollArea } from '../ui/scroll-area';
import { useChatStore } from '@/store/useChatStore';
import { cn } from '@/lib/utils';
import useSWRInfinite from 'swr/infinite';
import { useUserStore } from '@/store/userStore';
import { usePanelStore } from '@/store/usePanelStore';
import { motion } from 'framer-motion';
import { getChatHistoryPaginationKey, type ChatHistory } from '@/app/(chat)/chatActions';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Failed to fetch chat history');
  }
  return res.json();
});

const RenderChatHistory = () => {
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const activeChatIds = useChatStore((state) => state.activeChatIds);
  const user = useUserStore((state) => state.user);
  const { activePageId } = usePanelStore();
  const activeChatId = activePageId ? activeChatIds[activePageId] || '' : '';

 const {
    data: paginatedChatHistories,
    setSize,
    isValidating,
    isLoading,
    // mutate,
    error,
  } = useSWRInfinite<ChatHistory>(
    (pageIndex, previousPageData) =>
      getChatHistoryPaginationKey(pageIndex, previousPageData, user?.id || '', activePageId || ''),
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: false,
    }
  );

  const hasReachedEnd = paginatedChatHistories
    ? paginatedChatHistories.some((page) => !page.hasMore)
    : false;

  const hasEmptyChatHistory = paginatedChatHistories
    ? paginatedChatHistories.every((page) => page.chats.length === 0)
    : false;

  if (isLoading) {
    return (
      <div className="min-h-[200px] h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>          
            <span className="text-sm text-muted-foreground">Loading history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <span className="text-muted-foreground text-sm">Failed to load chat history</span>
          <span className="text-xs text-muted-foreground/70">Please try again later</span>
        </div>
      </div>
    );
  }

  if (hasEmptyChatHistory) {
    return (
      <div className="min-h-[200px] h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <span className="text-muted-foreground text-sm">No chat history found</span>
          <span className="text-xs text-muted-foreground/70">Start a new chat to see it here</span>
        </div>
      </div>
    );
  }

  const allChats = paginatedChatHistories?.flatMap((page) => page.chats) ?? [];

  return (
    <ScrollArea className="h-full min-h-[200px] max-h-[400px]">
      <div className="divide-y divide-border">
        {allChats.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              "px-3 py-2 hover:bg-accent/50 cursor-pointer transition-colors",
              activeChatId === chat.id && "bg-accent/50"
            )}
            onClick={() => setActiveChatId(chat.id)}
          >
            <div className="flex flex-col gap-0.5">
              <h3 className="font-medium text-foreground line-clamp-1">{chat.title}</h3>
              <span className="text-xs text-muted-foreground">
                {formatDate(chat.updated_at)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <motion.div
        onViewportEnter={() => {
          if (!isValidating && !hasReachedEnd) {
            setSize((size) => size + 1);
          }
        }}
      />

      {hasReachedEnd ? (
        <div className="px-2 py-4 text-center text-xs text-muted-foreground">
          You have reached the end of your chat history.
        </div>
      ) : (
        <div className="px-2 py-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          <span>Loading more chats...</span>
        </div>
      )}
    </ScrollArea>
  )
}

export default RenderChatHistory
