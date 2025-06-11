import { generateUUID } from '@/lib/utils';
import React from 'react'
import { Chat } from './chat';

export const DEFAULT_CHAT_MODEL: string = 'chat-model';


export default  function RenderChat() {
    const id = generateUUID();
  console.log('RenderChat');
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          isReadonly={false}
        />
      </>
    );
}
