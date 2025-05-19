"use client"
import { useRef, useEffect, useState } from 'react';
import { Send, History } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: string;
}

const examplePrompts = [
  'Summarize this paper',
  'What is the main contribution?',
  'Explain this paragraph',
  'List all referenced works',
  'What does this term mean?'
];

const initialMessages: Message[] = [
  {
    id: 1,
    sender: 'bot',
    text: "Hi! I'm your Lesearch assistant. Ask me anything about this paper or PDF. For example: 'Summarize this paper' or 'What is the main contribution?'",
    timestamp: new Date().toISOString()
  }
];

// Dummy chat history data
const dummyChatHistory: ChatHistory[] = [
  {
    id: '1',
    title: 'Discussion about Machine Learning Paper',
    messages: [
      { id: 1, sender: 'user', text: 'What are the key findings?', timestamp: '2024-03-15T10:00:00Z' },
      { id: 2, sender: 'bot', text: 'The paper presents three main findings...', timestamp: '2024-03-15T10:00:05Z' },
      { id: 3, sender: 'user', text: 'Can you explain the methodology?', timestamp: '2024-03-15T10:01:00Z' },
      { id: 4, sender: 'bot', text: 'The researchers used a novel approach combining...', timestamp: '2024-03-15T10:01:10Z' },
    ],
    lastUpdated: '2024-03-15T10:01:10Z'
  },
  {
    id: '2',
    title: 'Analysis of Neural Networks',
    messages: [
      { id: 1, sender: 'user', text: 'How does this compare to previous work?', timestamp: '2024-03-14T15:30:00Z' },
      { id: 2, sender: 'bot', text: 'This work improves upon previous approaches by...', timestamp: '2024-03-14T15:30:08Z' },
    ],
    lastUpdated: '2024-03-14T15:30:08Z'
  }
];

const RightPanel = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messages) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { 
      id: Date.now(), 
      sender: 'user', 
      text: input,
      timestamp: new Date().toISOString()
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    // Placeholder: Simulate bot response
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: "I'm here to help! (AI integration coming soon)",
          timestamp: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 1200);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderChatHistory = () => (
    // <div className="flex-1">
      <ScrollArea className="h-full">
        <div className="divide-y divide-border">
          {dummyChatHistory.map((chat) => (
            <Card key={chat.id} className="border-0 rounded-none hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent>
                <h3 className="font-medium text-foreground mb-1">{chat.title}</h3>
                <div className="space-y-2 mb-2">
                  {chat.messages.slice(-2).map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "text-sm",
                        msg.sender === 'user' ? 'text-muted-foreground' : 'text-primary'
                      )}
                    >
                      <span className="font-medium">
                        {msg.sender === 'user' ? 'You: ' : 'AI: '}
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
    // </div>
  );

  const renderChatArea = () => (
    <>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={cn(
                "max-w-[75%] px-4 py-2 text-sm shadow-md whitespace-pre-line break-words",
                msg.sender === 'bot'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-accent text-accent-foreground'
              )}>
                <CardContent className="p-0">
                  {msg.text}
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(msg.timestamp)}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <Card className="max-w-[75%] px-4 py-2 text-sm shadow-md bg-primary/10 text-primary opacity-70 animate-pulse">
                <CardContent className="p-0">
                  Thinking…
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Example Prompts */}
      {messages.length <= 1 && !loading && (
        <div className="px-4 pb-3">
          <div className="text-xs text-muted-foreground mb-2">Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setInput(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form
        className="flex items-center gap-2 px-3 py-2  border-t bg-background/90 sticky bottom-0 z-10"
        onSubmit={e => { e.preventDefault(); handleSend(); }}
      >
        <Input
          type="text"
          placeholder="Ask a question about this paper…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          <Send size={18} />
        </Button>
      </form>
    </>
  );

  return (
    <Card className="flex flex-col h-full w-full gap-1">
      <CardHeader className="border-b h-8 bg-background/80 sticky top-0 z-10">
        <div className="flex items-center gap-2 h-8">
          <span className="font-semibold text-lg text-foreground">Lesearch Assistant</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
            className="ml-auto"
            aria-label="Chat History"
          >
            <History size={20} className="text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {showHistory ? renderChatHistory() : renderChatArea()}
      </div>
    </Card>
  );
};

export default RightPanel;