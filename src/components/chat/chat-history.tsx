import React from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: string;
}

// Dummy chat history data
const dummyChatHistory: ChatHistory[] = [
    {
      id: "1",
      title: "Discussion about Machine Learning Paper",
      messages: [
        {
          id: 1,
          sender: "user",
          text: "What are the key findings?",
          timestamp: "2024-03-15T10:00:00Z",
        },
        {
          id: 2,
          sender: "bot",
          text: "The paper presents three main findings...",
          timestamp: "2024-03-15T10:00:05Z",
        },
        {
          id: 3,
          sender: "user",
          text: "Can you explain the methodology?",
          timestamp: "2024-03-15T10:01:00Z",
        },
        {
          id: 4,
          sender: "bot",
          text: "The researchers used a novel approach combining...",
          timestamp: "2024-03-15T10:01:10Z",
        },
      ],
      lastUpdated: "2024-03-15T10:01:10Z",
    },
    {
      id: "2",
      title: "Analysis of Neural Networks",
      messages: [
        {
          id: 1,
          sender: "user",
          text: "How does this compare to previous work?",
          timestamp: "2024-03-14T15:30:00Z",
        },
        {
          id: 2,
          sender: "bot",
          text: "This work improves upon previous approaches by...",
          timestamp: "2024-03-14T15:30:08Z",
        },
      ],
      lastUpdated: "2024-03-14T15:30:08Z",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  
  const RenderChatHistory = () => {
    return (
      <ScrollArea className="h-full">
      <div className="divide-y divide-border">
        {dummyChatHistory.map((chat) => (
          <Card
            key={chat.id}
            className="border-0 rounded-none hover:bg-accent/50 cursor-pointer transition-colors"
          >
            <CardContent>
              <h3 className="font-medium text-foreground mb-1">{chat.title}</h3>
              <div className="space-y-2 mb-2">
                {chat.messages.slice(-2).map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "text-sm",
                      msg.sender === "user"
                        ? "text-muted-foreground"
                        : "text-primary"
                    )}
                  >
                    <span className="font-medium">
                      {msg.sender === "user" ? "You: " : "AI: "}
                    </span>
                    {msg.text}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(chat.lastUpdated)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
    )
  }
  
  export default RenderChatHistory
