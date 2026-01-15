# Rescue Audit Trigger Fix

## Issue

The `audit_rescue_changes()` trigger function was not tracking all columns in the `rescues` table, causing UPDATE operations to fail when trying to save rescue details.

## Root Cause

The `rescues` table was initially created with only basic columns:
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

The audit trigger function was never updated to include these new columns. This caused the trigger to fail when building the JSONB snapshots during UPDATE operations, which blocked rescue updates from succeeding.

## Solution

Migration `2026011505_fix_rescue_audit_trigger.sql` was created to update the `audit_rescue_changes()` function to include all columns when building the OLD and NEW snapshots.

### Changes Made

The trigger function now uses `row_to_json()` to automatically include ALL columns when building snapshots:

**For UPDATE operations:**
```sql
-- Get full resolved snapshots using row_to_json which includes ALL columns
old_snapshot := row_to_json(OLD)::jsonb;
new_snapshot := row_to_json(NEW)::jsonb;
```

This approach is:
- **Automatic**: Includes all columns without manual enumeration
- **Maintainable**: Future column additions don't require trigger updates
- **Consistent**: Uses the same pattern as `get_rescue_resolved_snapshot()`

Similar updates were made for DELETE operations.

## Impact

After applying this migration:
- Rescue updates via the Admin panel will work correctly
- All rescue changes will be properly audited with complete snapshots
- The audit logs will track changes to all fields, including contact information and coordinates

## Prevention

When adding new columns to a table that has an audit trigger:
1. Use `row_to_json()` in audit triggers instead of manual `jsonb_build_object()` to automatically include all columns
2. This approach is future-proof and doesn't require trigger updates when adding new columns
3. Test the complete CRUD cycle (Create, Read, Update, Delete) after adding columns

## Related Files

- Migration: `/supabase/migrations/2026011505_fix_rescue_audit_trigger.sql`
- Original trigger: `/supabase/migrations/2025122802_dogadopt_rescues_and_locations.sql`
- Contact fields migration: `/supabase/migrations/2025123101_add_rescue_contact_fields.sql`
- Coordinates migration: `/supabase/migrations/2025123102_add_rescue_coordinates.sql`
- Admin UI: `/src/pages/Admin.tsx` (lines 450-514 for rescue form handling)
- API function: `/supabase/migrations/2026011502_add_rescue_crud_api.sql` (update_rescue function)
