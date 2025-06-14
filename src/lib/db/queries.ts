'use server';

import { createClient } from "@/lib/supabase/server";
import { type UIMessage } from 'ai';

export async function createChat(id: string, title: string, documentId: string, userId: string) {

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("chats")
      .insert({ id, title, document_id: documentId, user_id: userId })
      .select()
      .single();
  
    if (error) {
      throw error;
    }
  
    return data;
  }
export interface ChatHistoryResponse {
  chats: Array<{
    id: string;
    title: string;
    updated_at: string;
  }>;
  hasMore: boolean;
}

export async function getChatsByUserId({
  user_id,
  document_id,
  limit,
  startingAfter,
  endingBefore,
}: {
  user_id: string;
  document_id: string;
  limit: number;
  startingAfter?: string | null;
  endingBefore?: string | null;
}): Promise<ChatHistoryResponse> {
  try {
    const supabase = await createClient();
    const extendedLimit = limit + 1;

    let query = supabase
      .from("chats")
      .select("id, title, updated_at")
      .eq("user_id", user_id)
      .eq("document_id", document_id)
      .order("updated_at", { ascending: false })
      .limit(extendedLimit);

    if (startingAfter) {
      const { data: selectedChat } = await supabase
        .from("chats")
        .select("updated_at")
        .eq("id", startingAfter)
        .single();

      if (!selectedChat) {
        throw new Error(`Chat with id ${startingAfter} not found`);
      }

      query = query.gt("updated_at", selectedChat.updated_at);
    } else if (endingBefore) {
      const { data: selectedChat } = await supabase
        .from("chats")
        .select("updated_at")
        .eq("id", endingBefore)
        .single();

      if (!selectedChat) {
        throw new Error(`Chat with id ${endingBefore} not found`);
      }

      query = query.lt("updated_at", selectedChat.updated_at);
    }

    const { data: chats, error } = await query;

    if (error) {
      throw error;
    }

    const hasMore = (chats?.length ?? 0) > limit;

    return {
      chats: hasMore ? chats?.slice(0, limit) ?? [] : chats ?? [],
      hasMore,
    };
  } catch (error) {
    console.error('Failed to get chats by user from database:', error);
    throw error;
  }
}

export interface Message {
  chatId: string;
  id: string;
  role: 'user' | 'assistant';
  parts: UIMessage['parts'];
  attachments?: UIMessage['experimental_attachments'];
  createdAt: Date;
}

export async function saveMessages({ messages }: { messages: Message[] }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .insert(messages.map(msg => ({
      chat_id: msg.chatId,
      id: msg.id,
      role: msg.role,
      parts: msg.parts,
      attachments: msg.attachments,
      created_at: msg.createdAt
    })));

  if (error) {
    throw error;
  }
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: UIMessage['parts'];
  attachments?: UIMessage['experimental_attachments'];
  created_at: string;
}

export async function getMessagesByChatId(chatId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts,
    attachments: msg.attachments,
    created_at: msg.created_at
  }));
}

export interface ChatDetails {
  id: string;
  title: string;
  document_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export async function getChatById(chatId: string): Promise<ChatDetails | null> {
  try {
    // Validate chatId is not empty and is a valid UUID
    if (!chatId || chatId.trim() === '') {
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Chat not found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get chat details:', error);
    throw error;
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("chats")
      .delete()
      .eq("id", chatId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete chat:', error);
    throw error;
  }
} 

export async function updateChat(chatId: string, title: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("chats")
      .update({ title })
      .eq("id", chatId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete chat:', error);
    throw error;
  }
} 