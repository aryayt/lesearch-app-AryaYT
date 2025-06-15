import {
  type UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import {  generateUUID, getMostRecentUserMessage, getTrailingMessageId } from '@/app/(chat)/chatActions';
import { createClient } from '@/lib/supabase/server';
import { createChat, getChatById, saveMessages } from '@/lib/db/queries';
import { googleProvider } from '@/lib/ai/providers';
import { generateTitleFromUserMessage } from '@/lib/ai/queries';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
      documentId,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
      documentId: string;
    } = await request.json();

    if(!id){
      return new Response('Chat ID is required', { status: 400 });
    }

    // Get user session using Supabase server client
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response('User not authenticated', { status: 401 });
    }
    
    const userMessage = getMostRecentUserMessage(messages);
    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById(id);
    if(!chat){
      const title = await generateTitleFromUserMessage({ message: userMessage });
      await createChat(id, title, documentId, user.id);
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });



    return createDataStreamResponse({
      execute: async (dataStream) => {
        const streamResult = await streamText({
          model: googleProvider.languageModel(selectedChatModel),
          system: 'You are a helpful assistant.',
          messages,
          maxSteps: 5,
          experimental_activeTools: [],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          onFinish: async ({ response }) => {
            try {
              const assistantId = getTrailingMessageId({
                messages: response.messages.filter(
                  (message) => message.role === 'assistant',
                ),
              });

              if (!assistantId) {
                throw new Error('No assistant message found!');
              }

              const [, assistantMessage] = appendResponseMessages({
                messages: [userMessage],
                responseMessages: response.messages,
              });

              await saveMessages({
                messages: [
                  {
                    id: assistantId,
                    chatId: id,
                    role: 'assistant' as const,
                    parts: assistantMessage.parts ?? [],
                    attachments: assistantMessage.experimental_attachments ?? [],
                    createdAt: new Date(),
                  },
                ],
              });
            } catch (error) {
              console.error('Failed to process chat response:', error);
            }
          },
        });

        streamResult.consumeStream();
        streamResult.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: (error) => {
        console.error('Stream error:', error);
        return 'Oops, an error occurred!';
      },
    });
  } catch (error) {
    console.error('Request error:', error);
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}

  
