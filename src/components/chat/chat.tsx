import { generateUUID, getChatHistoryPaginationKey } from '@/app/(chat)/chatActions';
import { useChat } from '@ai-sdk/react';
import type {  UIMessage } from 'ai';
import { toast } from 'sonner';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import { usePanelStore } from '@/store/usePanelStore';
import { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
import { useUserStore } from '@/store/userStore';
import { useEffect } from 'react';

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
  const { mutate } = useSWRConfig();
  const user = useUserStore((state) => state.user);
  const {activePageId} = usePanelStore();

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
    body: { id, selectedChatModel: selectedChatModel, documentId: activePageId },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    api: '/api/chat',
    onFinish: async () => {
      mutate(`/api/chat/${id}`);
      mutate(unstable_serialize(() => getChatHistoryPaginationKey(0, null, user?.id || '', activePageId || '')));
    },
    onError: () => {
      toast.error('An error occurred, please try again!');
    },
  });


  // Ensure messages are in sync with initialMessages when they change
  useEffect(() => {
    if (id && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [id, initialMessages, setMessages]);

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