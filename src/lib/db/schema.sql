-- Create user_keys table
CREATE TABLE user_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider VARCHAR(50) NOT NULL, -- e.g., 'google', 'openai'
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create index for faster lookups
CREATE INDEX idx_user_keys_user_id ON user_keys(user_id);

-- Add RLS policies
ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own API keys
CREATE POLICY "Users can view their own API keys"
  ON user_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own API keys
CREATE POLICY "Users can insert their own API keys"
  ON user_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own API keys
CREATE POLICY "Users can update their own API keys"
  ON user_keys
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own API keys
CREATE POLICY "Users can delete their own API keys"
  ON user_keys
  FOR DELETE
  USING (auth.uid() = user_id); 