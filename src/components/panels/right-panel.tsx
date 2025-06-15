import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import RenderChatHistory from '../chat/chat-history';
import RenderChat from '../chat/render-chat';
import { Card } from "@/components/ui/card";
import { useChatStore } from '@/store/useChatStore';
import useSWR from 'swr';
import { getChatById } from '@/lib/db/queries';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { usePanelStore } from '@/store/usePanelStore';
import { generateUUID } from '@/app/(chat)/chatActions';
import { ChatHeader } from '../chat/chat-header';

const RightPanel = () => {
  // Panel state
  const [showHistory, setShowHistory] = useState(false);
  const historyCardRef = useRef<HTMLDivElement>(null);
  
  // Chat state
  const { setActiveChatId, activeChatIds } = useChatStore();
  const { activePageId } = usePanelStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Current chat state
  const activeChatId = activePageId ? activeChatIds[activePageId] : '';
  const [chatState, setChatState] = useState<{
    id: string;
    title: string | undefined;
    isNew: boolean;
  }>({
    id: '',
    title: undefined,
    isNew: true
  });

  // Fetch chat details only for existing chats
  const { data: chatDetails } = useSWR(
    activeChatId && !chatState.isNew ? `/api/chat/${activeChatId}` : null,
    async () => {
      if (!activeChatId) return null;
      return await getChatById(activeChatId);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      refreshInterval: 0,
      key: `${activePageId}-${activeChatId}`,
      revalidateIfStale: false
    }
  );

  // Initialize chat when page changes
  useEffect(() => {
    if (!activePageId) return;
    
    if (activeChatId) {
      setChatState({
        id: activeChatId,
        title: undefined,
        isNew: false
      });
    } else {
      const newId = generateUUID();
      setChatState({
        id: newId,
        title: undefined,
        isNew: true
      });
      setActiveChatId(newId);
    }
  }, [activePageId, activeChatId, setActiveChatId]);

  // Update chat state when details are loaded
  useEffect(() => {
    if (chatDetails?.title && !chatState.isNew) {
      setChatState(prev => ({
        ...prev,
        title: chatDetails.title
      }));
    }
  }, [chatDetails?.title, chatState.isNew]);

  // Handle new chat creation
  const handleNewChat = useCallback(() => {
    if (!activePageId) return;
    
    const newId = generateUUID();
    setChatState({
      id: newId,
      title: undefined,
      isNew: true
    });
    setActiveChatId(newId);
    setShowHistory(false);
  }, [activePageId, setActiveChatId]);

  // Handle chat deletion
  const handleDeleteChat = useCallback(async () => {
    if (!activeChatId || !activePageId) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/chat/${activeChatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      const newId = generateUUID();
      setChatState({
        id: newId,
        title: undefined,
        isNew: true
      });
      setActiveChatId(newId);
      setShowDeleteDialog(false);
      
      toast.success('Chat deleted successfully', {
        duration: 2000,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat');
    } finally {
      setIsDeleting(false);
    }
  }, [activeChatId, activePageId, setActiveChatId]);

  // Handle history panel click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as Element).closest('button[aria-label="Chat History"]')) {
        return;
      }
      
      if (historyCardRef.current && !historyCardRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Card className="flex flex-col h-full w-full gap-1 relative">
      <ChatHeader 
        key={chatState.id}
        onHistoryClick={() => setShowHistory(prev => !prev)} 
        showHistory={showHistory} 
        onNewChatClick={handleNewChat}
        onDeleteClick={() => setShowDeleteDialog(true)}
        chatTitle={chatState.isNew ? undefined : chatState.title}
        isDeleting={isDeleting}
      />
      
      {/* Main Chat Area */}
      <div className="flex flex-col h-full">
        <RenderChat newChatId={chatState.id} />
      </div>

      {/* History Card */}
      {showHistory && (
        <Card ref={historyCardRef} className="absolute right-0 top-8 w-80 shadow-lg border rounded-md">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              <RenderChatHistory />
            </div>
          </div>
        </Card>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChat}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

RightPanel.displayName = 'RightPanel';
export default memo(RightPanel);