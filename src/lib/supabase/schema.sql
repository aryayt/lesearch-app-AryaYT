-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES files(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create message_branches table
CREATE TABLE message_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  root_message_id UUID NOT NULL, -- Will reference messages(id)
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES message_branches(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content JSONB NOT NULL,
  parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add foreign key constraint for root_message_id after messages table is created
ALTER TABLE message_branches
  ADD CONSTRAINT fk_root_message
  FOREIGN KEY (root_message_id)
  REFERENCES messages(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_chats_document_id ON chats(document_id);
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_is_active ON chats(is_active);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_branch_id ON messages(branch_id);
CREATE INDEX idx_message_branches_chat_id ON message_branches(chat_id);
CREATE INDEX idx_message_branches_is_active ON message_branches(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_branches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chats table
CREATE POLICY "Users can view their own chats"
  ON chats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
  ON chats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
  ON chats FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for messages table
CREATE POLICY "Users can view messages in their chats"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their chats"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their chats"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in their chats"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

-- Create RLS policies for message_branches table
CREATE POLICY "Users can view branches in their chats"
  ON message_branches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = message_branches.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create branches in their chats"
  ON message_branches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = message_branches.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update branches in their chats"
  ON message_branches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = message_branches.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete branches in their chats"
  ON message_branches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = message_branches.chat_id
      AND chats.user_id = auth.uid()
    )
  ); 