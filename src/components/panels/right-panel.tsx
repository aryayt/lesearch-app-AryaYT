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
  const [showHistory, setShowHistory] = useState(false);
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const activeChatId = useChatStore((state) => state.getActiveChatId());
  const activePageId = usePanelStore((state) => state.activePageId);
  const historyCardRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [newChatId, setNewChatId] = useState<string>('');
  const [currentChatTitle, setCurrentChatTitle] = useState<string | undefined>(undefined);

  // Handle page changes
  useEffect(() => {
    if (!activePageId) return;

    const handlePageChange = async () => {
      setIsPageTransitioning(true);
      try {
        // Reset chat state
        setActiveChatId('');
        setShowHistory(false);
        setShowDeleteDialog(false);
        setIsDeleting(false);
        setNewChatId(generateUUID());
        setCurrentChatTitle(undefined);
      } finally {
        // Small delay to ensure state updates are processed
        setTimeout(() => {
          setIsPageTransitioning(false);
        }, 100);
      }
    };

    handlePageChange();
  }, [activePageId, setActiveChatId]);

  // Generate new chat ID when activeChatId is empty
  useEffect(() => {
    if (activeChatId === '' && activePageId && !isPageTransitioning) {
      setNewChatId(generateUUID());
    }
  }, [activeChatId, activePageId, isPageTransitioning]);

  const { data: chatDetails, mutate: mutateChatDetails } = useSWR(
    activeChatId && activePageId && !isPageTransitioning ? `/api/chat/${activeChatId}` : null,
    async () => {
      if (!activeChatId || !activePageId || isPageTransitioning) return null;
      const data = await getChatById(activeChatId);
      return data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      refreshInterval: 0,
      key: `${activePageId}-${activeChatId}-${isPageTransitioning}`,
    }
  );

  // Update currentChatTitle when chatDetails changes
  useEffect(() => {
    if (chatDetails?.title !== undefined) {
      setCurrentChatTitle(chatDetails.title);
    }
  }, [chatDetails?.title]);

  // Revalidate chat details when activeChatId changes
  useEffect(() => {
    if (activeChatId && activePageId && !isPageTransitioning) {
      mutateChatDetails(undefined, { revalidate: true });
    }
  }, [activeChatId, activePageId, isPageTransitioning, mutateChatDetails]);

  const handleNewChat = useCallback(() => {
    if (!activePageId || isPageTransitioning) return;
    setActiveChatId('');
    setShowHistory(false);
    setCurrentChatTitle(undefined);
  }, [activePageId, isPageTransitioning, setActiveChatId]);

  const handleHistoryClick = useCallback(() => {
    if (isPageTransitioning) return;
    setShowHistory(prev => !prev);
  }, [isPageTransitioning]);

  const handleDeleteChat = useCallback(async () => {
    if (!activeChatId || !activePageId || isPageTransitioning) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/chat/${activeChatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      setActiveChatId('');
      setShowDeleteDialog(false);
      setCurrentChatTitle(undefined);
      setNewChatId(generateUUID());
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
  }, [activeChatId, activePageId, isPageTransitioning, setActiveChatId]);

  // Handle click outside for history panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPageTransitioning) return;
      
      // Don't close if clicking the history button
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
  }, [isPageTransitioning]);

  return (
    <Card className="flex flex-col h-full w-full gap-1 relative">
      <ChatHeader 
        onHistoryClick={handleHistoryClick} 
        showHistory={showHistory} 
        onNewChatClick={handleNewChat}
        onDeleteClick={() => setShowDeleteDialog(true)}
        chatTitle={currentChatTitle}
        isDeleting={isDeleting}
      />
      
      {/* Main Chat Area */}
      <div className="flex flex-col h-full">
        <RenderChat newChatId={newChatId} />
      </div>

      {/* History Card */}
      {showHistory && !isPageTransitioning && (
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