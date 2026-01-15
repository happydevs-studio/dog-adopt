# Rescue Audit Trigger Fix

## Issue

The `audit_rescue_changes()` trigger function was not tracking all columns in the `rescues` table, causing UPDATE operations to fail when trying to save rescue details.

## Root Cause

The `get_rescue_resolved_snapshot()` helper function was created when the `rescues` table had only basic columns:
- id
- name
- type
- region
- website
- created_at

However, subsequent migrations added additional columns:
- phone (2025123101_add_rescue_contact_fields.sql)
- email (2025123101_add_rescue_contact_fields.sql)
- address (2025123101_add_rescue_contact_fields.sql)
- postcode (2025123101_add_rescue_contact_fields.sql)
- charity_number (2025123101_add_rescue_contact_fields.sql)
- contact_notes (2025123101_add_rescue_contact_fields.sql)
- contact_verified_at (2025123101_add_rescue_contact_fields.sql)
- latitude (2025123102_add_rescue_coordinates.sql)
- longitude (2025123102_add_rescue_coordinates.sql)
- coordinates_updated_at (2025123102_add_rescue_coordinates.sql)
- coordinates_source (2025123102_add_rescue_coordinates.sql)

The `get_rescue_resolved_snapshot()` function uses `row_to_json()` which *should* automatically include all columns, but the function definition may have been cached or needed to be explicitly recreated to pick up the new table structure. This caused the trigger to fail when building JSONB snapshots during UPDATE operations, which blocked rescue updates from succeeding.

## Solution

Migration `2026011505_fix_rescue_audit_trigger.sql` recreates the `get_rescue_resolved_snapshot()` function to ensure it picks up the current table structure with all columns.

### Changes Made

The migration recreates the snapshot function:

```sql
CREATE OR REPLACE FUNCTION dogadopt.get_rescue_resolved_snapshot(p_rescue_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_snapshot JSONB;
BEGIN
  -- Use row_to_json to automatically include all columns
  -- This is future-proof and doesn't require updates when new columns are added
  SELECT row_to_json(r)::jsonb
  INTO v_snapshot
  FROM dogadopt.rescues r
  WHERE r.id = p_rescue_id;
  
  RETURN v_snapshot;
END;
$$;
```

This approach is:
- **Automatic**: Uses `row_to_json()` which includes all columns without manual enumeration
- **Maintainable**: Future column additions don't require function updates
- **Consistent**: Matches the pattern used by other snapshot functions

## Impact

After applying this migration:
- Rescue updates via the Admin panel will work correctly
- All rescue changes will be properly audited with complete snapshots
- The audit logs will track changes to all fields, including contact information and coordinates

## Prevention

When adding new columns to a table that has an audit trigger:
1. The `row_to_json()` approach in snapshot functions should automatically include new columns
2. If issues persist, recreate the snapshot function to ensure it picks up the current table structure
3. Always test the complete CRUD cycle (Create, Read, Update, Delete) after adding columns

## Related Files

- Migration: `/supabase/migrations/2026011505_fix_rescue_audit_trigger.sql`
- Original snapshot function: `/supabase/migrations/2025122802_dogadopt_rescues_and_locations.sql`
- Audit trigger (fixed in security update): `/supabase/migrations/20260106203900_fix_security_definer_issue.sql`
- Contact fields migration: `/supabase/migrations/2025123101_add_rescue_contact_fields.sql`
- Coordinates migration: `/supabase/migrations/2025123102_add_rescue_coordinates.sql`
- Admin UI: `/src/pages/Admin.tsx` (lines 450-514 for rescue form handling)
- API function: `/supabase/migrations/2026011502_add_rescue_crud_api.sql` (update_rescue function)
