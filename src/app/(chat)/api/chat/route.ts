import {
  type UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { google } from '@ai-sdk/google';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();

    // Map the selected model to the appropriate Google model
    const modelMap: Record<string, string> = {
      'gemini-pro': 'gemini-2.0-flash',
      'gemini-pro-vision': 'gemini-2.0-flash',
      // Add more model mappings as needed
    };

    const modelName = modelMap[selectedChatModel] || 'gemini-2.0-flash';

    return createDataStreamResponse({
      execute: async (dataStream) => {
        const streamResult = await streamText({
          model: google(modelName),
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

              // Get the last user message
              const lastUserMessage = messages.find(
                (message) => message.role === 'user'
              );

              if (lastUserMessage) {
                // Process the response messages
                appendResponseMessages({
                  messages: [lastUserMessage],
                  responseMessages: response.messages,
                });

                // Here you can add future implementations like:
                // - Saving messages to database
                // - Handling attachments
                // - Processing tool calls
                // - Analytics
              }
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
  
