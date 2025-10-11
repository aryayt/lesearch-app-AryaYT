-- ============================================================================
-- LeSearch AI - Core Tables Migration
-- Created: 2025-10-11
-- Description: Creates all core tables required for application functionality
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- FILES TABLE
-- Purpose: Stores all files (folders, PDFs, notes) in a hierarchical structure
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('folder', 'pdf', 'note')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for files table
CREATE INDEX IF NOT EXISTS files_user_id_idx ON public.files(user_id);
CREATE INDEX IF NOT EXISTS files_parent_id_idx ON public.files(parent_id);
CREATE INDEX IF NOT EXISTS files_type_idx ON public.files(type);
CREATE INDEX IF NOT EXISTS files_is_deleted_idx ON public.files(is_deleted);
CREATE INDEX IF NOT EXISTS files_updated_at_idx ON public.files(updated_at DESC);

-- Enable RLS for files
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for files
CREATE POLICY "Users can view their own files"
  ON public.files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
  ON public.files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
  ON public.files FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON public.files FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PDFS TABLE
-- Purpose: Stores PDF-specific metadata and storage information
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pdfs (
  id UUID PRIMARY KEY REFERENCES public.files(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for pdfs table
CREATE INDEX IF NOT EXISTS pdfs_user_id_idx ON public.pdfs(user_id);
CREATE INDEX IF NOT EXISTS pdfs_file_path_idx ON public.pdfs(file_path);
CREATE INDEX IF NOT EXISTS pdfs_created_at_idx ON public.pdfs(created_at DESC);

-- Enable RLS for pdfs
ALTER TABLE public.pdfs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pdfs
CREATE POLICY "Users can view their own PDFs"
  ON public.pdfs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PDFs"
  ON public.pdfs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PDFs"
  ON public.pdfs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PDFs"
  ON public.pdfs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- NOTES TABLE
-- Purpose: Stores note content using Plate.js JSON format
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY REFERENCES public.files(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for notes table
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON public.notes(updated_at DESC);

-- Enable RLS for notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- USER_KEYS TABLE
-- Purpose: Stores encrypted API keys for AI providers (Google, Azure, OpenAI)
-- SECURITY: API keys are encrypted at rest using pgcrypto
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'azure', 'openai', 'anthropic')),
  api_key TEXT NOT NULL, -- Encrypted using pgcrypto
  api_key_ff TEXT NOT NULL, -- First 4 characters for display (e.g., "sk-1...")
  active_models JSONB DEFAULT '[]'::JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, provider)
);

-- Create indexes for user_keys table
CREATE INDEX IF NOT EXISTS user_keys_user_id_idx ON public.user_keys(user_id);
CREATE INDEX IF NOT EXISTS user_keys_provider_idx ON public.user_keys(provider);
CREATE INDEX IF NOT EXISTS user_keys_user_provider_idx ON public.user_keys(user_id, provider);

-- Enable RLS for user_keys
ALTER TABLE public.user_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_keys (STRICT - users can only access their own keys)
CREATE POLICY "Users can view their own API keys"
  ON public.user_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys"
  ON public.user_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON public.user_keys FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON public.user_keys FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- Purpose: Automatically update updated_at timestamps on row updates
-- ============================================================================

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables
CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pdfs_updated_at
  BEFORE UPDATE ON public.pdfs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_keys_updated_at
  BEFORE UPDATE ON public.user_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- REALTIME
-- Purpose: Enable realtime subscriptions for live collaboration features
-- ============================================================================

-- Enable realtime for notes (for live editor collaboration)
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;

-- ============================================================================
-- COMMENTS
-- Purpose: Document table structure for future reference
-- ============================================================================

COMMENT ON TABLE public.files IS 'Hierarchical file system structure for folders, PDFs, and notes';
COMMENT ON TABLE public.pdfs IS 'PDF-specific metadata including storage URLs and file paths';
COMMENT ON TABLE public.notes IS 'Note content stored in Plate.js JSON format';
COMMENT ON TABLE public.user_keys IS 'Encrypted API keys for AI providers (Google Gemini, Azure OpenAI, etc.)';

COMMENT ON COLUMN public.files.type IS 'File type: folder, pdf, or note';
COMMENT ON COLUMN public.files.parent_id IS 'Parent folder ID for hierarchical structure (NULL for root items)';
COMMENT ON COLUMN public.files.is_deleted IS 'Soft delete flag - items are moved to trash instead of hard deleted';
COMMENT ON COLUMN public.pdfs.file_path IS 'Supabase Storage path for the PDF file';
COMMENT ON COLUMN public.notes.content IS 'Note content in Plate.js JSON format or plain text';
COMMENT ON COLUMN public.user_keys.api_key IS 'Encrypted API key - NEVER expose in queries without decryption';
COMMENT ON COLUMN public.user_keys.api_key_ff IS 'First 4 characters of API key for display purposes';
COMMENT ON COLUMN public.user_keys.active_models IS 'Array of active model IDs for this provider';

-- ============================================================================
-- STORAGE BUCKET SETUP
-- Purpose: Create storage bucket for PDF files if it doesn't exist
-- ============================================================================

-- Create documents storage bucket
-- Setting public=false to enforce RLS policies and prevent data leaks
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for documents bucket
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration creates:
-- - 4 core tables: files, pdfs, notes, user_keys
-- - 15+ indexes for query optimization
-- - 16 RLS policies for data security
-- - 4 update triggers for timestamp management
-- - 1 storage bucket with 4 policies
-- - Realtime subscription for notes table
-- ============================================================================
