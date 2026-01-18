# Database Type Consistency Guide

## Issue: PostgreSQL Type Mismatch

When creating PostgreSQL functions that return table types, the return type definition **must exactly match** the underlying table column types. PostgreSQL is strict about this and will throw errors if there's a mismatch.

### Example Error

```
Error fetching rescues: {
  code: 42804, 
  details: Returned type character varying(50) does not match expected type text in column 6., 
  message: structure of query does not match function result type
}
```

## Root Cause

In migration `2025123101_add_rescue_contact_fields.sql`, we defined:

```sql
ALTER TABLE dogadopt.rescues
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS charity_number VARCHAR(50);
```

Later, in migration `2026011503_update_get_rescues_api.sql`, we defined an API function:

```sql
CREATE OR REPLACE FUNCTION dogadopt_api.get_rescues()
RETURNS TABLE (
  ...
  phone TEXT,
  charity_number TEXT,
  ...
)
```

The mismatch between `VARCHAR(50)` in the table and `TEXT` in the function caused the error.

## Solution

Created migration `2026011504_fix_rescue_column_types.sql` to alter the table columns:

```sql
ALTER TABLE dogadopt.rescues 
  ALTER COLUMN phone TYPE TEXT;
ALTER TABLE dogadopt.rescues 
  ALTER COLUMN charity_number TYPE TEXT;
```

## Best Practices

### 1. Use TEXT for String Columns

In PostgreSQL, there's **no performance penalty** for using `TEXT` over `VARCHAR`. Both:
- Use the same underlying storage mechanism (TOAST for large values)
- Have the same performance characteristics
- Support the same indexing capabilities

**Recommendation**: Default to `TEXT` for all string columns unless you have a specific reason to enforce a length constraint at the database level.

### 2. Validate Function Return Types

When creating a function that returns a table type:

```sql
-- ✅ GOOD: Matches table definition
CREATE TABLE my_table (
  id UUID,
  name TEXT  -- Column is TEXT
);

CREATE FUNCTION get_data() 
RETURNS TABLE (
  id UUID,
  name TEXT  -- Function also uses TEXT
) ...

-- ❌ BAD: Type mismatch
CREATE TABLE my_table (
  id UUID,
  name VARCHAR(100)  -- Column is VARCHAR
);

CREATE FUNCTION get_data() 
RETURNS TABLE (
  id UUID,
  name TEXT  -- Function uses TEXT - ERROR!
) ...
```

### 3. Testing API Functions

After creating or modifying API functions, test them:

```sql
-- Test the function works
SELECT * FROM dogadopt_api.get_rescues();

-- Verify no type casting issues
SELECT pg_typeof(phone), pg_typeof(charity_number) 
FROM dogadopt_api.get_rescues() 
LIMIT 1;
```

### 4. Migration Order

When adding columns and API functions:

1. **Define column types carefully** in the initial migration
2. **Match those types exactly** in any API functions
3. If you need to change types later, update both the table AND any affected functions

## Related Files

- `supabase/migrations/2025123101_add_rescue_contact_fields.sql` - Original VARCHAR definitions
- `supabase/migrations/2026011503_update_get_rescues_api.sql` - API function with TEXT types
- `supabase/migrations/2026011504_fix_rescue_column_types.sql` - Fix for type mismatch

## Impact

This type of error:
- **Blocks API calls** - The function cannot return data
- **Causes runtime errors** - Appears as JavaScript errors in the browser console
- **Breaks tests** - Smoke tests will fail
- **Affects production** - Users cannot fetch data from affected endpoints
