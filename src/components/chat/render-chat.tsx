import React, { useEffect, useState } from 'react'
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
  const getActiveChatId = useChatStore((state) => state.getActiveChatId);
  const activeChatIds = useChatStore((state) => state.activeChatIds);
  const activePageId = usePanelStore((state) => state.activePageId);
  const [currentChatId, setCurrentChatId] = useState<string>('');

  // Initialize chat ID
  useEffect(() => {
    const initializeChat = async () => {
      if (!activePageId) return;
      
      const chatId = await getActiveChatId();
      setCurrentChatId(chatId);
    };

    initializeChat();
  }, [activePageId, getActiveChatId]);

  // Update currentChatId when activeChatIds changes
  useEffect(() => {
    if (activePageId && activeChatIds[activePageId]) {
      setCurrentChatId(activeChatIds[activePageId]);
    }
  }, [activePageId, activeChatIds]);

  const { data: messages, error, isLoading } = useSWR(
    currentChatId && currentChatId !== '' && activePageId ? `/api/messages?chatId=${currentChatId}` : null,
    fetcher
  );

  // Set new chat ID when it's provided
  useEffect(() => {
    if (currentChatId === '' && newChatId && activePageId) {
      setActiveChatId(newChatId);
      setCurrentChatId(newChatId);
    }
  }, [currentChatId, newChatId, setActiveChatId, activePageId]);

  // If no activePageId, show empty state
  if (!activePageId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a document to start chatting
      </div>
    );
  }

  // If currentChatId is empty string, show new chat
  if (currentChatId === '') {
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

  // If no currentChatId, show loading state
  if (!currentChatId) {
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
      key={currentChatId}
      id={currentChatId}
      initialMessages={messages || []}
      selectedChatModel={DEFAULT_CHAT_MODEL}
      isReadonly={false}
    />
  );
}
