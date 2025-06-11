import React from 'react'
import RenderChatHistory from '../chat/chat-history';
import RenderChat from '../chat/render-chat';
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from '../ui/button';
import { History } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const RightPanel = () => {
  console.log('RightPanel');
  return (
    <Card className="flex flex-col h-full w-full gap-1">
      <CardHeader className="border-b h-8 bg-background/80 sticky top-0 z-10">
        <div className="flex items-center gap-2 h-8">
          <span className="font-semibold text-lg text-foreground">
            Lesearch Assistant
          </span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto"
                aria-label="Chat History"
              >
                <History size={20} className="text-muted-foreground" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0" align="end">
              <RenderChatHistory />
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>

      {/* Main Content Area */}
      <div className="flex flex-col h-full">
        <RenderChat />
      </div>
    </Card>
  );
}

export default RightPanel