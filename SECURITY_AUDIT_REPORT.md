# Security Audit Report - LeSearch AI Refactoring
**Date**: October 11, 2025
**Auditor**: Claude Code (Manual Review)
**Scope**: Database migration + Frontend refactoring

---

## Executive Summary

**Overall Risk Level**: 🟡 MEDIUM (1 Critical Issue Found)

**Total Issues Found**: 4
- 🔴 Critical: 1
- 🟠 High: 2
- 🟡 Medium: 1
- 🟢 Low: 0

---

## 🔴 CRITICAL ISSUES

### 1. API Keys Stored in Plain Text (user_keys table)
**File**: `supabase/migrations/20241011000000_create_core_tables.sql:143`
**Severity**: CRITICAL
**Risk**: Sensitive API keys are stored in plain text, not encrypted

**Current Implementation**:
```sql
api_key TEXT NOT NULL, -- Encrypted using pgcrypto
```

**Issue**: Comment says "Encrypted using pgcrypto" but no encryption is actually implemented in the table definition or triggers.

**Impact**:
- Database administrator access = full access to all API keys
- Database breach = all user API keys compromised
- No defense-in-depth
- Violates GDPR/SOC2 compliance requirements

**Recommendation**:
Implement actual encryption using pgcrypto:

```sql
-- Add encryption function
CREATE OR REPLACE FUNCTION encrypt_api_key()
RETURNS TRIGGER AS $$
BEGIN
  -- Encrypt the API key before storing
  NEW.api_key = encode(
    encrypt(
      NEW.api_key::bytea,
      current_setting('app.encryption_key')::bytea,
      'aes'
    ),
    'base64'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to encrypt on insert/update
CREATE TRIGGER encrypt_user_keys_trigger
  BEFORE INSERT OR UPDATE ON public.user_keys
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_api_key();

-- Add decryption function for API usage
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(encrypted_key, 'base64'),
      current_setting('app.encryption_key')::bytea,
      'aes'
    ),
    'UTF8'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Priority**: FIX BEFORE LAUNCH

---

## 🟠 HIGH SEVERITY ISSUES

### 2. Missing Input Validation in Dashboard
**File**: `src/app/(main)/(routes)/documents/page.tsx:73-76`
**Severity**: HIGH
**Risk**: Potential for XSS via document names

**Current Implementation**:
```typescript
const handleItemClick = (itemId: string) => {
  setActivePageId(itemId);
  router.push(`/documents/${itemId}`);
};
```

**Issue**: No validation that `itemId` is a valid UUID before navigation

**Impact**:
- Malicious document IDs could cause navigation to unexpected routes
- Potential XSS if item names contain malicious content
- No sanitization of item.name before display (line 247)

**Recommendation**:
```typescript
import { z } from 'zod';

const uuidSchema = z.string().uuid();

const handleItemClick = (itemId: string) => {
  // Validate UUID format
  const validation = uuidSchema.safeParse(itemId);
  if (!validation.success) {
    console.error('Invalid document ID');
    return;
  }

  setActivePageId(itemId);
  router.push(`/documents/${itemId}`);
};

// For displaying names, sanitize HTML
import DOMPurify from 'dompurify';
<span className="truncate flex-1">
  {DOMPurify.sanitize(item.name)}
</span>
```

**Priority**: FIX BEFORE LAUNCH

---

### 3. Race Condition in Chat ID Generation
**File**: `src/app/(main)/(routes)/askAI/page.tsx:13-16`
**Severity**: HIGH
**Risk**: Chat sessions could be initialized with empty ID

**Current Implementation**:
```typescript
useEffect(() => {
  const newChatId = generateUUID();
  setChatId(newChatId);
}, []);
```

**Issue**:
- Chat component renders before chatId is set (first render)
- Loading state shows, but race condition exists
- If Chat component renders before setChatId completes, it gets empty string

**Impact**:
- Chat messages might not save correctly
- User might lose chat history
- Potential for duplicate chat sessions

**Recommendation**:
```typescript
const AskAIPage = () => {
  const { user } = useUserStore();
  // Initialize with UUID immediately, not in useEffect
  const [chatId] = useState<string>(() => generateUUID());

  // No useEffect needed!

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <Chat
        id={chatId}
        initialMessages={[]}
        selectedChatModel="gemini-2.0-flash-exp"
        provider="google"
        isReadonly={false}
      />
    </div>
  );
};
```

**Priority**: RECOMMENDED (Not blocking, but important)

---

## 🟡 MEDIUM SEVERITY ISSUES

### 4. Hardcoded AI Model in Ask AI Page
**File**: `src/app/(main)/(routes)/askAI/page.tsx:56`
**Severity**: MEDIUM
**Risk**: No user control over model selection

**Current Implementation**:
```typescript
selectedChatModel="gemini-2.0-flash-exp"
provider="google"
```

**Issue**:
- Model is hardcoded
- User cannot switch providers
- No fallback if Google API key is missing

**Impact**:
- Users with only Azure/OpenAI keys can't use chat
- No flexibility for model selection
- Potential API cost concerns (flash-exp vs flash)

**Recommendation**:
```typescript
import { useAPIKeyStore } from "@/store/apiKeyStore";

const AskAIPage = () => {
  const { selectedModel, apiKeys } = useAPIKeyStore();
  const [chatId] = useState<string>(() => generateUUID());

  // Determine available provider
  const availableProvider =
    apiKeys.google ? 'google' :
    apiKeys.azure ? 'azure' :
    apiKeys.openai ? 'openai' : null;

  if (!availableProvider) {
    return <NoAPIKeyWarning />;
  }

  return (
    <Chat
      id={chatId}
      selectedChatModel={selectedModel || "gemini-2.0-flash-exp"}
      provider={availableProvider}
      isReadonly={false}
    />
  );
};
```

**Priority**: POST-LAUNCH (Nice to have)

---

## ✅ SECURITY STRENGTHS

### What's Done Right:

1. **Row Level Security (RLS) Implemented**
   - ✅ All tables have RLS policies
   - ✅ Users can only access their own data
   - ✅ Proper use of `auth.uid()` checks

2. **Cascade Deletes Configured**
   - ✅ ON DELETE CASCADE prevents orphaned records
   - ✅ User deletion cleans up all related data

3. **Storage Bucket Policies**
   - ✅ Users can only access their own documents
   - ✅ Proper folder structure with user IDs

4. **Input Sanitization (Partial)**
   - ✅ Search query is controlled client-side
   - ✅ File type validation in upload route

5. **Authentication Checks**
   - ✅ User authentication verified before rendering
   - ✅ Redirect to login if not authenticated

---

## 📋 ACTION ITEMS

### Before Launch (Critical):
- [ ] **Fix #1**: Implement pgcrypto encryption for user_keys table
- [ ] **Fix #2**: Add UUID validation and input sanitization to dashboard
- [ ] Test encryption/decryption of API keys
- [ ] Add API key rotation mechanism

### Before Launch (Recommended):
- [ ] **Fix #3**: Move chat ID generation to useState initializer
- [ ] Add rate limiting to chat API
- [ ] Add CSRF protection to API routes
- [ ] Implement API key usage logging

### Post-Launch (Nice to Have):
- [ ] **Fix #4**: Add dynamic model selection UI
- [ ] Add API key expiration dates
- [ ] Implement audit logging for sensitive operations
- [ ] Add 2FA for API key management

---

## 🔧 IMMEDIATE FIXES REQUIRED

### Fix #1: Implement API Key Encryption

Create a new migration file to add encryption:

**File**: `supabase/migrations/20241011000001_encrypt_api_keys.sql`

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create encryption function
CREATE OR REPLACE FUNCTION public.encrypt_user_api_key()
RETURNS TRIGGER AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Get encryption key from environment
  -- In production, this should be set via Supabase Vault or environment variable
  encryption_key := current_setting('app.encryption_key', true);

  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not configured';
  END IF;

  -- Only encrypt if key is not already encrypted (not base64)
  IF NEW.api_key !~ '^[A-Za-z0-9+/=]+$' THEN
    NEW.api_key := encode(
      encrypt(
        NEW.api_key::bytea,
        encryption_key::bytea,
        'aes'
      ),
      'base64'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create decryption function (for API usage only)
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
  -- Verify the caller is the key owner
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Unauthorized access to API key';
  END IF;

  encryption_key := current_setting('app.encryption_key', true);

  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not configured';
  END IF;

  -- Get encrypted key
  SELECT api_key INTO encrypted_key
  FROM public.user_keys
  WHERE user_id = user_id_param AND provider = provider_param;

  IF encrypted_key IS NULL THEN
    RETURN NULL;
  END IF;

  -- Decrypt
  decrypted_key := convert_from(
    decrypt(
      decode(encrypted_key, 'base64'),
      encryption_key::bytea,
      'aes'
    ),
    'UTF8'
  );

  RETURN decrypted_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to encrypt on insert/update
DROP TRIGGER IF EXISTS encrypt_user_keys_trigger ON public.user_keys;
CREATE TRIGGER encrypt_user_keys_trigger
  BEFORE INSERT OR UPDATE OF api_key ON public.user_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_user_api_key();

-- Encrypt existing keys (if any)
DO $$
DECLARE
  encryption_key TEXT;
BEGIN
  encryption_key := current_setting('app.encryption_key', true);

  IF encryption_key IS NOT NULL THEN
    UPDATE public.user_keys
    SET api_key = encode(
      encrypt(
        api_key::bytea,
        encryption_key::bytea,
        'aes'
      ),
      'base64'
    )
    WHERE api_key !~ '^[A-Za-z0-9+/=]+$';
  END IF;
END $$;

-- Add comment
COMMENT ON FUNCTION public.decrypt_user_api_key IS 'Decrypt API key for authorized user only. SECURITY CRITICAL.';
```

### Fix #2: Add Input Validation

**File**: `src/app/(main)/(routes)/documents/page.tsx`

Add these imports:
```typescript
import { z } from "zod";
import DOMPurify from 'dompurify';
```

Update the click handler:
```typescript
const uuidSchema = z.string().uuid();

const handleItemClick = (itemId: string) => {
  const validation = uuidSchema.safeParse(itemId);
  if (!validation.success) {
    toast.error("Invalid document ID");
    return;
  }
  setActivePageId(itemId);
  router.push(`/documents/${itemId}`);
};
```

Update the display:
```typescript
<span className="truncate flex-1">
  {typeof window !== 'undefined'
    ? DOMPurify.sanitize(item.name)
    : item.name}
</span>
```

---

## 📊 Risk Assessment Matrix

| Issue | Severity | Likelihood | Impact | Priority |
|-------|----------|------------|--------|----------|
| Plain text API keys | Critical | High | High | P0 |
| Missing input validation | High | Medium | Medium | P0 |
| Race condition in chat | High | Low | Medium | P1 |
| Hardcoded model | Medium | High | Low | P2 |

---

## 🎯 Recommendation

**DO NOT DEPLOY TO PRODUCTION** until:
1. ✅ API key encryption is implemented
2. ✅ Input validation is added
3. ✅ All fixes are tested
4. ✅ Security review is passed

**Estimated Fix Time**: 2-3 hours

---

## Next Steps

1. **Immediate** (Now):
   - Create encryption migration
   - Add input validation
   - Test all security fixes

2. **Before Testing** (Today):
   - Set up encryption key in environment
   - Update API key retrieval queries
   - Add error handling for decryption failures

3. **Before Launch** (This Week):
   - Conduct penetration testing
   - Review all API endpoints
   - Add rate limiting
   - Set up monitoring for security events

---

**Audit Completed**: Manual review by Claude Code
**Follow-up Required**: YES - Critical issues found
**Recommended Actions**: Apply fixes before proceeding with remaining features
