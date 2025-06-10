import { generateUUID } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import type {  UIMessage } from 'ai';
import { toast } from 'sonner';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

export type VisibilityType = 'private' | 'public';


export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  isReadonly: boolean;
}) {

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      toast.success('Message generated')
    },
    onError: () => {
      toast.error('An error occurred, please try again!');
    },
  });


  console.log('AI messages', messages);

  return (
    <>
      <Messages
          chatId={id}
          status={status}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />

        <form className="flex mx-auto p-4 bg-background gap-2 w-full md:max-w-3xl">
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
        </form>
    </>
  );
}