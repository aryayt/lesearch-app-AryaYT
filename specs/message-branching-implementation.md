# Message Branching Implementation Guide

This guide provides the complete schema and query implementations for a chat application with message branching using Supabase.

## Database Schema

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (Supabase Auth handles this)
-- auth.users

-- Chats table
create table chats (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  user_id uuid references auth.users(id) not null,
  document_id uuid references files(id) not null
);

-- Message Branches table
create table message_branches (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid references chats(id) not null,
  root_message_id uuid not null, -- Will reference messages(id)
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table
create table messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid references chats(id) not null,
  branch_id uuid references message_branches(id) not null,
  role text not null,
  content jsonb not null,
  parent_message_id uuid references messages(id),
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add foreign key constraint for root_message_id after messages table is created
alter table message_branches
  add constraint fk_root_message
  foreign key (root_message_id)
  references messages(id);


## Row Level Security (RLS) Policies

```sql
-- Enable RLS
alter table chats enable row level security;
alter table messages enable row level security;
alter table message_branches enable row level security;
alter table votes enable row level security;

-- Chats policies
create policy "Users can view their own chats"
  on chats for select
  using (auth.uid() = user_id);

create policy "Users can create their own chats"
  on chats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chats"
  on chats for update
  using (auth.uid() = user_id);

create policy "Users can delete their own chats"
  on chats for delete
  using (auth.uid() = user_id);

-- Messages policies
create policy "Users can view messages in their chats"
  on messages for select
  using (
    exists (
      select 1 from chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can create messages in their chats"
  on messages for insert
  with check (
    exists (
      select 1 from chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

-- Message Branches policies
create policy "Users can view branches in their chats"
  on message_branches for select
  using (
    exists (
      select 1 from chats
      where chats.id = message_branches.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can create branches in their chats"
  on message_branches for insert
  with check (
    exists (
      select 1 from chats
      where chats.id = message_branches.chat_id
      and chats.user_id = auth.uid()
    )
  );
```

## TypeScript Types

```typescript
// types.ts
export type Message = {
  id: string;
  chat_id: string;
  branch_id: string;
  role: 'user' | 'assistant';
  content: any;
  parent_message_id: string | null;
  is_active: boolean;
  created_at: string;
};

export type MessageBranch = {
  id: string;
  chat_id: string;
  root_message_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Chat = {
  id: string;
  created_at: string;
  title: string;
  user_id: string;
  visibility: 'public' | 'private';
};
```

## Supabase Query Functions

```typescript
// queries.ts
import { createClient } from '@supabase/supabase-js';
import type { Message, MessageBranch, Chat } from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Chat Operations
export async function createChat(title: string): Promise<Chat> {
  const { data, error } = await supabase
    .from('chats')
    .insert({ title })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getChat(id: string): Promise<Chat> {
  const { data, error } = await supabase
    .from('chats')
    .select()
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// Message Branch Operations
export async function createMessageBranch(
  chatId: string,
  rootMessageId: string
): Promise<MessageBranch> {
  const { data, error } = await supabase
    .from('message_branches')
    .insert({
      chat_id: chatId,
      root_message_id: rootMessageId,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getActiveBranch(chatId: string): Promise<MessageBranch> {
  const { data, error } = await supabase
    .from('message_branches')
    .select()
    .eq('chat_id', chatId)
    .eq('is_active', true)
    .single();
  
  if (error) throw error;
  return data;
}

export async function switchBranch(branchId: string): Promise<void> {
  const { error } = await supabase
    .from('message_branches')
    .update({ is_active: false })
    .eq('id', branchId);
  
  if (error) throw error;
}

// Message Operations
export async function createMessage(
  chatId: string,
  branchId: string,
  role: 'user' | 'assistant',
  content: any,
  parentMessageId?: string
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      branch_id: branchId,
      role,
      content,
      parent_message_id: parentMessageId,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getMessagesByBranch(
  branchId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select()
    .eq('branch_id', branchId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getMessageThread(
  messageId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select()
    .eq('id', messageId)
    .or(`parent_message_id.eq.${messageId}`)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
}
```

## Usage Example

```typescript
// Example of creating a new message branch
async function handleMessageRetry(chatId: string, messageId: string) {
  // Create new branch
  const newBranch = await createMessageBranch(chatId, messageId);
  
  // Deactivate old branch
  await switchBranch(oldBranchId);
  
  // Create new message in the new branch
  const newMessage = await createMessage(
    chatId,
    newBranch.id,
    'assistant',
    { text: 'New response...' },
    messageId
  );
}

// Example of switching between branches
async function switchToBranch(branchId: string) {
  // Get current active branch
  const currentBranch = await getActiveBranch(chatId);
  
  // Deactivate current branch
  await switchBranch(currentBranch.id);
  
  // Activate new branch
  await switchBranch(branchId);
  
  // Get messages in the new branch
  const messages = await getMessagesByBranch(branchId);
}
```

## Key Features of This Implementation

1. **Message Branching**: Each message can have multiple branches, allowing for different conversation paths.

2. **Active Branch Tracking**: The `is_active` flag in `message_branches` helps track which branch is currently being used.

3. **Message Threading**: The `parent_message_id` in messages allows for tracking the conversation flow within each branch.

4. **Security**: RLS policies ensure users can only access their own chats and messages.

5. **Type Safety**: TypeScript types are provided for all database entities.

## Best Practices

1. Always use transactions when creating new branches to ensure data consistency.

2. Implement proper error handling for all database operations.

3. Use the `is_active` flag to manage branch switching instead of deleting branches.

4. Consider implementing a cleanup mechanism for inactive branches if needed.

5. Use proper indexing on frequently queried columns (chat_id, branch_id, parent_message_id).

## Additional Considerations

1. **Performance**: Consider implementing pagination for message retrieval in long conversations.

2. **Storage**: Monitor the size of the `content` JSONB field and implement cleanup if needed.

3. **Real-time**: Use Supabase's real-time features to sync message updates across clients.

4. **Caching**: Implement caching for frequently accessed branches and messages.

5. **Analytics**: Consider adding analytics tables to track branch usage and conversation patterns. 