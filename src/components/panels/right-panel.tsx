"use client"
import { useRef, useEffect, useState } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
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
    text: "Hi! I'm your Lesearch assistant. Ask me anything about this paper or PDF. For example: 'Summarize this paper' or 'What is the main contribution?'"
  }
];

const RightPanel = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messages) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    // Placeholder: Simulate bot response
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { id: Date.now() + 1, sender: 'bot', text: "I'm here to help! (AI integration coming soon)" }
      ]);
      setLoading(false);
    }, 1200);
  };


  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-slate-50 to-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-white/80 sticky top-0 z-10">
        <span className="font-semibold text-lg text-slate-700">Lesearch Assistant</span>
        <span className="ml-auto text-xs text-gray-400">AI Chat for Papers</span>
      </div>
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md whitespace-pre-line break-words
                ${msg.sender === 'bot'
                  ? 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-900'
                  : 'bg-gradient-to-br from-gray-200 to-gray-100 text-gray-900 border'}
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md bg-gradient-to-br from-blue-100 to-blue-50 text-blue-900 opacity-70 animate-pulse">
              Thinking…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Example Prompts (when chat is empty except welcome) */}
      {messages.length <= 1 && !loading && (
        <div className="px-4 pb-3">
          <div className="text-xs text-gray-400 mb-2">Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="bg-gray-100 hover:bg-blue-100 text-gray-700 px-3 py-1 rounded-full text-xs border border-gray-200 transition"
                onClick={() => setInput(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Input Bar */}
      <form
        className="flex items-center gap-2 px-3 py-2 border-t bg-white/90 sticky bottom-0 z-10"
        onSubmit={e => { e.preventDefault(); handleSend(); }}
      >
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
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
        <button
          type="submit"
          className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-60"
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default RightPanel;