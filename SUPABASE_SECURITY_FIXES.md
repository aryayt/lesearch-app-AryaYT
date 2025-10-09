# Supabase Security Fixes

## Summary

This document tracks the security warnings from Supabase and the actions taken to resolve them.

---

## ✅ FIXED: Function Search Path Security (Critical)

**Status**: RESOLVED via Database Migration

**Issue**: Three functions had mutable search_path, which could allow search_path hijacking attacks.

**Functions Fixed**:
1. `delete_expired_otps`
2. `delete_items_when_folder_deleted`
3. `get_user_id_by_email`

**Solution Applied**:
- Created migration: `fix_function_search_path_security`
- Added `SET search_path = ''` to all three functions
- This prevents malicious users from manipulating the search_path to execute unauthorized code

**Migration Details**:
```sql
-- All functions now include: SET search_path = ''
-- This ensures they only access explicitly schema-qualified objects
```

**Verification**: ✅ Confirmed via `mcp_supabase_get_advisors` - warnings cleared

---

## ⚠️ REQUIRES MANUAL ACTION: Auth Configuration

### 1. Auth OTP Long Expiry

**Status**: ⚠️ PENDING - Requires Dashboard Configuration

**Issue**: Email OTP expiry is currently set to more than 1 hour. Recommended: < 1 hour

**Action Required**:
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Email OTP Expiry" setting
3. Change value to `3600` seconds (1 hour) or less
4. Recommended: `1800` seconds (30 minutes)

**Documentation**: [Supabase Production Security Guide](https://supabase.com/docs/guides/platform/going-into-prod#security)

---

### 2. Leaked Password Protection Disabled

**Status**: ⚠️ PENDING - Requires Dashboard Configuration

**Issue**: Password leak detection via HaveIBeenPwned.org is currently disabled

**Action Required**:
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Password Security" section
3. Enable "Leaked Password Protection"
4. This will check user passwords against the HaveIBeenPwned database

**Benefits**:
- Prevents users from using compromised passwords
- Enhances overall account security
- Recommended for all production applications

**Documentation**: [Password Security Guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

---

## ⚠️ REQUIRES MANUAL ACTION: Database Upgrade

### Vulnerable Postgres Version

**Status**: ⚠️ PENDING - Requires Dashboard Upgrade

**Current Version**: `supabase-postgres-15.8.1.126`

**Issue**: Security patches are available for the current Postgres version

**Action Required**:
1. Go to Supabase Dashboard → Settings → Infrastructure
2. Click "Upgrade" in the Postgres version section
3. Follow the upgrade wizard
4. **IMPORTANT**: Schedule during maintenance window
5. **IMPORTANT**: Create a backup before upgrading

**Documentation**: [Upgrading Postgres Guide](https://supabase.com/docs/guides/platform/upgrading)

**⚠️ Important Notes**:
- This is a critical security update
- Plan for potential downtime (usually minimal)
- Test in development/staging environment first if available
- Backup your database before proceeding

---

## 📊 Additional Finding: RLS Policy Missing

**Status**: ℹ️ INFO - Recommended to Fix

**Issue**: The `public.otp` table has Row Level Security (RLS) enabled but no policies defined

**Impact**: 
- With RLS enabled but no policies, the table becomes inaccessible to all users
- This might be intentional if only database functions should access it
- If client-side access is needed, policies must be added

**Recommended Action**:
If the `otp` table should only be accessed by database functions (recommended for security):
- Current state is acceptable
- Functions with `SECURITY DEFINER` can still access it

If client-side access is needed:
- Add appropriate RLS policies
- Example policy for user access:
```sql
-- Only allow users to see their own OTP entries
CREATE POLICY "Users can view their own OTP"
ON public.otp
FOR SELECT
TO authenticated
USING (email = auth.jwt() ->> 'email');
```

---

## 📋 Action Checklist

- [x] Fix function search_path security issues (via migration)
- [ ] Configure Auth OTP expiry (Dashboard)
- [ ] Enable leaked password protection (Dashboard)
- [ ] Upgrade Postgres version (Dashboard)
- [ ] Review RLS policy for OTP table (Optional)

---

## Security Score

**Before**: 3 Critical + 3 Warning Issues  
**After**: 0 Critical + 3 Warning Issues (require manual configuration)

**Automated Fixes**: 3/6 (50%)  
**Manual Configuration Required**: 3/6 (50%)

---

## Next Steps

1. **Immediate**: No immediate code changes required
2. **Short Term** (within 1 week):
   - Configure Auth OTP expiry
   - Enable leaked password protection
3. **Medium Term** (within 1 month):
   - Schedule and perform Postgres upgrade
   - Review and update RLS policy for OTP table if needed

---

## 🚀 UPDATE: Performance Optimization Complete

### ✅ Additional Fixes Applied

**Migration**: `optimize_rls_policies_and_indexes_v2`

**Performance Improvements**:
- ✅ Fixed 36 RLS policy performance issues
  - Wrapped all `auth.uid()` calls in subqueries: `(select auth.uid())`
  - Prevents re-evaluation of auth functions for each row
  - Significantly improves query performance at scale
  
- ✅ Removed 6 duplicate RLS policies
  - Consolidated `final_cta` table policies (4 → 2)
  - Consolidated `waitlist` table policies (3 → 1)
  - Reduces policy evaluation overhead
  
- ✅ Dropped 2 duplicate indexes
  - Removed `notes_id_key` constraint (kept primary key)
  - Removed `documents_id_key` constraint (kept primary key)
  - Reduces index maintenance overhead

**Affected Tables**: `api_keys`, `chats`, `code_generations`, `documents`, `files`, `messages`, `models`, `notes`, `pdfs`, `user_keys`, `final_cta`, `waitlist`

**Performance Impact**: 
- Queries with RLS policies will execute significantly faster
- Reduced database overhead from duplicate policies and indexes
- Better scalability for large datasets

---

*Last Updated*: 2025-10-09  
*Migrations Applied*: 
- `fix_function_search_path_security` (Security fixes)
- `optimize_rls_policies_and_indexes_v2` (Performance optimization)

*Status*: 
- Security: 3/6 issues resolved automatically, 3 require dashboard configuration
- Performance: 44/44 issues resolved automatically ✅

