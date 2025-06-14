import {
  type UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { google } from '@ai-sdk/google';
import { generateTitleFromUserMessage, generateUUID, getMostRecentUserMessage, getTrailingMessageId } from '@/app/(chat)/chatActions';
import { createClient } from '@/lib/supabase/server';
import { createChat, getChatById, saveMessages } from '@/lib/db/queries';

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
      console.log("Creating chat", id)
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


// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';
// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//   try {
//     const supabase = createRouteHandlerClient({ cookies });
//     const { title, documentId } = await request.json();

//     const { data: chat, error } = await supabase
//       .from('chats')
//       .insert([
//         {
//           title,
//           document_id: documentId,
//         },
//       ])
//       .select()
//       .single();

//     if (error) throw error;

//     return NextResponse.json(chat);
//   } catch (error) {
//     console.error('Error creating chat:', error);
//     return NextResponse.json(
//       { error: 'Failed to create chat' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: Request) {
//   try {
//     const supabase = createRouteHandlerClient({ cookies });
//     const { searchParams } = new URL(request.url);
//     const documentId = searchParams.get('documentId');

//     const { data: chats, error } = await supabase
//       .from('chats')
//       .select('*')
//       .eq('document_id', documentId)
//       .order('created_at', { ascending: false });

//     if (error) throw error;

//     return NextResponse.json(chats);
//   } catch (error) {
//     console.error('Error fetching chats:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch chats' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: Request) {
//   try {
//     const supabase = createRouteHandlerClient({ cookies });
//     const { searchParams } = new URL(request.url);
//     const chatId = searchParams.get('chatId');

//     const { error } = await supabase
//       .from('chats')
//       .delete()
//       .eq('id', chatId);

//     if (error) throw error;

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error deleting chat:', error);
//     return NextResponse.json(
//       { error: 'Failed to delete chat' },
//       { status: 500 }
//     );
//   }
// } 
  
