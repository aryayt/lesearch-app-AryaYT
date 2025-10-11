-- ============================================================================
-- API Key Encryption Migration
-- Created: 2025-10-11
-- Description: Implements actual encryption for API keys using pgcrypto
-- SECURITY: This fixes CRITICAL vulnerability of storing API keys in plain text
-- ============================================================================

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ENCRYPTION FUNCTION
-- Purpose: Automatically encrypt API keys before storing in database
-- ============================================================================
CREATE OR REPLACE FUNCTION public.encrypt_user_api_key()
RETURNS TRIGGER AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Set safe search_path to prevent privilege escalation
  PERFORM set_config('search_path', 'pg_catalog, public', true);

  -- Get encryption key from environment variable
  encryption_key := current_setting('app.encryption_key', true);

  -- FAIL HARD if encryption key is not configured
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE EXCEPTION 'SECURITY ERROR: Encryption key not configured. Set app.encryption_key before storing API keys. This is a critical security requirement.';
  END IF;

  -- Only encrypt if key is not already encrypted
  -- Check if it looks like PGP encrypted format
  IF NEW.api_key IS NOT NULL AND NOT (NEW.api_key ~ '^-----BEGIN PGP MESSAGE-----') THEN
    -- Encrypt using pgp_sym_encrypt (non-deterministic, includes random IV)
    -- This is more secure than basic encrypt() as each encryption is unique
    NEW.api_key := pgp_sym_encrypt(
      NEW.api_key,
      encryption_key
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DECRYPTION FUNCTION
-- Purpose: Decrypt API keys for authorized users only
-- SECURITY: Only the key owner can decrypt their keys
-- ============================================================================
CREATE OR REPLACE FUNCTION public.decrypt_user_api_key(
  user_id_param UUID,
  provider_param TEXT
)
RETURNS TEXT AS $$
DECLARE
  encryption_key TEXT;
  encrypted_key TEXT;
  decrypted_key TEXT;
BEGIN
  -- Set safe search_path to prevent privilege escalation
  PERFORM set_config('search_path', 'pg_catalog, public', true);

  -- SECURITY CHECK: Verify the caller is the key owner
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User not authenticated';
  END IF;

  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access another user''s API key';
  END IF;

  -- Get encryption key
  encryption_key := current_setting('app.encryption_key', true);

  -- FAIL HARD if encryption key is not configured
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE EXCEPTION 'SECURITY ERROR: Encryption key not configured. Cannot decrypt API keys without proper configuration.';
  END IF;

  -- Get encrypted key from database
  SELECT api_key INTO encrypted_key
  FROM public.user_keys
  WHERE user_id = user_id_param AND provider = provider_param;

  IF encrypted_key IS NULL THEN
    RETURN NULL;
  END IF;

  -- Decrypt using pgp_sym_decrypt (matches pgp_sym_encrypt)
  BEGIN
    decrypted_key := pgp_sym_decrypt(
      encrypted_key::bytea,
      encryption_key
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to decrypt API key for provider %: %', provider_param, SQLERRM;
    RETURN NULL;
  END;

  RETURN decrypted_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Get Decrypted API Key (Simpler interface)
-- Purpose: Simplified function for application use
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_api_key(provider_param TEXT)
RETURNS TEXT AS $$
DECLARE
  decrypted_key TEXT;
BEGIN
  -- Set safe search_path to prevent privilege escalation
  PERFORM set_config('search_path', 'pg_catalog, public', true);

  -- Call the main decryption function with current user's ID
  SELECT public.decrypt_user_api_key(auth.uid(), provider_param)
  INTO decrypted_key;

  RETURN decrypted_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-encrypt API keys on INSERT/UPDATE
-- ============================================================================
DROP TRIGGER IF EXISTS encrypt_user_keys_trigger ON public.user_keys;

CREATE TRIGGER encrypt_user_keys_trigger
  BEFORE INSERT OR UPDATE OF api_key ON public.user_keys
  FOR EACH ROW
  WHEN (NEW.api_key IS NOT NULL)
  EXECUTE FUNCTION public.encrypt_user_api_key();

-- ============================================================================
-- MIGRATE EXISTING KEYS (if any exist in plain text)
-- ============================================================================
DO $$
DECLARE
  encryption_key TEXT;
  key_count INTEGER;
BEGIN
  -- Get count of existing keys
  SELECT COUNT(*) INTO key_count FROM public.user_keys;

  IF key_count > 0 THEN
    RAISE NOTICE 'Found % existing API keys to encrypt', key_count;

    -- Get encryption key
    encryption_key := current_setting('app.encryption_key', true);

    -- FAIL HARD if encryption key is not configured
    IF encryption_key IS NULL OR encryption_key = '' THEN
      RAISE EXCEPTION 'SECURITY ERROR: Cannot migrate existing API keys without encryption key. Set app.encryption_key before running this migration.';
    END IF;

    -- Encrypt all existing keys that are not already encrypted
    -- (Keys not starting with PGP header)
    UPDATE public.user_keys
    SET api_key = pgp_sym_encrypt(
      api_key,
      encryption_key
    )
    WHERE api_key IS NOT NULL
      AND NOT (api_key ~ '^-----BEGIN PGP MESSAGE-----');

    RAISE NOTICE 'Encryption of % existing keys complete', key_count;
  ELSE
    RAISE NOTICE 'No existing API keys found - skipping migration';
  END IF;
END $$;

-- ============================================================================
-- SECURITY POLICIES UPDATE
-- Add additional policy to prevent raw API key exposure
-- ============================================================================

-- Revoke direct SELECT on api_key column (users should use decrypt function)
-- Note: This is advisory - RLS still allows the owner to see encrypted values
COMMENT ON COLUMN public.user_keys.api_key IS
  'ENCRYPTED API key - Use public.get_api_key(provider) function to decrypt. Direct access returns encrypted value.';

-- ============================================================================
-- GRANT EXECUTE PERMISSIONS
-- Allow authenticated users to call decrypt functions
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.decrypt_user_api_key(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_api_key(TEXT) TO authenticated;

-- ============================================================================
-- TESTING FUNCTIONS (Optional - remove in production)
-- ============================================================================

-- Function to test encryption/decryption
CREATE OR REPLACE FUNCTION public.test_api_key_encryption()
RETURNS TABLE (
  test_name TEXT,
  status TEXT,
  details TEXT
) AS $$
DECLARE
  test_user_id UUID;
  test_key TEXT := 'sk-test123456789';
  encrypted TEXT;
  decrypted TEXT;
BEGIN
  -- Set safe search_path to prevent privilege escalation
  PERFORM set_config('search_path', 'pg_catalog, public', true);

  -- Get current user
  test_user_id := auth.uid();

  IF test_user_id IS NULL THEN
    RETURN QUERY SELECT 'Auth Check'::TEXT, 'FAILED'::TEXT, 'No authenticated user'::TEXT;
    RETURN;
  END IF;

  -- Test 1: Insert a test key
  BEGIN
    INSERT INTO public.user_keys (user_id, provider, api_key, api_key_ff)
    VALUES (test_user_id, 'test_provider', test_key, 'sk-t')
    ON CONFLICT (user_id, provider) DO UPDATE SET api_key = test_key;

    RETURN QUERY SELECT 'Insert Test Key'::TEXT, 'PASSED'::TEXT, 'Key inserted successfully'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Insert Test Key'::TEXT, 'FAILED'::TEXT, SQLERRM::TEXT;
    RETURN;
  END;

  -- Test 2: Verify key was encrypted
  BEGIN
    SELECT api_key INTO encrypted
    FROM public.user_keys
    WHERE user_id = test_user_id AND provider = 'test_provider';

    IF encrypted != test_key THEN
      RETURN QUERY SELECT 'Encryption Check'::TEXT, 'PASSED'::TEXT,
        'Key was encrypted (PGP format: ' || (encrypted ~ '^-----BEGIN PGP MESSAGE-----')::TEXT || ')'::TEXT;
    ELSE
      RETURN QUERY SELECT 'Encryption Check'::TEXT, 'FAILED'::TEXT,
        'Key was not encrypted'::TEXT;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Encryption Check'::TEXT, 'FAILED'::TEXT, SQLERRM::TEXT;
  END;

  -- Test 3: Decrypt the key
  BEGIN
    decrypted := public.get_api_key('test_provider');

    IF decrypted = test_key THEN
      RETURN QUERY SELECT 'Decryption Check'::TEXT, 'PASSED'::TEXT,
        'Key decrypted correctly'::TEXT;
    ELSE
      RETURN QUERY SELECT 'Decryption Check'::TEXT, 'FAILED'::TEXT,
        'Decrypted value does not match original (got: ' || COALESCE(decrypted, 'NULL') || ')'::TEXT;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Decryption Check'::TEXT, 'FAILED'::TEXT, SQLERRM::TEXT;
  END;

  -- Cleanup
  DELETE FROM public.user_keys WHERE user_id = test_user_id AND provider = 'test_provider';

  RETURN QUERY SELECT 'Cleanup'::TEXT, 'COMPLETED'::TEXT, 'Test key removed'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.test_api_key_encryption() TO authenticated;

-- ============================================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================================
COMMENT ON FUNCTION public.encrypt_user_api_key IS
  'Trigger function: Automatically encrypts API keys before storage using AES encryption';

COMMENT ON FUNCTION public.decrypt_user_api_key IS
  'Decrypts API key for authorized user only. SECURITY CRITICAL - Only key owner can decrypt.';

COMMENT ON FUNCTION public.get_api_key IS
  'Helper function: Returns decrypted API key for current user and specified provider';

COMMENT ON FUNCTION public.test_api_key_encryption IS
  'Testing function: Validates encryption/decryption cycle. Remove in production.';

-- ============================================================================
-- IMPORTANT NOTES FOR DEPLOYMENT
-- ============================================================================
--
-- 1. SET ENCRYPTION KEY IN PRODUCTION:
--    ALTER DATABASE postgres SET app.encryption_key TO 'your-secure-random-key-here';
--
-- 2. Generate secure key using:
--    openssl rand -base64 32
--
-- 3. Store encryption key in Supabase Vault or environment variables
--
-- 4. NEVER commit the encryption key to version control
--
-- 5. Rotate encryption keys periodically (requires re-encryption)
--
-- 6. Test encryption by running:
--    SELECT * FROM public.test_api_key_encryption();
--
-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
