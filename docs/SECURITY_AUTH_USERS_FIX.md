# Security Fix: auth.users Exposure via Audit Views

## Problem

Supabase security linter detected that `auth.users` table was being exposed to authenticated users through views in the `dogadopt` schema. This occurred because the audit log views were using `LEFT JOIN` to directly join with the `auth.users` table to display user email and name information.

### Security Warning
```
Detects if auth.users is exposed to anon or authenticated roles via a view 
or materialized view in schemas exposed to PostgREST, potentially compromising 
user data security.
```

### Affected Views
1. `dogadopt.dogs_audit_logs_resolved`
2. `dogadopt.rescues_audit_logs_resolved`  
3. `dogadopt.locations_audit_logs_resolved`

All three views contained code like:
```sql
LEFT JOIN auth.users u ON u.id = dal.changed_by
```

And exposed fields:
- `u.email AS changed_by_email`
- `u.raw_user_meta_data->>'full_name' AS changed_by_name`

## Why This Was a Security Risk

Even though:
- The `auth.users` table itself has proper RLS policies
- The audit log tables have RLS policies restricting access to admins only
- The views are only granted to authenticated users

The issue is that:
1. **PostgREST Schema Exposure**: When a view in the `dogadopt` schema (which is exposed to PostgREST per `config.toml`) joins with `auth.users`, it exposes the structure and metadata of the `auth.users` table through the PostgREST API introspection
2. **Bypass Potential**: Direct joins in views can potentially bypass RLS policies in certain edge cases
3. **Information Leakage**: API consumers can see that `auth.users` is being referenced, revealing internal authentication structure

## Solution

### Migration: `20260106201300_fix_auth_users_exposure.sql`

The fix implements a **SECURITY DEFINER function** pattern to safely access user information:

#### 1. Created Safe Access Function

```sql
CREATE OR REPLACE FUNCTION dogadopt.get_user_info(user_id UUID)
RETURNS TABLE (
  email TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = dogadopt, auth
AS $$
BEGIN
  -- Verify caller is an admin (for direct function calls)
  -- Views using this function are already protected by RLS
  IF NOT dogadopt.has_role(auth.uid(), 'admin') THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    u.email::TEXT,
    (u.raw_user_meta_data->>'full_name')::TEXT
  FROM auth.users u
  WHERE u.id = user_id;
END;
$$;
```

**Key Security Features:**
- `SECURITY DEFINER`: Function executes with the privileges of the owner (who has access to auth.users)
- `SET search_path`: Prevents SQL injection by fixing the schema search path to dogadopt and auth
- `STABLE`: Function is safe for query optimization (same inputs = same outputs)
- **Admin check**: Function verifies caller is an admin before returning data
- Limited output: Only returns email and full_name, not all user data
- Returns empty result for non-admin callers (prevents information leakage)

#### 2. Recreated Views Using LATERAL Joins

Instead of:
```sql
LEFT JOIN auth.users u ON u.id = dal.changed_by
```

Views now use:
```sql
LEFT JOIN LATERAL dogadopt.get_user_info(dal.changed_by) AS user_info ON true
```

And reference:
```sql
user_info.email AS changed_by_email,
user_info.full_name AS changed_by_name
```

**Benefits:**
- No direct reference to `auth.users` in the view definition
- `auth.users` table is no longer exposed through PostgREST metadata
- Access is mediated through a controlled function interface
- Maintains exact same functionality for end users
- More efficient than subqueries - function called only once per row

## Impact

### No Breaking Changes
- ✅ All view columns remain identical
- ✅ Query results are the same
- ✅ Existing code using these views continues to work
- ✅ Grants and permissions unchanged

### Security Improvements
- ✅ `auth.users` no longer exposed through PostgREST schema
- ✅ User data access is controlled through secure function with admin check
- ✅ Reduced attack surface for potential SQL injection
- ✅ Clearer separation between auth schema and application schema
- ✅ Function has built-in admin verification to prevent unauthorized direct calls

## Testing

To verify the fix works correctly:

### 1. Check View Definitions
```sql
-- Should NOT show any reference to auth.users table
\d+ dogadopt.dogs_audit_logs_resolved
\d+ dogadopt.rescues_audit_logs_resolved
\d+ dogadopt.locations_audit_logs_resolved
```

### 2. Test Function Access

**Admin user should see results:**
```sql
-- Should return email and name for valid user_id (as admin)
SELECT * FROM dogadopt.get_user_info('valid-user-uuid-here');
```

**Non-admin user should get empty result:**
```sql
-- Should return empty result for non-admin users
SELECT * FROM dogadopt.get_user_info('valid-user-uuid-here');
-- Expected: 0 rows (access denied for non-admin)
```

**Invalid user_id:**
```sql
-- Should return empty result for invalid user_id
SELECT * FROM dogadopt.get_user_info('00000000-0000-0000-0000-000000000000');
```

### 3. Verify Audit View Functionality
```sql
-- As an admin user, query audit logs
SELECT 
  audit_id,
  changed_by,
  changed_by_email,
  changed_by_name,
  dog_name,
  change_summary
FROM dogadopt.dogs_audit_logs_resolved
LIMIT 5;
```

### 4. Check PostgREST API
```bash
# PostgREST should NOT show auth.users in schema
curl http://localhost:54321/ \
  -H "apikey: YOUR_ANON_KEY" | jq '.definitions | keys'

# Audit views should still be accessible to authenticated users
curl http://localhost:54321/dogs_audit_logs_resolved \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Performance Considerations

### LATERAL Join vs Direct JOIN Performance

The new approach uses LATERAL joins with a SECURITY DEFINER function:
```sql
LEFT JOIN LATERAL dogadopt.get_user_info(dal.changed_by) AS user_info ON true
```

Instead of a direct JOIN:
```sql
LEFT JOIN auth.users u ON u.id = dal.changed_by
```

**Performance Impact:**
- **Minimal overhead**: LATERAL joins are efficient in PostgreSQL and the function is marked `STABLE`
- **One call per row**: Unlike subqueries, LATERAL join calls the function once per row
- **Query optimization**: PostgreSQL can optimize LATERAL joins similar to regular joins
- For typical audit log queries (< 100 rows), performance difference is negligible

**Comparison:**
- ✅ LATERAL join: `O(n)` function calls for n rows
- ❌ Subquery approach: `O(2n)` function calls (once for email, once for name)
- ✅ Direct JOIN: `O(n)` but exposes auth.users schema

**Query Plan Analysis:**
```sql
EXPLAIN ANALYZE 
SELECT * FROM dogadopt.dogs_audit_logs_resolved LIMIT 10;
```

The query plan should show the LATERAL join being executed efficiently alongside the main table scan.

## Related Files

- Migration: `supabase/migrations/20260106201300_fix_auth_users_exposure.sql`
- Original audit views: 
  - `supabase/migrations/2025122803_dogadopt_dogs_and_breeds.sql`
  - `supabase/migrations/2025122802_dogadopt_rescues_and_locations.sql`
  - `supabase/migrations/2026010301_add_rescue_since_date.sql`

## References

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL SECURITY DEFINER Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [PostgREST Schema Cache](https://postgrest.org/en/stable/references/schema_cache.html)
- [Supabase Security Advisories](https://github.com/supabase/supabase/security/advisories)
