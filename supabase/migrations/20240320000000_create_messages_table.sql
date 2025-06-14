-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  parts jsonb not null default '[]'::jsonb,
  attachments jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Create policies
create policy "Users can view their own messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can insert their own messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can update their own messages"
  on public.messages for update
  using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can delete their own messages"
  on public.messages for delete
  using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

-- Create indexes
create index messages_chat_id_idx on public.messages(chat_id);
create index messages_created_at_idx on public.messages(created_at);

-- Add updated_at trigger
create trigger handle_updated_at before update on public.messages
  for each row execute procedure moddatetime (updated_at); 