# Database API Layer Architecture

## Overview

The Adopt-a-Dog UK application uses a **two-layer database architecture** that separates the API layer from the data layer. This is a best practice that ensures:

1. **Security** - Only expose what's necessary to the UI
2. **Abstraction** - Hide implementation details from the client
3. **Flexibility** - Change underlying schema without breaking the API
4. **Control** - Enforce business logic and permissions at the database level

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           Frontend (React/TypeScript)        │
│                                              │
│  - useDogs.ts                               │
│  - useRescues.ts                            │
│  - useAuth.tsx                              │
│  - Admin.tsx                                │
└────────────────┬────────────────────────────┘
                 │
                 │ Supabase Client
                 │
┌────────────────▼────────────────────────────┐
│          dogadopt_api (API Layer)           │
│                                              │
│  ✓ Functions (create_dog, update_dog, etc.) │
│  ✓ Views (dogs, rescues, breeds)            │
│  ✓ Procedures                               │
│                                              │
│  ⚠️ NO DIRECT TABLE ACCESS FROM UI          │
└────────────────┬────────────────────────────┘
                 │
                 │ SECURITY DEFINER functions
                 │
┌────────────────▼────────────────────────────┐
│          dogadopt (Data Layer)              │
│                                              │
│  - dogs (table)                             │
│  - rescues (table)                          │
│  - breeds (table)                           │
│  - dogs_breeds (table)                      │
│  - locations (table)                        │
│  - user_roles (table)                       │
│  - audit logs (tables)                      │
│                                              │
│  ✓ RLS Policies                             │
│  ✓ Triggers                                 │
│  ✓ Audit Logging                            │
└─────────────────────────────────────────────┘
```

## Schema Structure

### dogadopt_api (API Layer)
**Purpose:** Public interface for the UI. All frontend code interacts with this schema only.

**Contains:**
- **Functions** - Read operations with proper joins and filtering
- **Functions** - Write operations like create, update, delete with built-in authorization
- **Procedures** - Complex operations that may span multiple tables

**Access:**
- `anon` role: Can call read functions
- `authenticated` role: Can call read and write functions (write functions check admin role internally)

### dogadopt (Data Layer)
**Purpose:** Internal data storage with audit logging and business logic.

**Contains:**
- **Tables** - All actual data storage
- **Triggers** - Automatic audit logging
- **Helper Functions** - Internal operations (not exposed to UI)
- **RLS Policies** - Row-level security (backup security layer)

**Access:**
- Direct access **revoked** from `anon` and `authenticated` roles
- Only accessible via `dogadopt_api` functions using `SECURITY DEFINER`

## API Reference

### Dogs API

#### Function: `dogadopt_api.get_dogs()`
Returns all adoptable dogs with full relationship data (rescue info, breeds).

**Usage:**
```typescript
const { data } = await supabase
  .rpc('get_dogs');
```

**Returns:**
- All dog fields
- `rescue` (JSONB): Nested rescue information
- `breeds` (JSONB): Array of breed objects with display_order

**Filters:** Only shows dogs with status in `['available', 'reserved', 'fostered', 'on_hold']`

#### Function: `dogadopt_api.get_dog(dog_id UUID)`
Get detailed information for a single dog.

**Usage:**
```typescript
const { data } = await supabase
  .rpc('get_dog', { p_dog_id: dogId });
```

#### Function: `dogadopt_api.create_dog(...)`
Create a new dog record. **Requires admin role.**

**Parameters:**
- `p_name` - Dog's name
- `p_age` - Age category (Puppy/Young/Adult/Senior)
- `p_size` - Size (Small/Medium/Large)
- `p_gender` - Gender (Male/Female)
- `p_status` - Adoption status
- `p_rescue_id` - Associated rescue UUID
- `p_image` - Image URL
- `p_description` - Dog description
- `p_good_with_kids`, `p_good_with_dogs`, `p_good_with_cats` - Boolean flags
- `p_breed_names` - Array of breed names (TEXT[])
- Optional: `p_birth_year`, `p_birth_month`, `p_birth_day`, `p_rescue_since_date`, `p_profile_url`, `p_status_notes`, `p_location_id`

**Usage:**
```typescript
const { data: dogId } = await supabase
  .rpc('create_dog', {
    p_name: 'Max',
    p_age: 'Adult',
    p_size: 'Medium',
    p_gender: 'Male',
    p_status: 'available',
    p_rescue_id: rescueId,
    p_image: imageUrl,
    p_description: 'Friendly dog...',
    p_good_with_kids: true,
    p_good_with_dogs: true,
    p_good_with_cats: false,
    p_breed_names: ['Labrador Retriever', 'Mixed Breed']
  });
```

**Returns:** UUID of created dog

**Throws:** Exception if user is not admin

#### Function: `dogadopt_api.update_dog(dog_id, ...)`
Update an existing dog record. **Requires admin role.**

**Parameters:** Same as `create_dog` plus `p_dog_id` as first parameter

**Usage:**
```typescript
await supabase
  .rpc('update_dog', {
    p_dog_id: dogId,
    p_name: 'Max',
    // ... other fields
  });
```

**Returns:** Void

**Throws:** Exception if user is not admin

#### Function: `dogadopt_api.delete_dog(dog_id UUID)`
Delete a dog record. **Requires admin role.**

**Usage:**
```typescript
await supabase
  .rpc('delete_dog', { p_dog_id: dogId });
```

**Throws:** Exception if user is not admin

### Rescues API

#### Function: `dogadopt_api.get_rescues()`
Returns all rescue organizations.

**Usage:**
```typescript
const { data } = await supabase
  .rpc('get_rescues');
```

**Returns:**
- `id`, `name`, `type`, `region`, `website`, `latitude`, `longitude`, `created_at`

#### Function: `dogadopt_api.get_rescue(rescue_id UUID)`
Get detailed information for a single rescue.

**Usage:**
```typescript
const { data } = await supabase
  .rpc('get_rescue', { p_rescue_id: rescueId });
```

### Breeds API

#### Function: `dogadopt_api.get_breeds()`
Returns all available dog breeds.

**Usage:**
```typescript
const { data } = await supabase
  .rpc('get_breeds');
```

**Returns:**
- `id`, `name`, `created_at`

### Auth API

#### Function: `dogadopt_api.check_user_role(role TEXT)`
Check if the current user has a specific role.

**Usage:**
```typescript
const { data: isAdmin } = await supabase
  .rpc('check_user_role', { p_role: 'admin' });
```

**Returns:** Boolean

#### Function: `dogadopt_api.get_user_roles()`
Get all roles for the current authenticated user.

**Usage:**
```typescript
const { data: roles } = await supabase
  .rpc('get_user_roles');
```

**Returns:** Array of role names (TEXT[])

## Frontend Integration

### Pattern 1: Calling Read Functions

For read operations, call RPC functions:

```typescript
// hooks/useDogs.ts
const { data, error } = await supabase
  .rpc('get_dogs');
```

### Pattern 2: Calling Write Functions

For write operations or complex queries, use RPC:

```typescript
// pages/Admin.tsx
const { data: dogId, error } = await supabase
  .rpc('create_dog', {
    p_name: formData.name,
    p_age: formData.age,
    // ... other parameters
  });
```

### Pattern 2: Error Handling

API functions throw exceptions for authorization failures:

```typescript
try {
  await supabase.rpc('delete_dog', { p_dog_id: dogId });
} catch (error) {
  if (error.message.includes('Unauthorized')) {
    // Handle permission denied
  }
}
```

## Migration Strategy

When this API layer was introduced, the following changes were made:

1. **Created** `dogadopt_api` schema with functions
2. **Revoked** direct table access from `anon` and `authenticated` roles
3. **Updated** frontend code to use API layer functions instead of direct table queries
4. **Maintained** backward compatibility for existing triggers and internal functions

### Direct Table Access → API Layer

**Before:**
```typescript
await supabase.from('dogs').select('*');
```

**After:**
```typescript
await supabase.rpc('get_dogs');
```

**Before:**
```typescript
await supabase.from('dogs').insert(dogData);
```

**After:**
```typescript
await supabase.rpc('create_dog', { p_name: ..., p_age: ..., ... });
```

## Security Benefits

### 1. Principle of Least Privilege
Users only have access to specific operations through the API, not arbitrary table access.

### 2. Authorization at Database Level
Admin checks happen in the database (`SECURITY DEFINER` functions), not just in the UI.

### 3. Audit Trail Protection
Audit log tables remain inaccessible to direct modification.

### 4. Defense in Depth
Even if RLS policies were misconfigured, the API layer provides an additional security boundary.

## Best Practices

### For Developers

1. **Never** query `dogadopt.*` tables directly from frontend code
2. **Always** use `dogadopt_api.*` views and functions
3. **Always** use schema-prefixed names in Supabase queries
4. **Test** authorization - ensure non-admins cannot call admin functions
5. **Document** new API functions when adding features

### Adding New API Functions

When adding a new operation:

1. Create the function in `dogadopt_api` schema
2. Use `SECURITY DEFINER` for privilege elevation
3. Add authorization checks (`dogadopt.has_role(...)`)
4. Set proper `search_path` to avoid ambiguity
5. Grant appropriate permissions
6. Add documentation comments
7. Update this documentation

**Example:**
```sql
CREATE OR REPLACE FUNCTION dogadopt_api.my_new_function(p_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
BEGIN
  -- Check authorization
  IF NOT dogadopt.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Do the operation
  -- ...
END;
$$;

GRANT EXECUTE ON FUNCTION dogadopt_api.my_new_function TO authenticated;

COMMENT ON FUNCTION dogadopt_api.my_new_function IS 'Description of what this function does. Requires admin role.';
```

## Troubleshooting

### "permission denied for schema dogadopt"
✅ **Solution:** Use `dogadopt_api` schema instead. The `dogadopt` schema is not directly accessible.

### "function does not exist"
✅ **Solution:** Include schema prefix: `supabase.rpc('dogadopt_api.function_name', ...)`
Or ensure the function is granted to your role.

### "Unauthorized: Admin access required"
✅ **Solution:** The operation requires admin privileges. Use `./scripts/make-admin.sh <email>` to promote a user.

### Query returns empty when data exists
✅ **Solution:** Check if the view applies filters (e.g., `dogadopt_api.dogs` only shows adoptable dogs).

## Testing

### Test Direct Table Access is Blocked

```sql
-- Should fail with permission denied
SELECT * FROM dogadopt.dogs;
```

### Test API Access Works

```sql
-- Should succeed
SELECT * FROM dogadopt_api.dogs;
```

### Test Authorization

```sql
-- Should succeed for admin
SELECT dogadopt_api.create_dog(...);

-- Should fail for non-admin user
SELECT dogadopt_api.create_dog(...);
```

## Related Documentation

- [Unified Dog Audit System](UNIFIED_DOG_AUDIT_SYSTEM.md) - How audit logging works in the data layer
- [Rescues & Locations Audit](RESCUES_LOCATIONS_AUDIT.md) - Audit logging for rescue data
- [Authentication](AUTHENTICATION.md) - User roles and permissions
- [Breed Features](BREED_FEATURES.md) - Multi-breed support system

## Future Considerations

As the application grows, consider:

1. **Versioning** - Add version prefixes to API functions (e.g., `v1_create_dog`)
2. **Rate Limiting** - Implement rate limiting for mutation operations
3. **Caching** - Add caching hints to views for better performance
4. **GraphQL** - Consider PostGraphile for auto-generated GraphQL API
5. **Monitoring** - Add logging to track API usage and performance

## Context for AI Agents

When working with this codebase:

- **DO NOT** create code that queries `dogadopt.*` tables directly from the frontend
- **DO** use `dogadopt_api.*` views and functions for all UI operations
- **DO** create new API functions for new operations, following the patterns above
- **DO** maintain separation between API layer (public interface) and data layer (internal implementation)
- **DO** check for admin role in mutation functions using `dogadopt.has_role(auth.uid(), 'admin')`
- **DO** use `SECURITY DEFINER` for API functions that need to access underlying tables

This architecture is a **critical security pattern**. Bypassing it would expose the database to unauthorized access.
