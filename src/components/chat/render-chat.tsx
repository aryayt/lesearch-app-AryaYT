import React, { useEffect } from 'react'
import { Chat } from './chat';
import { useChatStore } from '@/store/useChatStore';
import useSWR from 'swr';
import { usePanelStore } from '@/store/usePanelStore';

export const DEFAULT_CHAT_MODEL: string = 'chat-model';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Failed to fetch messages');
  }
  return res.json();
});

interface RenderChatProps {
  newChatId: string;
}

export default function RenderChat({ newChatId }: RenderChatProps) {
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const activeChatId = useChatStore((state) => state.getActiveChatId());
  const activePageId = usePanelStore((state) => state.activePageId);

  // Reset chat when page changes
  useEffect(() => {
    if (activePageId) {
      setActiveChatId('');
    }
  }, [activePageId, setActiveChatId]);

  const { data: messages, error, isLoading } = useSWR(
    activeChatId && activeChatId !== '' && activePageId ? `/api/messages?chatId=${activeChatId}` : null,
    fetcher
  );

  console.log('activeChatId', activeChatId, 'activePageId', activePageId);

  // Fetch latest chat when there's no active chat
  const { data: latestChat } = useSWR(
    !activeChatId && activeChatId !== '' && activePageId ? `/api/history?limit=1&documentId=${activePageId}` : null,
    fetcher
  );

  useEffect(() => {
    if (!activeChatId && activeChatId !== '' && latestChat?.chats?.[0]?.id && activePageId) {
      setActiveChatId(latestChat.chats[0].id);
    }
  }, [activeChatId, latestChat, setActiveChatId, activePageId]);

  // Set new chat ID when it's provided
  useEffect(() => {
    if (activeChatId === '' && newChatId && activePageId) {
      setActiveChatId(newChatId);
    }
  }, [activeChatId, newChatId, setActiveChatId, activePageId]);

  // If no activePageId, show empty state
  if (!activePageId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a document to start chatting
      </div>
    );
  }

  // If activeChatId is empty string, show new chat
  if (activeChatId === '') {
    return (
      <Chat
        key={newChatId}
        id={newChatId}
        initialMessages={[]}
        selectedChatModel={DEFAULT_CHAT_MODEL}
        isReadonly={false}
      />
    );
  }

  // If no activeChatId, show loading state
  if (!activeChatId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Failed to load messages
      </div>
    );
  }

  return (
    <Chat
      key={activeChatId}
      id={activeChatId}
      initialMessages={messages || []}
      selectedChatModel={DEFAULT_CHAT_MODEL}
      isReadonly={false}
    />
  );
}
