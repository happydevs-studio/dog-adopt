# Security Fix: SECURITY DEFINER Usage in Functions

## Problem

The Supabase security linter detected that several functions were unnecessarily using `SECURITY DEFINER`, which poses security risks:

> Detects views defined with the SECURITY DEFINER property. These views enforce Postgres permissions and row level security policies (RLS) of the view creator, rather than that of the querying user.

While the warning mentions "views", the actual issue is with **functions** that have `SECURITY DEFINER` property. In PostgreSQL:
- Functions can be `SECURITY DEFINER` (run with creator's privileges) or `SECURITY INVOKER` (run with caller's privileges)
- Views themselves cannot have SECURITY DEFINER, but views that use SECURITY DEFINER functions indirectly inherit elevated privileges

## Security Risks

### What is SECURITY DEFINER?

When a function has `SECURITY DEFINER`:
- The function executes with the privileges of the user who **created** the function
- Not with the privileges of the user who **calls** the function
- This can bypass Row Level Security (RLS) policies
- If not properly secured, it can lead to privilege escalation attacks

### Identified Issues

#### Issue 1: Unnecessary SECURITY DEFINER on Audit Triggers

**Affected Functions:**
- `dogadopt.audit_dog_changes()`
- `dogadopt.audit_dog_breed_changes()`
- `dogadopt.audit_rescue_changes()`
- `dogadopt.audit_location_changes()`

**Why it's a problem:**
- These trigger functions had `SECURITY DEFINER` but didn't need it
- Audit log tables have RLS policies that allow ANY insert: `WITH CHECK (true)`
- Triggers naturally run in the context of the triggering statement
- Using SECURITY DEFINER unnecessarily:
  - Elevates privileges beyond what's needed
  - Increases the attack surface
  - Makes security analysis more complex

**Example:**
```sql
-- BEFORE (Security Risk)
CREATE OR REPLACE FUNCTION dogadopt.audit_dog_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- ❌ Unnecessary privilege elevation
SET search_path = dogadopt, public
AS $$
BEGIN
  INSERT INTO dogadopt.dogs_audit_logs (...) VALUES (...);
  RETURN NEW;
END;
$$;

-- AFTER (Secure)
CREATE OR REPLACE FUNCTION dogadopt.audit_dog_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY INVOKER is default - runs with caller privileges
SET search_path = dogadopt, public
AS $$
BEGIN
  INSERT INTO dogadopt.dogs_audit_logs (...) VALUES (...);
  RETURN NEW;
END;
$$;
```

#### Issue 2: Privilege Escalation in set_dog_breeds()

**Affected Function:**
- `dogadopt.set_dog_breeds()`

**Why it's a problem:**
- Function has `SECURITY DEFINER` (needs it to modify breeds/dogs_breeds tables)
- Granted to ALL authenticated users: `GRANT EXECUTE ON FUNCTION dogadopt.set_dog_breeds TO authenticated;`
- Had **NO admin check** inside the function
- Any authenticated user could call it to bypass RLS and modify breed data

**Attack Scenario:**
```sql
-- Without admin check, any authenticated user could do this:
SELECT dogadopt.set_dog_breeds(
  '12345678-1234-1234-1234-123456789012',  -- Example dog UUID
  ARRAY['Malicious Breed', 'Another Breed']
);
-- This would bypass the RLS policy requiring admin access!
```

**The Fix:**
```sql
CREATE OR REPLACE FUNCTION dogadopt.set_dog_breeds(...)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER  -- Still needed to bypass RLS
SET search_path = dogadopt
AS $$
BEGIN
  -- ✅ SECURITY CHECK: Verify caller is an admin
  IF NOT dogadopt.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Only administrators can modify dog breeds'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  -- Rest of function...
END;
$$;
```

## Solution

### Migration: `20260106203900_fix_security_definer_issue.sql`

The migration makes two key changes:

#### 1. Removed SECURITY DEFINER from Audit Triggers

**Before:**
- 4 audit trigger functions had `SECURITY DEFINER`
- Ran with elevated privileges unnecessarily

**After:**
- Removed `SECURITY DEFINER` from all 4 audit trigger functions
- Functions now run with `SECURITY INVOKER` (default) - caller's privileges
- Audit logging still works because audit tables have open INSERT policies

**Why it's safe:**
- Audit tables have RLS policy: `CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true)`
- Any user who can modify the base table (dogs, rescues, locations) can also insert into audit logs
- Triggers execute in the context of the triggering statement, so privileges are appropriate

#### 2. Added Admin Check to set_dog_breeds()

**Before:**
```sql
CREATE OR REPLACE FUNCTION dogadopt.set_dog_breeds(...)
SECURITY DEFINER
AS $$
BEGIN
  -- No security check!
  DELETE FROM dogadopt.dogs_breeds WHERE dog_id = p_dog_id;
  -- Insert new breeds...
END;
$$;
```

**After:**
```sql
CREATE OR REPLACE FUNCTION dogadopt.set_dog_breeds(...)
SECURITY DEFINER  -- Still needed
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- ✅ Admin verification with NULL check
  -- Store auth.uid() to avoid duplicate function calls
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL OR NOT dogadopt.has_role(v_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: set_dog_breeds() requires administrator privileges'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  DELETE FROM dogadopt.dogs_breeds WHERE dog_id = p_dog_id;
  -- Insert new breeds...
END;
$$;
```

**Why SECURITY DEFINER is still needed:**
- The breeds and dogs_breeds tables have RLS policies: `USING (dogadopt.has_role(auth.uid(), 'admin'))`
- Only admins can INSERT/DELETE from these tables
- The function needs SECURITY DEFINER to perform these operations
- But NOW it verifies the caller is actually an admin before doing anything

## Functions Using SECURITY DEFINER

After this fix, only these functions use `SECURITY DEFINER` (with justification):

### 1. `dogadopt.has_role(_user_id UUID, _role app_role)`
- **Needs SECURITY DEFINER:** YES
- **Why:** Called by RLS policies to check user roles
- **Security:** Safe - only reads from user_roles table
- **Search path:** `SET search_path = dogadopt`

### 2. `dogadopt.handle_new_user()`
- **Needs SECURITY DEFINER:** YES
- **Why:** Trigger on auth.users, needs to create profiles and assign default role
- **Security:** Safe - runs only on new user creation, controlled by Supabase auth
- **Search path:** `SET search_path = dogadopt`

### 3. `dogadopt.get_user_info(user_id UUID)`
- **Needs SECURITY DEFINER:** YES
- **Why:** Needs to access auth.users table
- **Security:** Has admin check - returns empty for non-admins
- **Search path:** `SET search_path = ''` (maximum security)

### 4. `dogadopt.set_dog_breeds(p_dog_id UUID, p_breed_names TEXT[])`
- **Needs SECURITY DEFINER:** YES
- **Why:** Needs to bypass RLS on breeds/dogs_breeds tables
- **Security:** NOW has admin check - raises exception for non-admins
- **Search path:** `SET search_path = dogadopt`

## Best Practices for SECURITY DEFINER

Based on this fix, here are the best practices we follow:

### 1. Use SECURITY DEFINER Sparingly
✅ Only use when function MUST elevate privileges
❌ Don't use "just in case" or by default

### 2. Always Add Security Checks
```sql
CREATE FUNCTION my_privileged_function()
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- ✅ Verify caller has appropriate permissions
  -- Always check for NULL to prevent unauthenticated access
  -- Store auth.uid() to avoid duplicate function calls
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL OR NOT dogadopt.has_role(v_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: my_privileged_function() requires admin privileges';
  END IF;
  
  -- Privileged operations...
END;
$$;
```

### 3. Set search_path for Security
```sql
-- ✅ Good: Fully qualified or restricted search_path
CREATE FUNCTION my_function()
SECURITY DEFINER
SET search_path = dogadopt  -- Restrict to known schema
-- OR
SET search_path = ''  -- Maximum security: force fully qualified names

-- ❌ Bad: No search_path restriction
CREATE FUNCTION my_function()
SECURITY DEFINER
-- Uses caller's search_path - can be manipulated
```

### 4. Triggers Usually Don't Need SECURITY DEFINER
```sql
-- ❌ Bad: Trigger with SECURITY DEFINER
CREATE FUNCTION my_audit_trigger()
RETURNS TRIGGER
SECURITY DEFINER  -- Unnecessary for triggers
AS $$
BEGIN
  INSERT INTO audit_logs (...) VALUES (...);
END;
$$;

-- ✅ Good: Trigger with SECURITY INVOKER (default)
CREATE FUNCTION my_audit_trigger()
RETURNS TRIGGER
-- Uses caller privileges - appropriate for triggers
AS $$
BEGIN
  INSERT INTO audit_logs (...) VALUES (...);
END;
$$;
```

### 5. Audit Function Grants
```sql
-- ❌ Bad: SECURITY DEFINER function granted to everyone
GRANT EXECUTE ON FUNCTION privileged_function TO anon, authenticated;

-- ✅ Good: Either restrict grants OR add security check
GRANT EXECUTE ON FUNCTION privileged_function TO admin_role;
-- OR
CREATE FUNCTION privileged_function()
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL OR NOT is_admin(v_user_id) THEN
    RAISE EXCEPTION 'Access denied: privileged_function() requires admin';
  END IF;
  -- ...
END;
$$;
```

## Testing

### Verify Audit Triggers Work

As an admin user:
```sql
-- Update a dog and check audit log is created
UPDATE dogadopt.dogs SET name = 'Test Dog Updated' WHERE id = 'some-uuid';

-- Verify audit log was created
SELECT * FROM dogadopt.dogs_audit_logs 
WHERE dog_id = 'some-uuid' 
ORDER BY changed_at DESC LIMIT 1;
```

### Verify set_dog_breeds Security

As a non-admin user:
```sql
-- Should FAIL with "Access denied" error
SELECT dogadopt.set_dog_breeds('12345678-1234-1234-1234-123456789012', ARRAY['Test Breed']);
-- Expected: ERROR: Access denied: set_dog_breeds() requires administrator privileges
```

As an admin user:
```sql
-- Should SUCCEED
SELECT dogadopt.set_dog_breeds('12345678-1234-1234-1234-123456789012', ARRAY['Labrador', 'Golden Retriever']);
-- Expected: Success
```

## Impact

### Security Improvements
✅ Reduced attack surface by removing unnecessary privilege elevation
✅ Fixed privilege escalation vulnerability in set_dog_breeds()
✅ Audit triggers now run with appropriate caller privileges
✅ All SECURITY DEFINER functions now have proper security checks

### No Breaking Changes
✅ Audit logging continues to work exactly as before
✅ Admin users can still use set_dog_breeds()
✅ Non-admin users are now properly blocked from set_dog_breeds()
✅ All view queries continue to work

## Related Files

- **Migration:** `supabase/migrations/20260106203900_fix_security_definer_issue.sql`
- **Original migrations with SECURITY DEFINER:**
  - `supabase/migrations/2025122801_dogadopt_users_and_profiles.sql`
  - `supabase/migrations/2025122802_dogadopt_rescues_and_locations.sql`
  - `supabase/migrations/2025122803_dogadopt_dogs_and_breeds.sql`

## References

- [PostgreSQL SECURITY DEFINER Documentation](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP: Privilege Escalation](https://owasp.org/www-community/attacks/Privilege_escalation)
