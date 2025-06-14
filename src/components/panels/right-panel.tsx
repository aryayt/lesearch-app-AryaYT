import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import RenderChatHistory from '../chat/chat-history';
import RenderChat from '../chat/render-chat';
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from '../ui/button';
import { History, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/useChatStore';
import useSWR from 'swr';
import { getChatById } from '@/lib/db/queries';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Typewriter } from "react-simple-typewriter";
import { usePanelStore } from '@/store/usePanelStore';
import { generateUUID } from '@/app/(chat)/chatActions';
// Memoize the chat header to prevent unnecessary re-renders
const ChatHeader = memo(({ 
  onHistoryClick, 
  showHistory, 
  onNewChatClick,
  onDeleteClick,
  chatTitle,
  isDeleting
}: { 
  onHistoryClick: () => void, 
  showHistory: boolean, 
  onNewChatClick: () => void,
  onDeleteClick: () => void,
  chatTitle?: string,
  isDeleting: boolean
}) => {
  return (
    <CardHeader className="h-8 bg-background/80 sticky top-0 z-10 border-b">
      <div className="flex items-center justify-between gap-2 h-8">
        <span className="font-semibold text-lg text-foreground truncate">
          {chatTitle === undefined ? (
            <span className="font-semibold text-lg text-foreground truncate">
              Lesearch Assistant
            </span>
          ) : chatTitle === '' ? (
            <span className="text-muted-foreground animate-pulse">Loading...</span>
          ) : (
            <Typewriter
              key={chatTitle}
              words={[chatTitle]}
              loop={1}
              cursor
              cursorStyle=""
              typeSpeed={20}
              deleteSpeed={0}
              delaySpeed={1000}
            />
          )}
        </span>
        <div className="flex items-center gap-2">
          {chatTitle && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={onDeleteClick}
              disabled={isDeleting}
            >
              <Trash2
                size={20}
                className={cn(
                  "text-destructive",
                  isDeleting && "animate-pulse"
                )}
              />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto"
            aria-label="New Chat"
            onClick={onNewChatClick}
          >
            <Plus size={20} className="text-muted-foreground" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("ml-auto", showHistory && "text-primary")}
            onClick={(e) => {
              e.stopPropagation();
              onHistoryClick();
            }}
            aria-label="Chat History"
          >
            <History size={20} className="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}, (prevProps, nextProps) => {
  if (prevProps.chatTitle !== nextProps.chatTitle) return false;
  if (prevProps.showHistory !== nextProps.showHistory) return false;
  if (prevProps.isDeleting !== nextProps.isDeleting) return false;
  return true;
});
ChatHeader.displayName = 'ChatHeader';

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