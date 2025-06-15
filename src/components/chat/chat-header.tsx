import { memo } from "react";
import { CardHeader } from "../ui/card";
import { Typewriter } from "react-simple-typewriter";
import { Button } from "../ui/button";
import { History, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";


// Memoize the chat header to prevent unnecessary re-renders
export const ChatHeader = memo(({ 
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