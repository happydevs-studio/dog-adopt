# ENUM Type Casting Fix

## Issue

When attempting to create a new dog record through the admin interface, the operation failed with the following PostgreSQL error:

```
code: '42804'
message: 'column "status" is of type adoption_status but expression is of type text'
hint: 'You will need to rewrite or cast the expression.'
```

## Root Cause

The `create_dog` and `update_dog` RPC functions in the `dogadopt_api` schema were receiving a TEXT parameter (`p_status`) and attempting to cast it inline within the INSERT/UPDATE statements:

```sql
-- PROBLEMATIC CODE (before fix)
INSERT INTO dogadopt.dogs (...)
VALUES (
  ...,
  p_status::dogadopt.adoption_status,  -- Direct cast in VALUES clause
  ...
);
```

PostgreSQL cannot directly cast a TEXT parameter to an ENUM type within the VALUES clause of an INSERT statement. This is a known limitation where the type inference fails at that specific point in the query execution.

## Solution

The fix uses an explicit DECLARE variable to handle the type casting before the INSERT/UPDATE operation:

```sql
-- FIXED CODE (after fix)
DECLARE
  v_status dogadopt.adoption_status;
BEGIN
  -- Explicitly cast to enum type first
  v_status := p_status::dogadopt.adoption_status;
  
  -- Then use the properly-typed variable
  INSERT INTO dogadopt.dogs (...)
  VALUES (
    ...,
    v_status,  -- Use pre-cast variable
    ...
  );
END;
```

## Changes Made

### Migration: `2026011801_fix_status_enum_casting.sql`

1. **Updated `dogadopt_api.create_dog` function**
   - Added `v_status dogadopt.adoption_status` declaration
   - Explicitly cast `p_status` to enum before INSERT
   - Used the pre-cast variable in VALUES clause

2. **Updated `dogadopt_api.update_dog` function**
   - Added `v_status dogadopt.adoption_status` declaration
   - Explicitly cast `p_status` to enum before UPDATE
   - Used the pre-cast variable in SET clause

## Verification

After applying this migration:
- ✅ Dog creation through admin interface works correctly
- ✅ Dog updates with status changes work correctly
- ✅ All valid enum values ('available', 'reserved', 'adopted', 'on_hold', 'fostered', 'withdrawn') are accepted
- ✅ Invalid status values are properly rejected with a clear error message

## Related ENUM Types

The codebase uses three custom ENUM types in the `dogadopt` schema:

1. **`adoption_status`** - Fixed in this migration ✅
   - Values: 'available', 'reserved', 'adopted', 'on_hold', 'fostered', 'withdrawn'
   - Used in: `dogs.status` column
   - API functions: `create_dog`, `update_dog`

2. **`app_role`** - No issue ✓
   - Values: 'admin', 'user'
   - Used in: `user_roles.role` column
   - Only used in comparison operations, not INSERT/UPDATE with parameters

3. **`location_type`** - No issue ✓
   - Values: 'centre', 'foster_home', 'office', 'other'
   - Used in: `locations.location_type` column
   - Has DEFAULT value, direct inserts work correctly
   - No API layer functions for location creation

## Best Practices

When working with custom ENUM types in PostgreSQL functions:

1. **Always use DECLARE variables for parameter casts** when the parameter will be used in INSERT/UPDATE statements
2. **Cast once, use many times** - perform the cast at the beginning of the function
3. **Let PostgreSQL validate** - the cast operation itself will fail with a clear error if an invalid enum value is provided
4. **Document enum values** - keep comments up to date with valid enum values

## References

- PostgreSQL Error Code 42804: Datatype Mismatch
- Migration file: `supabase/migrations/2026011801_fix_status_enum_casting.sql`
- Original API layer: `supabase/migrations/2026011201_create_api_layer.sql`
- Dog types: `src/types/dog.ts`
